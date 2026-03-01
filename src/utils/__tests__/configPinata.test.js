import { vi, describe, it, expect, beforeEach } from 'vitest';
import { pinata, pinataConfig, isPinataConfigured } from '../configPinata';

describe('Pinata Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pinata proxy client', () => {
    it('should throw for pinFileToIPFS (redirects to CF proxy)', async () => {
      await expect(pinata.pinFileToIPFS()).rejects.toThrow('Use uploadToPinata CF instead');
    });

    it('should throw for pinJSONToIPFS (redirects to CF proxy)', async () => {
      await expect(pinata.pinJSONToIPFS()).rejects.toThrow('Use uploadToPinata CF instead');
    });

    it('should return authenticated for testAuthentication', async () => {
      const result = await pinata.testAuthentication();
      expect(result).toEqual({ authenticated: true });
    });
  });

  describe('pinataConfig', () => {
    it('should export empty config (credentials are server-side)', () => {
      expect(pinataConfig).toEqual({
        jwt: '',
        apiKey: '',
        secretKey: '',
      });
    });
  });

  describe('isPinataConfigured', () => {
    it('should return true when VITE_CF_BASE_URL is set', () => {
      import.meta.env.VITE_CF_BASE_URL = 'https://us-central1-project.cloudfunctions.net';
      expect(isPinataConfigured()).toBe(true);
    });

    it('should return false when VITE_CF_BASE_URL is not set', () => {
      import.meta.env.VITE_CF_BASE_URL = '';
      expect(isPinataConfigured()).toBe(false);
    });
  });
});
