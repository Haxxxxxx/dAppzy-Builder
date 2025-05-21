import { elementTypes } from '../../core/configs/elementConfigs';
import { structureConfigurations, mergeStyles } from '../../core/configs/elementConfigs';

// Import default styles
import { ctaOneStyles, ctaTwoStyles } from '../../Elements/Sections/CTAs/defaultCtaStyles';
import { defaultSectionStyles, sectionTwoStyles, sectionThreeStyles, sectionFourStyles } from '../../Elements/Sections/ContentSections/defaultSectionStyles';
import { SimplefooterStyles, DetailedFooterStyles, TemplateFooterStyles, DeFiFooterStyles } from '../../Elements/Sections/Footers/defaultFooterStyles';
import { defaultHeroStyles, CustomTemplateHeroStyles, heroTwoStyles } from '../../Elements/Sections/Heros/defaultHeroStyles';
import { defaultNavbarStyles, CustomTemplateNavbarStyles } from '../../Elements/Sections/Navbars/DefaultNavbarStyles';

/**
 * Cleans and validates element data
 * @param {Object} element - Element to clean
 * @returns {Object|null} - Cleaned element or null if invalid
 */
export const cleanElementData = (element) => {
  if (!element || typeof element !== 'object') {
    return null;
  }

  // Handle different element types
  switch (element.type) {
    // Section Components
    case 'hero':
    case 'navbar':
    case 'footer':
    case 'cta':
    case 'contentSection':
    case 'defiSection':
    case 'mintingSection':
      return {
        id: element.id,
        type: element.type,
        configuration: element.configuration,
        styles: processElementStyles(element),
        children: (element.children || []).map(cleanElementData).filter(Boolean),
        content: element.content || {}
      };

    // Basic Elements
    case 'heading':
    case 'paragraph':
    case 'span':
    case 'button':
      return {
        id: element.id,
        type: element.type,
        content: element.content || '',
        styles: processElementStyles(element)
      };

    // Media Elements
    case 'image':
      return {
        id: element.id,
        type: 'image',
        src: element.src || element.content || '',
        alt: element.alt || '',
        styles: processElementStyles(element)
      };

    // Interactive Elements
    case 'icon':
      return {
        id: element.id,
        type: 'icon',
        name: element.name || element.content || '',
        styles: processElementStyles(element)
      };

    case 'linkBlock':
      return {
        id: element.id,
        type: 'linkBlock',
        content: element.content || '',
        href: element.href || '#',
        styles: processElementStyles(element)
      };

    // Container Elements
    case 'div':
      return {
        id: element.id,
        type: 'div',
        className: element.className || '',
        styles: processElementStyles(element),
        children: (element.children || []).map(cleanElementData).filter(Boolean)
      };

    // Web3 Related Elements
    case 'defiModule':
      return {
        id: element.id,
        type: 'defiModule',
        configuration: element.configuration,
        styles: processElementStyles(element),
        children: (element.children || []).map(cleanElementData).filter(Boolean),
        content: {
          title: element.content?.title || '',
          description: element.content?.description || '',
          ...element.content
        }
      };

    case 'mintingModule':
      return {
        id: element.id,
        type: 'mintingModule',
        configuration: element.configuration,
        styles: processElementStyles(element),
        children: (element.children || []).map(cleanElementData).filter(Boolean),
        content: {
          title: element.content?.title || '',
          description: element.content?.description || '',
          ...element.content
        }
      };

    default:
      console.warn(`Invalid element type: ${element.type}`);
      return null;
  }
};

/**
 * Gets the appropriate default styles based on element type and configuration
 * @param {Object} element - The element to get styles for
 * @returns {Object} - Default styles object
 */
const getDefaultStyles = (element) => {
  const { type, configuration } = element;

  switch (type) {
    case 'cta':
      return configuration === 'ctaTwo' ? ctaTwoStyles : ctaOneStyles;
    
    case 'contentSection':
      switch (configuration) {
        case 'sectionTwo': return sectionTwoStyles;
        case 'sectionThree': return sectionThreeStyles;
        case 'sectionFour': return sectionFourStyles;
        default: return defaultSectionStyles;
      }
    
    case 'footer':
      switch (configuration) {
        case 'detailed': return DetailedFooterStyles;
        case 'template': return TemplateFooterStyles;
        case 'defi': return DeFiFooterStyles;
        default: return SimplefooterStyles;
      }
    
    case 'hero':
      switch (configuration) {
        case 'customTemplate': return CustomTemplateHeroStyles;
        case 'heroTwo': return heroTwoStyles;
        default: return defaultHeroStyles;
      }
    
    case 'navbar':
      return configuration === 'customTemplate' ? CustomTemplateNavbarStyles : defaultNavbarStyles;
    
    default:
      return {};
  }
};

/**
 * Processes element styles with proper merging and validation
 * @param {Object} element - The element to process styles for
 * @returns {Object} - Processed styles object
 */
export const processElementStyles = (element) => {
  if (!element || !element.type) {
    return {};
  }

  // Get default styles for the element type
  const defaultStyles = getDefaultStyles(element);
  
  // Get structure configuration styles if present
  const structureConfig = element.configuration ?
    structureConfigurations[element.configuration] : null;
  const structureStyles = structureConfig?.styles || {};

  // Special handling for sections and navbars
  const isSection = ['section', 'defiNavbar', 'navbar', 'hero', 'footer', 'cta', 'contentSection'].includes(element.type);
  
  if (isSection) {
    // Get the appropriate section styles based on configuration
    const sectionStyles = defaultStyles[`${element.type}Section`] || defaultStyles[element.type] || {};
    
    // Always include base styles for sections
    const baseStyles = {
      display: 'flex',
      ...sectionStyles,
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
    return defaultStyles[element.type] || {};
  }

  const mergedStyles = mergeStyles(
    defaultStyles[element.type] || {},
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
 * Builds a hierarchical representation of elements
 * @param {Array} elements - Array of elements
 * @returns {Array} - Hierarchical elements
 */
export const buildElementHierarchy = (elements) => {
  if (!Array.isArray(elements)) {
    return [];
  }

  const elementMap = new Map();
  const rootElements = [];

  // First pass: Create map of all elements
  elements.forEach(element => {
    if (element && element.id) {
      elementMap.set(element.id, {
        ...element,
        children: []
      });
    }
  });

  // Second pass: Build hierarchy
  elements.forEach(element => {
    if (!element || !element.id) return;

    const parentId = element.parentId;
    if (parentId && elementMap.has(parentId)) {
      const parent = elementMap.get(parentId);
      parent.children.push(elementMap.get(element.id));
    } else {
      rootElements.push(elementMap.get(element.id));
    }
  });

  return rootElements;
}; 