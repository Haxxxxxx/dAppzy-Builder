import { pinataConfig, isPinataConfigured } from './configPinata';

const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Validates Pinata configuration before making API calls
 * @throws {Error} If Pinata configuration is invalid
 */
const validatePinataConfig = () => {
  if (!isPinataConfigured()) {
    throw new Error('Invalid Pinata configuration: Please check your environment variables (REACT_APP_PINATA_JWT, REACT_APP_PINATA_KEY, REACT_APP_PINATA_SECRET)');
  }
};

/**
 * Pins a directory of files to IPFS using Pinata
 * @param {Array} files - Array of file objects with {file, fileName} properties
 * @param {Object} metadata - Metadata to attach to the pin
 * @returns {Promise<string>} - The IPFS hash of the pinned content
 */
export async function pinDirectoryToPinata(files, metadata) {
  try {
    validatePinataConfig();
    console.log('Starting Pinata upload...');
    
    const formData = new FormData();
    
    // Append the file (use Blob directly)
    formData.append('file', files[0].file, files[0].fileName);
    
    // Add metadata if provided
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify(metadata));
    }

    console.log('Uploading to Pinata:', {
      fileName: files[0].fileName,
      fileSize: files[0].file.size,
      metadata: metadata
    });

    const response = await fetch(PINATA_PIN_FILE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataConfig.jwt}`
      },
      body: formData
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
        console.error('Pinata error details:', errorData);
        
        if (response.status === 401) {
          throw new Error('Pinata authentication failed. Please check your API credentials.');
        } else if (response.status === 413) {
          throw new Error('File size too large for Pinata upload.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded for Pinata API.');
        }
      } catch (e) {
        console.error('Error parsing Pinata response:', e);
      }
      throw new Error(`Pinata API error: ${errorData?.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Pinata upload response:', data);

    if (!data.IpfsHash) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    // Return just the hash
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

/**
 * Uploads a single file to IPFS using Pinata
 * @param {File} file - The file to upload
 * @param {string} walletId - The wallet ID to associate with the upload
 * @param {string} projectName - The project name to associate with the upload
 * @returns {Promise<Object>} - The Pinata response object
 */
export async function uploadFileToPinata(file, walletId, projectName) {
  try {
    validatePinataConfig();
    const url = PINATA_PIN_FILE_URL;
    const formData = new FormData();
    formData.append('file', file);

    // Attach metadata
    const metadata = {
      name: `${walletId}/${file.name}`,
      keyvalues: {
        walletId: walletId,
        projectName: projectName,
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataConfig.jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
        console.error('Pinata error details:', errorData);
        
        if (response.status === 401) {
          throw new Error('Pinata authentication failed. Please check your API credentials.');
        }
      } catch (e) {
        console.error('Error parsing Pinata response:', e);
      }
      throw new Error(`Pinata API error: ${errorData?.error || response.statusText}`);
    }

    const data = await response.json();
    console.log("Pinata upload response:", data);
    return data;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
} 