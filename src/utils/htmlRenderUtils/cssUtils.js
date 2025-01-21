import { stylesMap } from "./typeMapping";

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
  
  // Generate consolidated CSS for all collected styles
  export function generateCss(collectedStyles) {
    const defaultStylesCss = Object.entries(stylesMap)
      .map(([config, styles]) => {
        return Object.entries(styles).map(([className, style]) => {
          const styleString = flattenStyles(style || {});
          return `.${config}-${className} {\n  ${styleString}\n}`;
        }).join('\n\n');
      })
      .join('\n\n');
  
    const elementStylesCss = collectedStyles
      .map(({ className, styles }) => {
        const styleString = flattenStyles(styles || {});
        return `.${className} {\n  ${styleString}\n}`;
      })
      .join('\n\n');
  
    return `${defaultStylesCss}\n\n${elementStylesCss}`;
  }
  