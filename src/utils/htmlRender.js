// src/utils/RenderUtils.js
import { typeToTagMap } from '../Mapping/typeMapping';
import { renderNavbar } from './htmlRenderUtils/RenderNavbars/renderNavbar';
import { renderHero } from './htmlRenderUtils/RenderHeros/renderHero';
import { renderFooter as builderRenderFooter } from './htmlRenderUtils/RenderFooters/renderFooter';
import { renderCta } from './htmlRenderUtils/RenderCtas/renderCta';
import { renderSection } from './htmlRenderUtils/RenderSection/renderSection.js';
import { renderMintingSection } from './htmlRenderUtils/RenderWeb3/renderMintingSection';
import { renderDefiSection } from './htmlRenderUtils/RenderWeb3/renderDefiSection';
import { renderDefiModule } from './htmlRenderUtils/RenderWeb3/renderDefiModule';
import { DropdownStyles } from '../Elements/DefaultStyles/DropdownStyles';

export function buildAttributesString(type, attributes, src, settings = {}) {
  let attributesString = '';

  if (type === 'input' && attributes.type) {
    attributesString += ` type="${attributes.type}"`;
  }

  if (type === 'anchor') {
    const href = attributes.href || settings.targetValue;
    if (href) {
      attributesString += ` href="${href}"`;
    }
    if (settings.openInNewTab) {
      attributesString += ` target="_blank"`;
    }
  }

  // Include both "img" and "image" types.
  if (['img', 'image', 'video', 'audio', 'iframe', 'source'].includes(type) && src) {
    attributesString += ` src="${src}"`;
  }

  if (type === 'select' && attributes.multiple) {
    attributesString += ' multiple';
  }

  if (type === 'option' && attributes.value) {
    attributesString += ` value="${attributes.value}"`;
  }

  if (type === 'progress' && attributes.value && attributes.max) {
    attributesString += ` value="${attributes.value}" max="${attributes.max}"`;
  }

  if (type === 'meter' && attributes.value && attributes.min && attributes.max) {
    attributesString += ` value="${attributes.value}" min="${attributes.min}" max="${attributes.max}"`;
  }

  if (type === 'iframe' && attributes.frameborder) {
    attributesString += ` frameborder="${attributes.frameborder}"`;
  }

  if (type === 'date') {
    attributesString += ` type="date"`;
  }

  if (type === 'button' && settings.targetValue && settings.actionType !== 'Dropdown') {
    if (settings.openInNewTab) {
      attributesString += ` onclick="window.open('${settings.targetValue}', '_blank')"`;
    } else {
      attributesString += ` onclick="window.location.href='${settings.targetValue}'"`;
    }
  }

  if (type === 'span' && settings.targetValue) {
    if (settings.actionType === 'pageSection') {
      attributesString += ` onclick="(function(){ var targetEl = document.getElementById('${settings.targetValue}'); if(targetEl){ targetEl.scrollIntoView({ behavior: 'smooth' }); } else { console.warn('Target element \\'${settings.targetValue}\\' not found'); } })()" style="cursor: pointer;"`;
    } else if (settings.actionType === 'file') {
      if (settings.downloadFile) {
        attributesString += ` onclick="(function(){ var a = document.createElement('a'); a.href='${settings.targetValue}'; a.download = ''; a.click(); })()" style="cursor: pointer;"`;
      } else {
        attributesString += ` onclick="window.open('${settings.targetValue}', '_blank')" style="cursor: pointer;"`;
      }
    }
  }

  return attributesString;
}

export function renderElementToHtml(element, collectedStyles = []) {
  const {
    type,
    content,
    children = [],
    style = '',
    className = '',
    attributes = {},
    dataAttributes = {},
    events = {},
    configuration = {},
    styles = {},
    inlineStyles = {},
    id
  } = element;

  // Helper to convert camelCase to kebab-case
  function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Helper to generate attributes string
  function getAttributesString(attrs) {
    return Object.entries(attrs)
      .map(([k, v]) => `${camelToKebab(k)}="${v}"`)
      .join(' ');
  }

  // Helper to generate data attributes string
  function getDataAttributesString(attrs) {
    return Object.entries(attrs)
      .map(([k, v]) => `data-${camelToKebab(k)}="${v}"`)
      .join(' ');
  }

  // Use the builder's renderFooter for footers
  if (type === 'footer') {
    return builderRenderFooter({
      ...element,
      styles,
      inlineStyles,
      children
    }, collectedStyles);
  }

  // Default rendering for other elements
  const childrenHtml = children
    .map(child => renderElementToHtml(child, collectedStyles))
    .join('');

  const tag = type || 'div';
  const attributesString = getAttributesString(attributes);
  const dataAttributesString = getDataAttributesString(dataAttributes);

  return `
    <${tag} 
      id="${element.id}" 
      class="${className}" 
      style="${style}" 
      ${attributesString} 
      ${dataAttributesString}
    >
      ${content || ''}
      ${childrenHtml}
    </${tag}>
  `;
}

function cleanStyles(styles = {}) {
  const { outline, boxShadow, ...productionStyles } = styles;
  return productionStyles;
}