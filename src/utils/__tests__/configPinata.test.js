import { pinataClient, pinataSDK } from '../configPinata';

// Mock the fetch function
global.fetch = jest.fn();

describe('Pinata Configuration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset environment variables
    process.env.REACT_PINATA_JWT = 'test-jwt';
    process.env.REACT_PINATA_KEY = 'test-key';
    process.env.REACT_PINATA_SECRET = 'test-secret';
  });

  describe('pinataClient', () => {
    describe('pinFileToIPFS', () => {
      it('should upload a file successfully', async () => {
        const mockResponse = { IpfsHash: 'test-hash' };
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const result = await pinataClient.pinFileToIPFS(file);

        expect(fetch).toHaveBeenCalledWith(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          expect.objectContaining({
            method: 'POST',
            headers: {
              Authorization: 'Bearer test-jwt',
            },
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it('should throw an error on failed upload', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          statusText: 'Upload failed',
        });

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        await expect(pinataClient.pinFileToIPFS(file)).rejects.toThrow(
          'Failed to pin file to IPFS'
        );
      });
    });

    describe('groups', () => {
      describe('list', () => {
        it('should list groups successfully', async () => {
          const mockResponse = [{ id: '1', name: 'test-group' }];
          fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse),
          });

          const result = await pinataClient.groups.list();
          expect(fetch).toHaveBeenCalledWith(
            'https://api.pinata.cloud/data/groups',
            expect.objectContaining({
              method: 'GET',
              headers: {
                Authorization: 'Bearer test-jwt',
              },
            })
          );
          expect(result).toEqual(mockResponse);
        });
      });

      describe('create', () => {
        it('should create a group successfully', async () => {
          const mockResponse = { id: '1', name: 'test-group' };
          fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse),
          });

          const result = await pinataClient.groups.create('test-group');
          expect(fetch).toHaveBeenCalledWith(
            'https://api.pinata.cloud/data/groups',
            expect.objectContaining({
              method: 'POST',
              headers: {
                Authorization: 'Bearer test-jwt',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: 'test-group' }),
            })
          );
          expect(result).toEqual(mockResponse);
        });
      });

      describe('unpin', () => {
        it('should unpin a file successfully', async () => {
          fetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve('OK'),
          });

          const result = await pinataClient.groups.unpin('test-hash');
          expect(fetch).toHaveBeenCalledWith(
            'https://api.pinata.cloud/pinning/unpin/test-hash',
            expect.objectContaining({
              method: 'DELETE',
              headers: {
                Authorization: 'Bearer test-jwt',
              },
            })
          );
          expect(result).toBe('OK');
        });
      });
    });
  });

  describe('pinataSDK', () => {
    it('should have the correct configuration', () => {
      expect(pinataSDK).toEqual({
        pinata_api_key: 'test-key',
        pinata_secret_api_key: 'test-secret',
        pinata_jwt: 'test-jwt',
      });
    });
  });
}); 