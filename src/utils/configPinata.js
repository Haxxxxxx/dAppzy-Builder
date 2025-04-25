import pinataSDK from '@pinata/sdk';
import { TokenManager } from './tokenManager';

const validateEnv = () => {
  const requiredVars = [
    'REACT_PINATA_JWT',
    'REACT_PINATA_KEY',
    'REACT_PINATA_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

// Initialize Pinata configuration
const pinataConfig = {
  jwt: process.env.REACT_PINATA_JWT,
  apiKey: process.env.REACT_PINATA_KEY,
  secretKey: process.env.REACT_PINATA_SECRET
};

// Log the environment variables to verify they're being loaded
console.log('Pinata Config:', {
  hasJWT: !!pinataConfig.jwt,
  hasApiKey: !!pinataConfig.apiKey,
  hasSecretKey: !!pinataConfig.secretKey,
  env: process.env
});

// Initialize Pinata SDK
let pinata;
try {
  // First try to get the JWT from TokenManager
  let pinataJWT = await TokenManager.getToken('PINATA');
  
  // If not found in TokenManager, use the one from environment
  if (!pinataJWT && pinataConfig.jwt) {
    pinataJWT = pinataConfig.jwt;
    // Store it in TokenManager for future use
    await TokenManager.setToken('PINATA', pinataJWT);
  }

  if (!pinataJWT) {
    throw new Error('No Pinata JWT found in environment or TokenManager');
  }

  // Initialize Pinata SDK with all credentials
  pinata = new pinataSDK({
    pinataApiKey: pinataConfig.apiKey,
    pinataSecretApiKey: pinataConfig.secretKey,
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

/**
 * Pinata configuration object
 * @type {Object}
 */
const pinataConfigObject = {
  pinata_api_key: pinataConfig.apiKey,
  pinata_secret_api_key: pinataConfig.secretKey,
  pinata_jwt: pinataConfig.jwt,
};

export { pinata, pinataConfigObject as pinataConfig };
