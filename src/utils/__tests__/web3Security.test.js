import { vi, describe, it, expect } from 'vitest';

const { mockGetTransaction, mockVerifyMessage } = vi.hoisted(() => ({
  mockGetTransaction: vi.fn(),
  mockVerifyMessage: vi.fn().mockReturnValue('0x1234567890123456789012345678901234567890'),
}));

vi.mock('ethers', () => {
  function MockJsonRpcProvider() {
    this.getTransaction = mockGetTransaction;
  }
  return {
    ethers: {
      verifyMessage: mockVerifyMessage,
      JsonRpcProvider: MockJsonRpcProvider,
    },
  };
});

import { ethers } from 'ethers';
import { validateWeb3Message, validateWeb3Transaction } from '../web3Security';

describe('Web3 Security', () => {
  describe('validateWeb3Message', () => {
    it('should validate a message signature', async () => {
      const message = 'Test message';
      const signature = '0xabcdef';
      const expectedAddress = '0x1234567890123456789012345678901234567890';

      const result = await validateWeb3Message(message, signature);
      expect(result).toBe(expectedAddress);
      expect(ethers.verifyMessage).toHaveBeenCalledWith(message, signature);
    });

    it('should throw an error for invalid signature', async () => {
      mockVerifyMessage.mockImplementationOnce(() => {
        throw new Error('bad sig');
      });

      await expect(
        validateWeb3Message('Test message', 'invalid-signature')
      ).rejects.toThrow('Invalid signature');
    });
  });

  describe('validateWeb3Transaction', () => {
    it('should validate a transaction', async () => {
      mockGetTransaction.mockResolvedValue({
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: { toString: () => '1000000000000000000' },
      });

      const result = await validateWeb3Transaction('0xtxhash');
      expect(result).toEqual({
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: '1000000000000000000',
      });
    });

    it('should throw when transaction is not found', async () => {
      mockGetTransaction.mockResolvedValue(null);

      await expect(
        validateWeb3Transaction('0xinvalid')
      ).rejects.toThrow('Transaction not found');
    });

    it('should throw generic error for provider failures', async () => {
      mockGetTransaction.mockRejectedValue(new Error('network error'));

      await expect(
        validateWeb3Transaction('0xbad')
      ).rejects.toThrow('Invalid transaction');
    });
  });
});
