
// Utility function to flatten styles into valid CSS strings
export function flattenStyles(styles) {
    let cssString = '';
  
    Object.entries(styles || {}).forEach(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        cssString += `\n  ${key} {\n`;
        cssString += Object.entries(value)
          .map(
            ([nestedKey, nestedValue]) =>
              `    ${nestedKey.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${nestedValue};`
          )
          .join('\n');
        cssString += `\n  }`;
      } else {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssString += `${cssKey}: ${value};\n  `;
      }
    });
  
    return cssString.trim();
  }
  
