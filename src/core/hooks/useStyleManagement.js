import { useCallback } from 'react';
import { elementTypes, mergeStyles } from '../configs/elementConfigs';

export const useStyleManagement = (updateStyles, findElementById) => {
  const applyChildStyles = useCallback((parentId, parentStyles, children, config) => {
    const parent = findElementById(parentId);
    if (!parent?.children) return;

    parent.children.forEach((childId, index) => {
      const child = findElementById(childId);
      const childConfig = config?.children?.[index];
      
      if (child && childConfig) {
        const elementType = elementTypes[child.type];
        const baseStyles = {
          ...elementType?.defaultStyles,
          color: parentStyles?.color || config?.styles?.color
        };

        const mergedStyles = mergeStyles(
          baseStyles,
          child.styles,
          childConfig.styles
        );

        updateStyles(childId, mergedStyles);
      }
    });
  }, [findElementById, updateStyles]);

  const getElementStyles = useCallback((element, newStyles = {}) => {
    const elementType = elementTypes[element.type];
    if (!elementType) return newStyles;

    return mergeStyles(
      elementType.defaultStyles,
      element.styles,
      newStyles
    );
  }, []);

  const validateStyles = useCallback((element, styles) => {
    const elementType = elementTypes[element.type];
    if (!elementType) return { valid: false, error: `Invalid element type: ${element.type}` };

    // Check for invalid style properties
    const invalidStyles = Object.keys(styles).filter(style => {
      // Add your style validation logic here
      // For example, check if color values are valid
      if (style.includes('color')) {
        const colorValue = styles[style];
        return !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue) && 
               !/^[a-zA-Z]+$/.test(colorValue) && 
               !/^(rgb|rgba|hsl|hsla)/.test(colorValue);
      }
      return false;
    });

    if (invalidStyles.length > 0) {
      return { 
        valid: false, 
        error: `Invalid style properties: ${invalidStyles.join(', ')}` 
      };
    }

    return { valid: true };
  }, []);

  return {
    applyChildStyles,
    getElementStyles,
    validateStyles
  };
}; 