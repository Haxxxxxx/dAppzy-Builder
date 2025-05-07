import { ethers } from 'ethers';

/**
 * Centralized security management system
 */
export const SecurityManager = {
  /**
   * Sanitizes input to prevent XSS attacks
   * @param {string} input - The input to sanitize
   * @returns {string} The sanitized input
   */
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Validates an Ethereum address
   * @param {string} address - The address to validate
   * @returns {boolean} Whether the address is valid
   */
  validateEthAddress: (address) => {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  },

  /**
   * Validates a Solana address
   * @param {string} address - The address to validate
   * @returns {boolean} Whether the address is valid
   */
  validateSolanaAddress: (address) => {
    try {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    } catch {
      return false;
    }
  },

  /**
   * Sanitizes and validates user input
   * @param {Object} input - The input object to sanitize
   * @returns {Object} The sanitized input
   */
  sanitizeUserInput: (input) => {
    if (!input || typeof input !== 'object') return {};
    
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        sanitized[key] = SecurityManager.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = SecurityManager.sanitizeUserInput(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  /**
   * Validates a URL
   * @param {string} url - The URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  validateUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sanitizes a URL
   * @param {string} url - The URL to sanitize
   * @returns {string} The sanitized URL
   */
  sanitizeUrl: (url) => {
    if (!url || typeof url !== 'string') return '';
    
    const sanitized = SecurityManager.sanitizeInput(url);
    if (!SecurityManager.validateUrl(sanitized)) {
      return '';
    }
    return sanitized;
  }
}; 