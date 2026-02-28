import { isPinataConfigured } from './configPinata';
import { getAuth } from 'firebase/auth';

const CF_BASE_URL = process.env.REACT_APP_CF_BASE_URL;

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

/**
 * Pin a directory of files to IPFS via the uploadToPinata CF proxy.
 * @param {Array<{file: File|Blob, fileName: string}>} files
 * @param {object} metadata - Pinata metadata (name, keyvalues)
 * @returns {string} IPFS hash
 */
export const pinDirectoryToPinata = async (files, metadata = {}) => {
  if (!CF_BASE_URL) {
    throw new Error('REACT_APP_CF_BASE_URL not configured');
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required for IPFS upload');
  }

  // Convert files to base64 for JSON transport
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
 * Upload a single file to IPFS via the uploadToPinata CF proxy.
 * @param {File} file
 * @param {string} walletId
 * @param {string} projectName
 * @returns {object} { ipfsHash, pinSize }
 */
export const uploadFileToPinata = async (file, walletId, projectName) => {
  if (!CF_BASE_URL) {
    throw new Error('REACT_APP_CF_BASE_URL not configured');
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required for IPFS upload');
  }

  const base64Content = await fileToBase64(file);

  const response = await fetch(`${CF_BASE_URL}/uploadToPinata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      files: [{
        name: `${walletId}/${file.name}`,
        content: base64Content,
        contentType: file.type || 'application/octet-stream',
      }],
      metadata: {
        name: `${walletId}/${file.name}`,
        keyvalues: { walletId, projectName },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed: ${response.status}`);
  }

  return response.json();
};
