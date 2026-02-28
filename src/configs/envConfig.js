import { secureStore, secureRetrieve } from '../utils/securityUtils';

// Pinata Configuration
export const pinataConfig = {
  jwt: process.env.REACT_APP_PINATA_JWT,
  gatewayUrl: process.env.REACT_APP_GATEWAY_URL,
  apiKey: process.env.REACT_APP_PINATA_KEY,
  secretKey: process.env.REACT_APP_PINATA_SECRET,
};

// UD Configuration (client ID for login — JWT is server-side only)
export const udConfig = {
  clientId: process.env.REACT_APP_UD_CLIENT_ID,
  redirectUri: process.env.REACT_APP_UD_REDIRECT_URI,
};

// API Configuration
export const apiConfig = {
  reverseLookupUrl: process.env.REACT_APP_REVERSE_LOOKUP_URL,
  cfBaseUrl: process.env.REACT_APP_CF_BASE_URL,
};

// Security Configuration
const SECURE_STORAGE_KEY = 'app_config';
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

// Validate required environment variables
export const validateEnv = () => {
  const requiredVars = {
    REACT_APP_CF_BASE_URL: apiConfig.cfBaseUrl,
    REACT_APP_REVERSE_LOOKUP_URL: apiConfig.reverseLookupUrl,
    REACT_APP_ENCRYPTION_KEY: ENCRYPTION_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error('Missing required environment variables');
  }
};

// Store configuration securely
export const storeConfig = () => {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key is required for secure storage');
  }

  const config = {
    pinata: pinataConfig,
    ud: udConfig,
    api: apiConfig,
  };

  secureStore(SECURE_STORAGE_KEY, config, ENCRYPTION_KEY);
};

// Retrieve configuration securely
export const getConfig = () => {
  validateEnv();

  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key is required for secure retrieval');
  }

  const storedConfig = secureRetrieve(SECURE_STORAGE_KEY, ENCRYPTION_KEY);
  if (storedConfig) {
    return storedConfig;
  }

  const config = {
    pinata: pinataConfig,
    ud: udConfig,
    api: apiConfig,
  };

  storeConfig();
  return config;
};
