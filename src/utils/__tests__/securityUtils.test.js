import {
  encryptData,
  decryptData,
  secureStore,
  secureRetrieve,
  secureRemove,
  sanitizeInput,
  validateEthAddress,
  validateApiResponse,
} from '../securityUtils';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('Security Utilities', () => {
  const testKey = 'test-encryption-key-32-chars-long!';
  const testData = 'sensitive-data-123';

  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('decryptData', () => {
    it('should decrypt data successfully', () => {
      const encrypted = encryptData(testData, testKey);
      const decrypted = decryptData(encrypted, testKey);
      expect(decrypted).toBe(testData);
    });

    it('should throw an error when key is missing', () => {
      const encrypted = encryptData(testData, testKey);
      expect(() => decryptData(encrypted)).toThrow('Encryption key is required');
    });
  });

  describe('secureStore', () => {
    it('should store data securely', () => {
      secureStore('test-key', testData, testKey);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should throw an error when key is missing', () => {
      expect(() => secureStore('test-key', testData)).toThrow(
        'Encryption key is required for secure storage'
      );
    });
  });

  describe('secureRetrieve', () => {
    it('should retrieve data securely', () => {
      localStorage.getItem.mockReturnValueOnce('encrypted-data');
      secureRetrieve('test-key', testKey);
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent key', () => {
      localStorage.getItem.mockReturnValueOnce(null);
      const result = secureRetrieve('non-existent-key', testKey);
      expect(result).toBeNull();
    });

    it('should throw an error when key is missing', () => {
      expect(() => secureRetrieve('test-key')).toThrow(
        'Encryption key is required for secure retrieval'
      );
    });
  });

  describe('secureRemove', () => {
    it('should remove data', () => {
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
        '0x1111111111111111111111111111111111111111'
      ];
      validAddresses.forEach(address => {
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
        undefined
      ];
      invalidAddresses.forEach(address => {
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
        secret: 'secret-key'
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
            apiKey: 'api-key-123'
          }
        }
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