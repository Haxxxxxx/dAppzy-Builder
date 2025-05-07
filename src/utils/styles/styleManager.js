import merge from 'lodash/merge';

/**
 * Centralized style management system
 */
export const StyleManager = {
  /**
   * Converts camelCase to kebab-case
   * @param {string} str - The string to convert
   * @returns {string} The converted string
   */
  toKebabCase: (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * Merges multiple style objects with proper fallbacks
   * @param {Object} defaultStyles - Default styles
   * @param {Object} customStyles - Custom styles to override defaults
   * @param {Object} fallbackStyles - Fallback styles for specific element types
   * @returns {Object} Merged styles object
   */
  mergeStyles: (defaultStyles = {}, customStyles = {}, fallbackStyles = {}) => {
    return merge({}, defaultStyles, customStyles, fallbackStyles);
  },

  /**
   * Generates a CSS style string from a style object
   * @param {Object} styles - The styles object to convert
   * @returns {string} CSS style string
   */
  generateStyleString: (styles) => {
    if (!styles || typeof styles !== 'object') return '';
    return Object.entries(styles)
      .map(([key, value]) => `${StyleManager.toKebabCase(key)}: ${value}`)
      .join('; ');
  },

  /**
   * Gets fallback styles for specific element types
   * @param {string} type - Element type
   * @returns {Object} Fallback styles for the element type
   */
  getFallbackStyles: (type) => {
    const fallbacks = {
      image: {
        width: '32px',
        height: '32px',
        maxHeight: '50px',
        objectFit: 'cover',
        borderRadius: '8px',
        display: 'inline-flex',
        position: 'relative'
      },
      span: {
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 500,
        fontSize: '1rem',
        color: '#fff',
        cursor: 'text',
        border: 'none',
        outline: 'none'
      },
      link: {
        color: '#bbb',
        textDecoration: 'none',
        fontSize: '0.9rem',
        display: 'block',
        cursor: 'text'
      },
      button: {
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        padding: '8px 16px',
        borderRadius: '4px'
      }
    };

    return fallbacks[type] || {};
  },

  /**
   * Applies styles with proper fallbacks for a specific element type
   * @param {Object} styles - Base styles
   * @param {Object} inlineStyles - Inline styles
   * @param {string} type - Element type
   * @returns {string} Final CSS style string
   */
  applyStyles: (styles = {}, inlineStyles = {}, type) => {
    const fallbackStyles = StyleManager.getFallbackStyles(type);
    const mergedStyles = StyleManager.mergeStyles(styles, inlineStyles, fallbackStyles);
    return StyleManager.generateStyleString(mergedStyles);
  }
}; 