import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock crypto-js for encryptData/decryptData
vi.mock('crypto-js', () => {
  const encrypt = vi.fn((data, key) => ({ toString: () => `encrypted:${data}:${key}` }));
  const decrypt = vi.fn((data, key) => ({
    toString: () => {
      const parts = data.split(':');
      return parts.length >= 2 ? parts[1] : data;
    },
  }));
  return {
    default: {
      AES: { encrypt, decrypt },
      enc: { Utf8: 'utf8' },
    },
    AES: { encrypt, decrypt },
    enc: { Utf8: 'utf8' },
  };
});

import {
  encryptData,
  secureStore,
  secureRetrieve,
  secureRemove,
  sanitizeInput,
  validateEthAddress,
  validateApiResponse,
} from '../securityUtils';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('Security Utilities', () => {
  const testKey = 'test-encryption-key-32-chars-long!';
  const testData = 'sensitive-data-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('encryptData', () => {
    it('should encrypt data successfully', () => {
      const encrypted = encryptData(testData, testKey);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });

    it('should throw an error when key is missing', () => {
      expect(() => encryptData(testData)).toThrow('Encryption key is required');
    });
  });

  describe('secureStore', () => {
    it('should throw when VITE_ENCRYPTION_KEY is not set', async () => {
      import.meta.env.VITE_ENCRYPTION_KEY = '';
      await expect(secureStore('test-key', testData)).rejects.toThrow(
        'Encryption key is required for secure storage'
      );
    });
  });

  describe('secureRetrieve', () => {
    it('should throw when VITE_ENCRYPTION_KEY is not set', async () => {
      import.meta.env.VITE_ENCRYPTION_KEY = '';
      await expect(secureRetrieve('test-key')).rejects.toThrow(
        'Encryption key is required for secure retrieval'
      );
    });

    it('should return null for non-existent key', async () => {
      import.meta.env.VITE_ENCRYPTION_KEY = 'test-key-123';
      localStorage.getItem.mockReturnValueOnce(null);
      const result = await secureRetrieve('non-existent-key');
      expect(result).toBeNull();
    });
  });

  describe('secureRemove', () => {
    it('should remove data from localStorage', () => {
      secureRemove('test-key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      const input = '<script>alert("test")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('scriptalert("test")/script');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
    });
  });

  describe('validateEthAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        '0x0000000000000000000000000000000000000000',
        '0x1111111111111111111111111111111111111111',
      ];
      validAddresses.forEach((address) => {
        expect(validateEthAddress(address)).toBe(true);
      });
    });

    it('should reject invalid Ethereum addresses', () => {
      const invalidAddresses = [
        '0x123',
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44',
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44g',
        '742d35Cc6634C0532925a3b844Bc454e4438f44e',
        '',
        null,
        undefined,
      ];
      invalidAddresses.forEach((address) => {
        expect(validateEthAddress(address)).toBe(false);
      });
    });
  });

  describe('validateApiResponse', () => {
    it('should remove sensitive data from response', () => {
      const response = {
        data: 'some data',
        password: 'secret123',
        token: 'jwt-token',
        apiKey: 'api-key-123',
        secret: 'secret-key',
      };
      const validated = validateApiResponse(response);
      expect(validated).not.toHaveProperty('password');
      expect(validated).not.toHaveProperty('token');
      expect(validated).not.toHaveProperty('apiKey');
      expect(validated).not.toHaveProperty('secret');
      expect(validated).toHaveProperty('data');
    });

    it('should handle nested sensitive data', () => {
      const response = {
        user: {
          name: 'John Doe',
          password: 'secret123',
          credentials: {
            token: 'jwt-token',
            apiKey: 'api-key-123',
          },
        },
      };
      const validated = validateApiResponse(response);
      expect(validated.user).not.toHaveProperty('password');
      expect(validated.user.credentials).not.toHaveProperty('token');
      expect(validated.user.credentials).not.toHaveProperty('apiKey');
      expect(validated.user).toHaveProperty('name');
    });

    it('should throw an error for invalid response', () => {
      expect(() => validateApiResponse(null)).toThrow('Invalid API response');
      expect(() => validateApiResponse('string')).toThrow('Invalid API response');
    });
  });
});
