// Pinata uploads now go through the uploadToPinata Cloud Function proxy.
// Client-side Pinata credentials are no longer required.
// This file is kept for backward compatibility with any remaining imports.

const pinataConfigObject = {
  jwt: '',
  apiKey: '',
  secretKey: ''
};

export const isPinataConfigured = () => {
  // Pinata is configured if the CF proxy endpoint is available
  return !!process.env.REACT_APP_CF_BASE_URL;
};

export const pinata = {
  pinFileToIPFS: async () => { throw new Error('Use uploadToPinata CF instead'); },
  pinJSONToIPFS: async () => { throw new Error('Use uploadToPinata CF instead'); },
  unpin: async () => { throw new Error('Use uploadToPinata CF instead'); },
  testAuthentication: async () => ({ authenticated: true }),
};

export { pinataConfigObject as pinataConfig };
