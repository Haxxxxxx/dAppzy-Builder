import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TokenManager } from '../tokenManager';
import { secureStore, secureRetrieve, secureRemove } from '../securityUtils';

// Mock the securityUtils
vi.mock('../securityUtils', () => ({
  secureStore: vi.fn().mockResolvedValue(undefined),
  secureRetrieve: vi.fn().mockResolvedValue(null),
  secureRemove: vi.fn().mockResolvedValue(undefined),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

describe('TokenManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars
    import.meta.env.VITE_WEB3_TOKEN = undefined;
    import.meta.env.VITE_FIREBASE_TOKEN = undefined;
  });

  describe('setToken', () => {
    it('should store a valid token', async () => {
      await TokenManager.setToken('AUTH', 'test-token');
      expect(secureStore).toHaveBeenCalledWith('auth_token', 'test-token');
    });

    it('should throw an error for an invalid type', async () => {
      await expect(TokenManager.setToken('INVALID', 'test-token')).rejects.toThrow(
        'Invalid token type: INVALID'
      );
    });
  });

  describe('getToken', () => {
    it('should retrieve a valid token from secure storage', async () => {
      secureRetrieve.mockResolvedValue('test-token');
      const result = await TokenManager.getToken('AUTH');
      expect(result).toBe('test-token');
      expect(secureRetrieve).toHaveBeenCalledWith('auth_token');
    });

    it('should fall back to localStorage when secure retrieval returns null', async () => {
      secureRetrieve.mockResolvedValue(null);
      localStorageMock.getItem.mockReturnValue('fallback-token');
      const result = await TokenManager.getToken('AUTH');
      expect(result).toBe('fallback-token');
    });

    it('should throw an error for an invalid type', async () => {
      await expect(TokenManager.getToken('INVALID')).rejects.toThrow(
        'Invalid token type: INVALID'
      );
    });
  });

  describe('removeToken', () => {
    it('should remove a valid token', async () => {
      await TokenManager.removeToken('AUTH');
      expect(secureRemove).toHaveBeenCalledWith('auth_token');
    });

    it('should throw an error for an invalid type', async () => {
      await expect(TokenManager.removeToken('INVALID')).rejects.toThrow(
        'Invalid token type: INVALID'
      );
    });
  });

  describe('clearAllTokens', () => {
    it('should remove all tokens', async () => {
      await TokenManager.clearAllTokens();
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

    it('should return undefined when no token is found', async () => {
      secureRetrieve.mockResolvedValue(null);
      localStorageMock.getItem.mockReturnValue(null);
      const result = await TokenManager.refreshToken('AUTH');
      expect(result).toBeNull();
    });
  });
});
