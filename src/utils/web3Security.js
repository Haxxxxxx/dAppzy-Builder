import { ethers } from 'ethers';

/**
 * Validates a Web3 message signature
 * @param {string} message - The message that was signed
 * @param {string} signature - The signature to validate
 * @returns {Promise<string>} The address that signed the message
 * @throws {Error} If the signature is invalid
 */
export async function validateWeb3Message(message, signature) {
  try {
    const address = await ethers.utils.verifyMessage(message, signature);
    return address;
  } catch (error) {
    throw new Error('Invalid signature');
  }
}

/**
 * Validates a Web3 transaction
 * @param {string} txHash - The transaction hash to validate
 * @returns {Promise<Object>} The transaction details
 * @throws {Error} If the transaction is invalid
 */
export async function validateWeb3Transaction(txHash) {
  try {
    const provider = new ethers.providers.JsonRpcProvider();
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new Error('Transaction not found');
    }
    return {
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
    };
  } catch (error) {
    if (error.message === 'Transaction not found') {
      throw new Error('Transaction not found');
    }
    throw new Error('Invalid transaction');
  }
} 