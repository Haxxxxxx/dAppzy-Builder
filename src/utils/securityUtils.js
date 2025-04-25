import CryptoJS from 'crypto-js';

/**
 * Encrypts sensitive data using AES-256-CBC
 * @param {string} data - The data to encrypt
 * @param {string} key - The encryption key (should be from environment variables)
 * @returns {string} The encrypted data
 */
export const encryptData = (data, key) => {
  if (!key) {
    throw new Error('Encryption key is required');
  }
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypts sensitive data using AES-256-CBC
 * @param {string} encryptedData - The encrypted data
 * @param {string} key - The encryption key (should be from environment variables)
 * @returns {string} The decrypted data
 */
export const decryptData = (encryptedData, key) => {
  if (!key) {
    throw new Error('Encryption key is required');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Encrypts and stores data securely
 * @param {string} key - The key to store the data under
 * @param {string} data - The data to store
 * @throws {Error} If encryption key is not available
 */
export const secureStore = async (key, data) => {
  const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('Encryption key is required for secure storage');
  }

  try {
    // Convert encryption key to 256-bit key using SHA-256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKey);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', keyData);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generate IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Convert data to string if it's not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Encrypt data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encoder.encode(dataString)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 using a safe method
    const base64Data = btoa(String.fromCharCode.apply(null, combined))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    localStorage.setItem(key, base64Data);
  } catch (error) {
    console.error('Error in secureStore:', error);
    throw error;
  }
};

/**
 * Retrieves and decrypts data
 * @param {string} key - The key to retrieve the data from
 * @returns {string|null} The decrypted data or null if not found
 */
export const secureRetrieve = async (key) => {
  const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('Encryption key is required for secure retrieval');
  }

  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) return null;

    // Convert encryption key to 256-bit key using SHA-256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKey);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', keyData);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Convert base64 back to Uint8Array using a safe method
    const binaryString = atob(storedData.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Split IV and encrypted data
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    // Decrypt data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encryptedData
    );

    const decodedData = new TextDecoder().decode(decryptedData);
    try {
      return JSON.parse(decodedData);
    } catch {
      return decodedData;
    }
  } catch (error) {
    console.error('Error in secureRetrieve:', error);
    return null;
  }
};

/**
 * Removes securely stored data
 * @param {string} key - The key to remove
 */
export const secureRemove = (key) => {
  localStorage.removeItem(key);
};

/**
 * Validates and sanitizes input data
 * @param {string} input - The input to sanitize
 * @returns {string} The sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, ''); // Remove angle brackets to prevent XSS
};

/**
 * Validates Ethereum addresses
 * @param {string} address - The address to validate
 * @returns {boolean} Whether the address is valid
 */
export const validateEthAddress = (address) => {
  if (typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validates API responses for sensitive data
 * @param {object} response - The API response to validate
 * @returns {object} The validated response
 */
export const validateApiResponse = (response) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response');
  }
  
  // Remove any sensitive data that might have been accidentally included
  const sensitiveKeys = ['password', 'secret', 'key', 'token', 'jwt', 'apiKey'];
  const sanitizedResponse = { ...response };
  
  const removeSensitiveData = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      if (sensitiveKeys.includes(key)) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        removeSensitiveData(obj[key]);
      }
    });
  };
  
  removeSensitiveData(sanitizedResponse);
  return sanitizedResponse;
}; 