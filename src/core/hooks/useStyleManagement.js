import { useCallback } from 'react';
import { structureConfigurations } from '../../features/elements/configs/elementConfigs';

export const useStyleManagement = (updateStyles, findElementById) => {
  const mergeStyles = useCallback((baseStyles, existingStyles, newStyles) => {
    const merged = {
      ...baseStyles,
      ...existingStyles,
      ...newStyles
    };

    // Handle hover states separately
    if (newStyles?.hover || existingStyles?.hover) {
      merged.hover = {
        ...(baseStyles?.hover || {}),
        ...(existingStyles?.hover || {}),
        ...(newStyles?.hover || {})
      };
    }

    // Remove undefined values
    Object.keys(merged).forEach(key => {
      if (merged[key] === undefined) {
        delete merged[key];
      }
    });

    return merged;
  }, []);

  const applyChildStyles = useCallback((parentId, parentStyles, children, config) => {
    const parent = findElementById(parentId);
    if (!parent?.children) return;

    parent.children.forEach((childId, index) => {
      const child = findElementById(childId);
      const childConfig = config?.children?.[index];
      
      if (child && childConfig) {
        const baseStyles = {
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
  }, [findElementById, mergeStyles, updateStyles]);

  const getElementStyles = useCallback((element, newStyles = {}) => {
    const structureConfig = element.configuration ? 
      structureConfigurations[element.configuration] : null;

    return mergeStyles(
      structureConfig?.styles || {},
      element.styles,
      newStyles
    );
  }, [mergeStyles]);

  return {
    mergeStyles,
    applyChildStyles,
    getElementStyles
  };
}; 