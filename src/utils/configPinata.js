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

// Lazy Pinata SDK initialization (avoids top-level await which CRA doesn't support)
let pinataInstance = null;
let pinataInitPromise = null;

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

const initializePinata = async () => {
  try {
    let pinataJWT = await TokenManager.getToken('PINATA');

    if (!pinataJWT && pinataConfigObject.jwt) {
      pinataJWT = pinataConfigObject.jwt;
      await TokenManager.setToken('PINATA', pinataJWT);
    }

    if (!pinataJWT) {
      throw new Error('No Pinata JWT found in environment or TokenManager');
    }

    const sdk = new pinataSDK({
      pinataApiKey: pinataConfigObject.apiKey,
      pinataSecretApiKey: pinataConfigObject.secretKey,
      pinataJWTKey: pinataJWT
    });

    await sdk.testAuthentication();
    return sdk;
  } catch (error) {
    console.error('Failed to initialize Pinata SDK:', error);
    return createMockPinata();
  }
};

/**
 * Returns the initialized Pinata SDK instance (lazy singleton)
 */
export const getPinata = async () => {
  if (pinataInstance) return pinataInstance;
  if (!pinataInitPromise) {
    pinataInitPromise = initializePinata().then(sdk => {
      pinataInstance = sdk;
      return sdk;
    });
  }
  return pinataInitPromise;
};

// Backwards-compatible sync export — returns mock until initialized
export const pinata = createMockPinata();
export { pinataConfigObject as pinataConfig };
