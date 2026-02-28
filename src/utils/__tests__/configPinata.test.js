import { pinata, pinataConfig, isPinataConfigured } from '../configPinata';

describe('Pinata Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_PINATA_JWT = 'test-jwt';
    process.env.REACT_APP_PINATA_KEY = 'test-key';
    process.env.REACT_APP_PINATA_SECRET = 'test-secret';
  });

  describe('pinata mock client', () => {
    it('should return mock hash for pinFileToIPFS', async () => {
      const result = await pinata.pinFileToIPFS();
      expect(result).toEqual({ IpfsHash: 'mock-hash' });
    });

    it('should return empty array for groups.list', async () => {
      const result = await pinata.groups.list();
      expect(result).toEqual([]);
    });

    it('should return groupId for groups.create', async () => {
      const result = await pinata.groups.create('test-group');
      expect(result).toEqual({ groupId: 'test-group' });
    });
  });

  describe('pinataConfig', () => {
    it('should have the correct configuration from env vars', () => {
      expect(pinataConfig).toEqual({
        jwt: 'test-jwt',
        apiKey: 'test-key',
        secretKey: 'test-secret',
      });
    });
  });

  describe('isPinataConfigured', () => {
    it('should return true when all env vars are set', () => {
      expect(isPinataConfigured()).toBe(true);
    });
  });
});
