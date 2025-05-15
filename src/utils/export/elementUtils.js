import { elementTypes } from '../../core/configs/elementConfigs';
import { structureConfigurations, mergeStyles } from '../../core/configs/elementConfigs';

/**
 * Validates and cleans element data
 * @param {Object} element - The element to clean
 * @returns {Object|null} - Cleaned element or null if invalid
 */
export const cleanElementData = (element) => {
  if (!element) {
    console.warn('Received null or undefined element');
    return null;
  }

  try {
    // Validate element type
    const elementType = elementTypes[element.type];
    if (!elementType) {
      console.warn(`Invalid element type: ${element.type}`);
      return null;
    }

    // Create a new object with only valid properties
    const cleanedElement = {
      id: element.id || '',
      type: element.type,
      content: element.content || '',
      parentId: element.parentId || null,
      children: Array.isArray(element.children) ? element.children : [],
      configuration: element.configuration || '',
      className: element.className || '',
      attributes: element.attributes || {},
      dataAttributes: element.dataAttributes || {},
      events: element.events || {},
    };

    // Add type-specific properties
    if (element.type === 'image') {
      cleanedElement.src = element.src || 'https://via.placeholder.com/400x300';
    }

    // Process styles
    cleanedElement.styles = processElementStyles(element);

    // Validate required properties
    const missingProps = elementType.requiredProps.filter(prop => !cleanedElement[prop]);
    if (missingProps.length > 0) {
      console.warn(`Element missing required properties: ${missingProps.join(', ')}`);
      return null;
    }

    return cleanedElement;
  } catch (error) {
    console.error('Error cleaning element:', error, element);
    return null;
  }
};

/**
 * Processes element styles with proper merging and validation
 * @param {Object} element - The element to process styles for
 * @returns {Object} - Processed styles object
 */
export const processElementStyles = (element) => {
  const elementType = elementTypes[element.type];
  if (!elementType) {
    return {};
  }

  // Get structure configuration styles if present
  const structureConfig = element.configuration ?
    structureConfigurations[element.configuration] : null;
  const structureStyles = structureConfig?.styles || {};

  // Special handling for sections and navbars
  const isSection = element.type === 'section' || element.type === 'defiNavbar' || element.type === 'navbar';
  if (isSection) {
    // Always include base styles for sections
    const baseStyles = {
      display: 'flex',
      ...structureStyles
    };

    // Remove any conflicting styles from user styles
    const userStyles = { ...element.styles };
    delete userStyles.backgroundColor;
    delete userStyles.width;
    delete userStyles.position;
    delete userStyles.justifyContent;
    delete userStyles.alignItems;

    return mergeStyles(
      baseStyles,
      userStyles || {},
      element.inlineStyles || {}
    );
  }

  // For other elements, proceed with normal style processing
  const hasCustomStyles = element.styles && Object.keys(element.styles).length > 0;
  const hasInlineStyles = element.inlineStyles && Object.keys(element.inlineStyles).length > 0;

  if (!hasCustomStyles && !hasInlineStyles && !structureStyles) {
    return {};
  }

  const mergedStyles = mergeStyles(
    structureStyles,
    element.styles || {},
    element.inlineStyles || {}
  );

  const { outline, boxShadow, ...productionStyles } = mergedStyles;

  // Format color values
  Object.entries(productionStyles).forEach(([key, value]) => {
    if (key.includes('color') || key.includes('background')) {
      productionStyles[key] = formatColorValue(value);
    }
  });

  return productionStyles;
};

/**
 * Formats color values to ensure consistency
 * @param {string} value - The color value to format
 * @returns {string} - Formatted color value
 */
export const formatColorValue = (value) => {
  if (!value || typeof value !== 'string') return '';
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) return value;
  if (/^[a-zA-Z]+$/.test(value)) return value;
  if (/^(rgb|rgba|hsl|hsla)/.test(value)) return value;
  if (/^[A-Fa-f0-9]{6}$/.test(value)) return `#${value}`;
  return value;
};

/**
 * Builds a hierarchical structure from flat elements
 * @param {Array} elements - Flat array of elements
 * @returns {Array} - Hierarchical array of elements
 */
export const buildElementHierarchy = (elements) => {
  const elementMap = new Map();
  const rootElements = [];

  // First pass: create element map and preserve section structure
  elements.forEach(element => {
    const isSection = element.type === 'section' || element.type === 'defiNavbar' || element.type === 'navbar';
    elementMap.set(element.id, {
      ...element,
      children: [],
      isSection,
      ...(isSection && {
        role: 'navigation',
        'aria-label': element.type === 'navbar' ? 'Main Navigation' : `Section ${element.type}`
      })
    });
  });

  // Second pass: build hierarchy while preserving section structure
  elements.forEach(element => {
    const mappedElement = elementMap.get(element.id);
    if (element.parentId) {
      const parent = elementMap.get(element.parentId);
      if (parent) {
        if (mappedElement.isSection) {
          parent.children.push({
            ...mappedElement,
            className: `${mappedElement.className || ''} section-${mappedElement.type}`.trim()
          });
        } else {
          parent.children.push(mappedElement);
        }
      }
    } else {
      rootElements.push(mappedElement);
    }
  });

  return rootElements;
}; 