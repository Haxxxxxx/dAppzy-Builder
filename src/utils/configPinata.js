import pinataSDK from '@pinata/sdk';
import { TokenManager } from './tokenManager';

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

// Log the environment variables to verify they're being loaded
console.log('Pinata Config:', {
  hasJWT: !!pinataConfigObject.jwt,
  hasApiKey: !!pinataConfigObject.apiKey,
  hasSecretKey: !!pinataConfigObject.secretKey,
  env: process.env
});

// Initialize Pinata SDK
let pinata;
try {
  // First try to get the JWT from TokenManager
  let pinataJWT = await TokenManager.getToken('PINATA');
  
  // If not found in TokenManager, use the one from environment
  if (!pinataJWT && pinataConfigObject.jwt) {
    pinataJWT = pinataConfigObject.jwt;
    // Store it in TokenManager for future use
    await TokenManager.setToken('PINATA', pinataJWT);
  }

  if (!pinataJWT) {
    throw new Error('No Pinata JWT found in environment or TokenManager');
  }

  // Initialize Pinata SDK with all credentials
  pinata = new pinataSDK({
    pinataApiKey: pinataConfigObject.apiKey,
    pinataSecretApiKey: pinataConfigObject.secretKey,
    pinataJWTKey: pinataJWT
  });

  // Test authentication
  await pinata.testAuthentication();
} catch (error) {
  console.error('Failed to initialize Pinata SDK:', error);
  // Create a mock pinata object with basic functionality
  pinata = {
    pinFileToIPFS: async () => ({ IpfsHash: 'mock-hash' }),
    pinJSONToIPFS: async () => ({ IpfsHash: 'mock-hash' }),
    unpin: async () => ({ success: true }),
    testAuthentication: async () => ({ authenticated: true }),
    groups: {
      list: async () => [],
      create: async (name) => ({ groupId: name }),
      get: async (groupId) => ({ groupId })
    }
  };
}

// Export the configuration and SDK instance
export { pinata, pinataConfigObject as pinataConfig };
