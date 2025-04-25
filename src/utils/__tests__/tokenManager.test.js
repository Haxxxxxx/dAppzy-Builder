import { TokenManager } from '../tokenManager';
import { secureStore, secureRetrieve, secureRemove } from '../securityUtils';

// Mock the securityUtils
jest.mock('../securityUtils', () => ({
  secureStore: jest.fn(),
  secureRetrieve: jest.fn(),
  secureRemove: jest.fn(),
}));

describe('TokenManager', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('setToken', () => {
    it('should store a valid token', () => {
      TokenManager.setToken('AUTH', 'test-token');
      expect(secureStore).toHaveBeenCalledWith('auth_token', 'test-token');
    });

    it('should throw an error for an invalid type', () => {
      expect(() => TokenManager.setToken('INVALID', 'test-token')).toThrow(
        'Invalid token type: INVALID'
      );
    });
  });

  describe('getToken', () => {
    it('should retrieve a valid token', () => {
      secureRetrieve.mockReturnValue('test-token');
      const result = TokenManager.getToken('AUTH');
      expect(result).toBe('test-token');
      expect(secureRetrieve).toHaveBeenCalledWith('auth_token');
    });

    it('should throw an error for an invalid type', () => {
      expect(() => TokenManager.getToken('INVALID')).toThrow(
        'Invalid token type: INVALID'
      );
    });
  });

  describe('removeToken', () => {
    it('should remove a valid token', () => {
      TokenManager.removeToken('AUTH');
      expect(secureRemove).toHaveBeenCalledWith('auth_token');
    });

    it('should throw an error for an invalid type', () => {
      expect(() => TokenManager.removeToken('INVALID')).toThrow(
        'Invalid token type: INVALID'
      );
    });
  });

  describe('clearAllTokens', () => {
    it('should remove all tokens', () => {
      TokenManager.clearAllTokens();
      expect(secureRemove).toHaveBeenCalledWith('auth_token');
      expect(secureRemove).toHaveBeenCalledWith('web3_token');
      expect(secureRemove).toHaveBeenCalledWith('pinata_token');
      expect(secureRemove).toHaveBeenCalledWith('firebase_token');
    });
  });

  describe('refreshToken', () => {
    it('should throw an error for an invalid type', async () => {
      await expect(TokenManager.refreshToken('INVALID')).rejects.toThrow(
        'Invalid token type: INVALID'
      );
    });

    it('should handle refresh errors gracefully', async () => {
      secureRetrieve.mockReturnValue('test-token');
      const result = await TokenManager.refreshToken('AUTH');
      expect(result).toBe('test-token');
    });
  });
}); 