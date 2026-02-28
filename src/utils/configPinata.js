const validateEnv = () => {
  const requiredVars = [
    'REACT_APP_PINATA_JWT',
    'REACT_APP_PINATA_KEY',
    'REACT_APP_PINATA_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

// Initialize Pinata configuration
const pinataConfigObject = {
  jwt: process.env.REACT_APP_PINATA_JWT || '',
  apiKey: process.env.REACT_APP_PINATA_KEY || '',
  secretKey: process.env.REACT_APP_PINATA_SECRET || ''
};

// Validate configuration on import
if (!validateEnv()) {
  console.error('Pinata configuration is incomplete. Please check your environment variables.');
}

// Export a function to check if configuration is valid
export const isPinataConfigured = () => {
  return validateEnv() && pinataConfigObject.jwt && pinataConfigObject.apiKey && pinataConfigObject.secretKey;
};

const createMockPinata = () => ({
  pinFileToIPFS: async () => ({ IpfsHash: 'mock-hash' }),
  pinJSONToIPFS: async () => ({ IpfsHash: 'mock-hash' }),
  unpin: async () => ({ success: true }),
  testAuthentication: async () => ({ authenticated: true }),
  groups: {
    list: async () => [],
    create: async (name) => ({ groupId: name }),
    get: async (groupId) => ({ groupId })
  }
});

// Pinata mock client — all uploads use raw fetch via pinataConfig
export const pinata = createMockPinata();
export { pinataConfigObject as pinataConfig };
