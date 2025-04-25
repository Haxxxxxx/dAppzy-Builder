import { secureStore, secureRetrieve, secureRemove } from './securityUtils';

/**
 * TokenManager class for handling different types of tokens securely
 * @class
 */
export class TokenManager {
  /**
   * Enum of supported token types
   * @static
   * @type {Object}
   */
  static TOKEN_TYPES = {
    AUTH: 'auth_token',
    WEB3: 'web3_token',
    PINATA: 'pinata_token',
    FIREBASE: 'firebase_token'
  };

  /**
   * Sets a token of the specified type
   * @static
   * @param {string} type - Type of token (must be one of TOKEN_TYPES)
   * @param {string} token - The token value to store
   * @throws {Error} If the token type is invalid
   */
  static async setToken(type, token) {
    if (!this.TOKEN_TYPES[type]) {
      throw new Error(`Invalid token type: ${type}`);
    }

    // If the token matches the environment variable, we don't need to store it
    const envToken = this.getTokenFromEnv(type);
    if (envToken === token) {
      return;
    }

    try {
      await secureStore(this.TOKEN_TYPES[type], token);
    } catch (error) {
      console.warn(`Failed to securely store ${type} token, falling back to localStorage:`, error);
      localStorage.setItem(this.TOKEN_TYPES[type], token);
    }
  }

  /**
   * Retrieves a token of the specified type
   * @static
   * @param {string} type - Type of token to retrieve
   * @returns {Promise<string|null>} The token value or null if not found
   * @throws {Error} If the token type is invalid
   */
  static async getToken(type) {
    if (!this.TOKEN_TYPES[type]) {
      throw new Error(`Invalid token type: ${type}`);
    }

    // First check environment variables
    const envToken = this.getTokenFromEnv(type);
    if (envToken) {
      // Store the token for future use
      await this.setToken(type, envToken);
      return envToken;
    }

    // If not in env, try secure storage
    try {
      const token = await secureRetrieve(this.TOKEN_TYPES[type]);
      if (!token) {
        // Fallback to localStorage if secure retrieval fails
        return localStorage.getItem(this.TOKEN_TYPES[type]);
      }
      return token;
    } catch (error) {
      console.warn(`Failed to securely retrieve ${type} token, falling back to localStorage:`, error);
      return localStorage.getItem(this.TOKEN_TYPES[type]);
    }
  }

  /**
   * Gets a token from environment variables
   * @static
   * @param {string} type - Type of token to retrieve
   * @returns {string|null} The token value or null if not found
   */
  static getTokenFromEnv(type) {
    switch (type) {
      case 'PINATA':
        return process.env.REACT_PINATA_JWT;
      case 'AUTH':
        return process.env.REACT_AUTH_TOKEN;
      case 'WEB3':
        return process.env.REACT_WEB3_TOKEN;
      case 'FIREBASE':
        return process.env.REACT_FIREBASE_TOKEN;
      default:
        return null;
    }
  }

  /**
   * Removes a token of the specified type
   * @static
   * @param {string} type - Type of token to remove
   * @throws {Error} If the token type is invalid
   */
  static async removeToken(type) {
    if (!this.TOKEN_TYPES[type]) {
      throw new Error(`Invalid token type: ${type}`);
    }
    try {
      await secureRemove(this.TOKEN_TYPES[type]);
    } catch (error) {
      console.warn(`Failed to securely remove ${type} token, falling back to localStorage:`, error);
      localStorage.removeItem(this.TOKEN_TYPES[type]);
    }
  }

  /**
   * Removes all stored tokens
   * @static
   */
  static async clearAllTokens() {
    await Promise.all(
      Object.values(this.TOKEN_TYPES).map(async (type) => {
        try {
          await secureRemove(type);
        } catch (error) {
          console.warn(`Failed to securely remove token ${type}, falling back to localStorage:`, error);
          localStorage.removeItem(type);
        }
      })
    );
  }

  /**
   * Refreshes a token of the specified type
   * @static
   * @param {string} type - Type of token to refresh
   * @returns {Promise<string|null>} The new token or null if refresh fails
   * @throws {Error} If the token type is invalid or refresh is not implemented
   */
  static async refreshToken(type) {
    if (!this.TOKEN_TYPES[type]) {
      throw new Error(`Invalid token type: ${type}`);
    }
    const token = await this.getToken(type);
    if (!token) return null;

    try {
      let newToken;
      switch (type) {
        case 'AUTH':
          // Implement auth token refresh logic
          break;
        case 'WEB3':
          // Implement Web3 token refresh logic
          break;
        case 'PINATA':
          // Implement Pinata token refresh logic
          break;
        case 'FIREBASE':
          // Implement Firebase token refresh logic
          break;
        default:
          throw new Error(`Token refresh not implemented for type: ${type}`);
      }
      return newToken;
    } catch (error) {
      console.error(`Error refreshing token: ${error.message}`);
      return null;
    }
  }
} 