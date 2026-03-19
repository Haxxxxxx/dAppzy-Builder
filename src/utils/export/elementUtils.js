import { elementTypes, mergeStyles } from '../../core/configs/elementConfigs';
import { structureConfigurations } from '../../configs/structureConfigurations';
import { SECTION_TYPES } from '../../core/elementRegistry';

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

  if (!element.id || !element.type) {
    return null;
  }

  // Children are stored as ID strings in the flat array — pass them through as-is.
  // buildElementHierarchy resolves them to objects later.
  const children = Array.isArray(element.children) ? element.children : [];

  // Base cleaned element — all types get these properties
  const cleaned = {
    id: element.id,
    type: element.type,
    content: element.content || '',
    styles: processElementStyles(element),
    children,
    parentId: element.parentId || null,
  };

  // Preserve configuration if present
  if (element.configuration) {
    cleaned.configuration = element.configuration;
  }

  // Preserve interactive settings (targetValue, actionType, openInNewTab, etc.)
  if (element.settings && Object.keys(element.settings).length > 0) {
    cleaned.settings = element.settings;
  }

  // Preserve state styles for CSS generation
  if (element.hoverStyles && Object.keys(element.hoverStyles).length > 0) {
    cleaned.hoverStyles = element.hoverStyles;
  }
  if (element.focusStyles && Object.keys(element.focusStyles).length > 0) {
    cleaned.focusStyles = element.focusStyles;
  }
  if (element.breakpointStyles) {
    const hasTablet = element.breakpointStyles.tablet && Object.keys(element.breakpointStyles.tablet).length > 0;
    const hasMobile = element.breakpointStyles.mobile && Object.keys(element.breakpointStyles.mobile).length > 0;
    if (hasTablet || hasMobile) {
      cleaned.breakpointStyles = element.breakpointStyles;
    }
  }

  // Preserve link-specific properties
  if (element.href) cleaned.href = element.href;
  if (element.label) cleaned.label = element.label;
  if (element.alt) cleaned.alt = element.alt;
  if (element.src) cleaned.src = element.src;
  if (element.className) cleaned.className = element.className;

  // Strip editor-only properties (outline, boxShadow already handled by processElementStyles)
  return cleaned;
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
    
    case 'ContentSection':
      switch (configuration) {
        case 'sectionTwo': return sectionTwoStyles;
        case 'sectionThree': return sectionThreeStyles;
        case 'sectionFour': return sectionFourStyles;
        default: return defaultSectionStyles;
      }
    
    case 'footer':
      switch (configuration) {
        case 'detailedFooter': return DetailedFooterStyles;
        case 'advancedFooter':
        case 'templateFooter': return TemplateFooterStyles;
        case 'defiFooter': return DeFiFooterStyles;
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
  const isSection = SECTION_TYPES.has(element.type);
  
  if (isSection) {
    // Get the appropriate section styles based on configuration
    const sectionStyles = defaultStyles[`${element.type}Section`] || defaultStyles[element.type] || {};
    
    // Always include base styles for sections
    const baseStyles = {
      display: 'flex',
      ...sectionStyles,
      ...structureStyles
    };

    // Merge base styles with user styles — user styles take precedence
    return mergeStyles(
      baseStyles,
      element.styles || {},
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

  const { outline, ...productionStyles } = mergedStyles;

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

  // First pass: Create map of all elements, storing original children ID array for ordering
  elements.forEach(element => {
    if (element && element.id) {
      elementMap.set(element.id, {
        ...element,
        _storedChildrenOrder: Array.isArray(element.children) ? element.children : [],
        children: []
      });
    }
  });

  // Second pass: Build hierarchy using parentId
  elements.forEach(element => {
    if (!element || !element.id) return;

    const parentId = element.parentId;
    if (parentId && elementMap.has(parentId)) {
      const parent = elementMap.get(parentId);
      parent.children.push(elementMap.get(element.id));
    } else if (!parentId) {
      // Only treat as root if it genuinely has no parent.
      // Elements with a parentId pointing to a missing parent are orphans
      // (e.g. hero children whose parent section was deleted) — skip them.
      rootElements.push(elementMap.get(element.id));
    }
  });

  // Third pass: Sort children by stored order (preserves user's drag-and-drop arrangement)
  elementMap.forEach(node => {
    if (node._storedChildrenOrder.length > 0 && node.children.length > 1) {
      const orderMap = new Map(node._storedChildrenOrder.map((id, idx) => [id, idx]));
      node.children.sort((a, b) => {
        const aIdx = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity;
        const bIdx = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity;
        return aIdx - bIdx;
      });
    }
    delete node._storedChildrenOrder;
  });

  return rootElements;
}; 