import { getAuth } from 'firebase/auth';

const CF_BASE_URL = import.meta.env.VITE_CF_BASE_URL;
const BUILDER_CF_BASE_URL = import.meta.env.VITE_BUILDER_CF_BASE_URL;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

/**
 * Convert a File/Blob to base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Get Firebase auth token for CF authentication
 */
const getAuthToken = async () => {
  const auth = getAuth();
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
};

const ensureConfig = () => {
  if (!CF_BASE_URL) throw new Error('VITE_CF_BASE_URL not configured');
};

const ensureAuth = async () => {
  const token = await getAuthToken();
  if (!token) throw new Error('Authentication required. Please sign in again.');
  return token;
};

/**
 * Build the user-scoped file name for Pinata storage.
 * Format: {userId}/{projectName}/{fileName}
 */
export const buildScopedName = (userId, projectName, fileName) =>
  `${userId}/${projectName}/${fileName}`;

/**
 * Build the full gateway URL for an IPFS hash.
 */
export const getGatewayUrl = (ipfsHash) => `${GATEWAY_URL}/${ipfsHash}`;

/**
 * Pin a directory of files to IPFS via the uploadToPinata CF proxy.
 * @param {Array<{file: File|Blob, fileName: string}>} files
 * @param {object} metadata - Pinata metadata (name, keyvalues)
 * @returns {string} IPFS hash
 */
export const pinDirectoryToPinata = async (files, metadata = {}) => {
  ensureConfig();
  const token = await ensureAuth();

  const encodedFiles = await Promise.all(
    files.map(async ({ file, fileName }) => ({
      name: fileName,
      content: await fileToBase64(file),
      contentType: file.type || 'application/octet-stream',
    }))
  );

  const response = await fetch(`${CF_BASE_URL}/uploadToPinata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      files: encodedFiles,
      metadata,
      options: { wrapWithDirectory: true },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Authentication failed. Please sign in again.');
    if (response.status === 413) throw new Error('Upload too large. Please reduce file sizes.');
    if (response.status === 429) throw new Error('Rate limit exceeded. Please wait and try again.');
    throw new Error(errorData.error || `Upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.ipfsHash;
};

/**
 * Upload a single file via the Builder-side pinFileToIPFS Cloud Function.
 * This keeps the Pinata API key server-side only.
 */
const uploadViaPinFileToIPFS = async (file, userId, projectName, token) => {
  const scopedName = buildScopedName(userId, projectName, file.name);
  const base64Content = await fileToBase64(file);

  const response = await fetch(`${BUILDER_CF_BASE_URL}/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: scopedName,
      content: base64Content,
      contentType: file.type || 'application/octet-stream',
      metadata: {
        name: scopedName,
        keyvalues: { userId, projectName },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Authentication failed. Please sign in again.');
    if (response.status === 413) throw new Error('Upload too large. Please reduce file size.');
    if (response.status === 429) throw new Error('Upload limit reached. Please wait and try again.');
    throw new Error(errorData.error || `Upload failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Upload a single file via the legacy uploadToPinata endpoint (ThirdSpaceCMS).
 * Used as a fallback when the Builder CF is unavailable.
 */
const uploadViaLegacyProxy = async (file, userId, projectName, token) => {
  const scopedName = buildScopedName(userId, projectName, file.name);
  const base64Content = await fileToBase64(file);

  const response = await fetch(`${CF_BASE_URL}/uploadToPinata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      files: [{
        name: scopedName,
        content: base64Content,
        contentType: file.type || 'application/octet-stream',
      }],
      metadata: {
        name: scopedName,
        keyvalues: { userId, projectName },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Upload a single file to IPFS, scoped to a user + project partition.
 * Tries the Builder-side pinFileToIPFS CF first; falls back to the legacy
 * uploadToPinata endpoint for development/testing or if the new CF is down.
 * @param {File} file
 * @param {string} userId - Firebase UID or wallet address
 * @param {string} projectName
 * @returns {object} { ipfsHash, pinSize }
 */
export const uploadFileToPinata = async (file, userId, projectName) => {
  const token = await ensureAuth();

  // Primary path: Builder-side CF (Pinata key stays server-side)
  if (BUILDER_CF_BASE_URL) {
    try {
      return await uploadViaPinFileToIPFS(file, userId, projectName, token);
    } catch (err) {
      // Auth / rate-limit errors should not fall through — re-throw immediately
      if (err.message.includes('Authentication') || err.message.includes('limit reached')) {
        throw err;
      }
      if (import.meta.env.DEV) console.warn('[ipfs] pinFileToIPFS failed, falling back to legacy proxy:', err.message);
    }
  }

  // Fallback: legacy ThirdSpaceCMS proxy
  ensureConfig();
  return uploadViaLegacyProxy(file, userId, projectName, token);
};

/**
 * List media files pinned for a specific user + project.
 * @param {string} userId
 * @param {string} projectName
 * @returns {Array} rows from Pinata
 */
export const listPinataMedia = async (userId, projectName) => {
  ensureConfig();
  const token = await ensureAuth();

  const res = await fetch(
    `${CF_BASE_URL}/listPinataMedia?userId=${encodeURIComponent(userId)}&projectName=${encodeURIComponent(projectName)}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error(`List media failed: ${res.status} ${res.statusText}`);
  }

  const { rows } = await res.json();
  return rows;
};

/**
 * Delete (unpin) a media file from Pinata.
 * @param {string} ipfsHash
 */
export const deletePinataMedia = async (ipfsHash) => {
  ensureConfig();
  const token = await ensureAuth();

  const res = await fetch(`${CF_BASE_URL}/deletePinataMedia`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ hash: ipfsHash }),
  });

  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};
