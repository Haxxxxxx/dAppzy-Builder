import { PublicKey } from '@solana/web3.js';
import { Web3Configs } from '../../../../configs/Web3/Web3Configs';

// SNS Program IDs
export const SNS_DOMAIN_PROGRAM = new PublicKey('namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX');
export const SNS_DOMAIN_REGISTRY = new PublicKey('namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX');
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// RPC Configuration
export const RPC_ENDPOINTS = Web3Configs.rpc.getEndpoints();

export const FALLBACK_ENDPOINTS = {
  mainnet: [
    Web3Configs.rpc.helius.getUrl(),
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana'
  ].filter(Boolean)
};

export const MAINNET_CONFIG = {
  endpoint: Web3Configs.rpc.helius.getUrl() || 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed',
  wsEndpoint: Web3Configs.rpc.helius.snsConfig.wsEndpoint() || 'wss://api.mainnet-beta.solana.com',
  confirmTransactionInitialTimeout: 60000
};

export const CONNECTION_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 10000
};

// Helius Error Codes
export const HELIUS_ERROR_CODES = {
  RATE_LIMIT: 429,
  INVALID_API_KEY: 401,
  FORBIDDEN: 403
};

// SNS API Configuration
export const SNS_API_CONFIG = {
  BASE_URL: 'https://api.bonfida.com',
  ENDPOINTS: {
    DOMAINS: '/v1/domains',
    REVERSE_LOOKUP: '/v1/reverse-lookup',
    DOMAIN_DATA: '/v1/domain-data'
  },
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

export const SNS_GRAPHQL_ENDPOINT = 'https://api.bonfida.com/graphql';

// GraphQL Queries
export const QUERIES = {
  GET_DOMAINS: `
    query GetDomains($owner: String!) {
      domains(owner: $owner) {
        name
        owner
        parent
        class
        tld
      }
    }
  `,
  GET_REVERSE_LOOKUP: `
    query GetReverseLookup($wallet: String!) {
      reverseLookup(wallet: $wallet) {
        domains {
          name
          owner
          parent
          class
          tld
        }
      }
    }
  `
};

// Connection Status Types
export const CONNECTION_STATUS = {
  INITIALIZING: 'initializing',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RETRYING: 'retrying'
};

// Error Types
export const ERROR_TYPES = {
  NO_API_KEY: 'NO_API_KEY',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_WALLET: 'INVALID_WALLET',
  NO_DOMAINS: 'NO_DOMAINS'
}; 