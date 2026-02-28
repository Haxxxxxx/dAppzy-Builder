/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} str - The string to escape
 * @returns {string} - Escaped string
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Escapes a string for use inside an HTML attribute value (double-quoted)
 * @param {string} str - The string to escape
 * @returns {string} - Escaped string safe for attribute context
 */
export const escapeAttr = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Escapes a string for use inside a JavaScript string literal (single-quoted)
 * Prevents breaking out of JS string context in onclick handlers etc.
 * @param {string} str - The string to escape
 * @returns {string} - Escaped string safe for JS string context
 */
export const escapeJsString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/</g, '\\x3c')
    .replace(/>/g, '\\x3e')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
};
