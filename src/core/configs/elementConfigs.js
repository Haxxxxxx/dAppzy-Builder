import { v4 as uuidv4 } from 'uuid';

// Base element types and their default properties
export const elementTypes = {
  section: {
    type: 'section',
    defaultStyles: {
      position: 'relative',
      width: '100%',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    requiredProps: ['id', 'type'],
  },
  container: {
    type: 'container',
    defaultStyles: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    requiredProps: ['id', 'type'],
  },
  button: {
    type: 'button',
    defaultStyles: {
      backgroundColor: '#5C4EFA',
      color: '#FFFFFF',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'inline-block',
      textAlign: 'center',
      textDecoration: 'none',
      outline: 'none',
      boxShadow: 'none',
      margin: '0',
      width: 'auto',
      height: 'auto',
      lineHeight: '1.5',
      fontFamily: 'inherit',
      '&:hover': {
        backgroundColor: '#4a3ed9',
      },
    },
    requiredProps: ['id', 'type', 'content'],
  },
  heading: {
    type: 'heading',
    defaultStyles: {
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: '0 0 1rem 0',
      color: '#1a1a1a',
    },
    requiredProps: ['id', 'type', 'content'],
  },
  paragraph: {
    type: 'paragraph',
    defaultStyles: {
      fontSize: '1rem',
      lineHeight: '1.5',
      margin: '0 0 1rem 0',
      color: '#333333',
    },
    requiredProps: ['id', 'type', 'content'],
  },
  image: {
    type: 'image',
    defaultStyles: {
      maxWidth: '100%',
      height: 'auto',
      display: 'block',
    },
    requiredProps: ['id', 'type', 'src'],
  },
  input: {
    type: 'input',
    defaultStyles: {
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      width: '100%',
      '&:focus': {
        outline: 'none',
        borderColor: '#5C4EFA',
      },
    },
    requiredProps: ['id', 'type'],
  },
  textarea: {
    type: 'textarea',
    defaultStyles: {
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '100px',
      width: '100%',
      '&:focus': {
        outline: 'none',
        borderColor: '#5C4EFA',
      },
    },
    requiredProps: ['id', 'type'],
  },
  defiSection: {
    type: 'defiSection',
    defaultStyles: {
      backgroundColor: '#2a2a2a',
      color: '#fff',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    requiredProps: ['id', 'type'],
  },
  footer: {
    type: 'footer',
    defaultStyles: {
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      borderTop: '1px solid #e5e5e5',
      padding: '12px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    requiredProps: ['id', 'type'],
  },
};

// Structure configurations for complex elements
export const structureConfigurations = {
  defaultHero: {
    type: 'hero',
    styles: {
      minHeight: '500px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '60px 20px',
      position: 'relative',
    },
    children: [
      {
        type: 'div',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          gap: '16px',
        },
      },
      {
        type: 'div',
        styles: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        },
      },
    ],
  },
  defaultCTA: {
    type: 'cta',
    styles: {
      padding: '60px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    },
    children: [
      {
        type: 'div',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '12px',
          flex: 1,
        },
      },
      {
        type: 'div',
        styles: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: 1,
        },
      },
    ],
  },
};

// Element factory function
export const createElement = (type, config = {}) => {
  const elementType = elementTypes[type];
  if (!elementType) {
    throw new Error(`Invalid element type: ${type}`);
  }

  const id = config.id || uuidv4();
  const structureConfig = config.configuration ? structureConfigurations[config.configuration] : null;

  const element = {
    id,
    type,
    configuration: config.configuration || null,
    styles: {
      ...elementType.defaultStyles,
      ...(structureConfig?.styles || {}),
      ...(config.styles || {}),
    },
    children: [],
    content: config.content || '',
    parentId: config.parentId || null,
  };

  // Add type-specific properties
  if (type === 'image') {
    element.src = config.src || 'https://via.placeholder.com/400x300';
  }

  // Validate required properties
  elementType.requiredProps.forEach(prop => {
    if (!element[prop]) {
      throw new Error(`Missing required property: ${prop} for element type: ${type}`);
    }
  });

  return element;
};

// Style management utilities
export const mergeStyles = (baseStyles, existingStyles, newStyles) => {
  const merged = {
    ...baseStyles,
    ...existingStyles,
    ...newStyles,
  };

  // Handle hover states separately
  if (newStyles?.hover || existingStyles?.hover) {
    merged.hover = {
      ...(baseStyles?.hover || {}),
      ...(existingStyles?.hover || {}),
      ...(newStyles?.hover || {}),
    };
  }

  // Remove undefined values
  Object.keys(merged).forEach(key => {
    if (merged[key] === undefined) {
      delete merged[key];
    }
  });

  return merged;
};

// Validation utilities
export const validateElement = (element) => {
  const elementType = elementTypes[element.type];
  if (!elementType) {
    return { valid: false, error: `Invalid element type: ${element.type}` };
  }

  const missingProps = elementType.requiredProps.filter(prop => !element[prop]);
  if (missingProps.length > 0) {
    return { valid: false, error: `Missing required properties: ${missingProps.join(', ')}` };
  }

  return { valid: true };
}; 