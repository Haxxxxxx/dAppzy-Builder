// Default styles for core element types used by the HTML export pipeline.
// NOT a complete registry — see src/core/elementRegistry.js for the full
// element registry with metadata (editorGroup, sidebarCategory, etc.).
export const elementTypes = {
  navbar: {
    type: 'navbar',
    defaultStyles: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      width: '100%'
    },
    requiredProps: ['type'],
    allowedChildren: ['image', 'span', 'button', 'link'],
    defaultContent: '',
    settings: {
      sticky: false,
      transparent: false
    }
  },
  section: {
    type: 'section',
    defaultStyles: {
      padding: '2rem',
      width: '100%'
    },
    requiredProps: ['type'],
    allowedChildren: ['div', 'heading', 'paragraph', 'image'],
    defaultContent: '',
    settings: {
      fullWidth: false,
      background: 'transparent'
    }
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

 