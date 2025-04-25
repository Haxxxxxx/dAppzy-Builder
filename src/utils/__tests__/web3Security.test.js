import { ethers } from 'ethers';
import { validateWeb3Message, validateWeb3Transaction } from '../web3Security';

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      parseEther: jest.fn().mockReturnValue('1000000000000000000'),
      verifyMessage: jest.fn().mockReturnValue('0x1234567890123456789012345678901234567890'),
    },
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
        getTransaction: jest.fn().mockResolvedValue({
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          value: '1000000000000000000',
        }),
      })),
    },
  },
}));

describe('Web3 Security', () => {
  describe('validateWeb3Message', () => {
    it('should validate a message signature', async () => {
      const message = 'Test message';
      const signature = '0x1234567890123456789012345678901234567890';
      const expectedAddress = '0x1234567890123456789012345678901234567890';

      const result = await validateWeb3Message(message, signature);
      expect(result).toBe(expectedAddress);
      expect(ethers.utils.verifyMessage).toHaveBeenCalledWith(message, signature);
    });

    it('should throw an error for invalid signature', async () => {
      ethers.utils.verifyMessage.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        validateWeb3Message('Test message', 'invalid-signature')
      ).rejects.toThrow('Invalid signature');
    });
  });

  describe('validateWeb3Transaction', () => {
    it('should validate a transaction', async () => {
      const txHash = '0x1234567890123456789012345678901234567890';
      const expectedFrom = '0x1234567890123456789012345678901234567890';
      const expectedTo = '0x0987654321098765432109876543210987654321';
      const expectedValue = '1000000000000000000';

      const result = await validateWeb3Transaction(txHash);
      expect(result).toEqual({
        from: expectedFrom,
        to: expectedTo,
        value: expectedValue,
      });
    });

    it('should throw an error for invalid transaction', async () => {
      ethers.providers.JsonRpcProvider.mockImplementationOnce(() => ({
        getTransaction: jest.fn().mockRejectedValue(new Error('Transaction not found')),
      }));

      await expect(
        validateWeb3Transaction('invalid-tx-hash')
      ).rejects.toThrow('Transaction not found');
    });
  });
}); 