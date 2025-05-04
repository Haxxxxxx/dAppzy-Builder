// src/utils/htmlRenderUtils/RenderFooters/renderFooter.js
import { renderElementToHtml } from '../../htmlRender';

// Import your style objects (just like your navbars):
import {
  SimplefooterStyles,
  DetailedFooterStyles,
  TemplateFooterStyles } from '../../../Elements/Sections/Footers/defaultFooterStyles'
/**
 * Renders a "footer" element into final HTML, preserving the sub-structure
 * for each configuration (simple, detailed, template).
 */
export function renderFooter(footerElement, collectedStyles) {
  const {
    id,
    configuration = 'simple', // fallback
    children = [],
    styles = {},
    inlineStyles = {},
  } = footerElement;

  // Helper to convert camelCase to kebab-case
  function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  // Helper to merge and generate style string from styles and inlineStyles, with fallbacks
  function getStyleString(styles, inlineStyles, type, config) {
    let merged = { ...(styles || {}), ...(inlineStyles || {}) };
    delete merged.maxWidth;
    if (type === 'image') {
      if (!merged.width) merged.width = '32px';
      if (!merged.height) merged.height = '32px';
      if (!merged.maxHeight) merged.maxHeight = '50px';
      if (!merged.objectFit) merged.objectFit = 'cover';
      if (!merged.borderRadius) merged.borderRadius = '8px';
      if (!merged.display) merged.display = 'inline-flex';
      if (!merged.position) merged.position = 'relative';
    }
    if (type === 'span') {
      if (!merged.fontFamily) merged.fontFamily = 'Roboto, sans-serif';
      if (!merged.fontWeight) merged.fontWeight = 500;
      if (!merged.fontSize) merged.fontSize = '1rem';
      if (!merged.color) merged.color = '#fff';
      if (!merged.cursor) merged.cursor = 'text';
      if (!merged.border) merged.border = 'none';
      if (!merged.outline) merged.outline = 'none';
    }
    if (type === 'link') {
      if (!merged.color) merged.color = '#bbb';
      if (!merged.textDecoration) merged.textDecoration = 'none';
      if (!merged.fontSize) merged.fontSize = '0.9rem';
      if (!merged.display) merged.display = 'block';
      if (!merged.cursor) merged.cursor = 'text';
    }
    if (type === 'button') {
      // Merge in default button styles for customTemplate
      if (config === 'customTemplate' && SimplefooterStyles.subscribeButton) {
        merged = { ...SimplefooterStyles.subscribeButton, ...merged };
      }
    }
    return Object.entries(merged)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }

  // Outer footer style
  function getFooterFallbackStyles(styles, inlineStyles) {
    let merged = { ...(styles || {}), ...(inlineStyles || {}) };
    if (!merged.backgroundColor) merged.backgroundColor = '#1a1a1a';
    if (!merged.color) merged.color = '#fff';
    if (!merged.borderTop) merged.borderTop = '1px solid #333';
    if (!merged.padding) merged.padding = '0';
    return merged;
  }
  const className = `footer-${id}`;
  const footerStyleString = Object.entries(getFooterFallbackStyles(styles, inlineStyles))
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  // Render all children in order, directly inside <footer>
  const childrenHtml = children.map(child => {
    if (child.type === 'span') {
      return `<span id="${child.id}" style="${getStyleString(child.styles, child.inlineStyles, 'span', configuration)}" contenteditable="false">${child.content}</span>`;
    } else if (child.type === 'button') {
      return `<button id="${child.id}" style="${getStyleString(child.styles, child.inlineStyles, 'button', configuration)}">${child.content}</button>`;
    } else if (child.type === 'image') {
      return `<img id="${child.id}" src="${child.content}" style="${getStyleString(child.styles, child.inlineStyles, 'image', configuration)}" alt="Footer image" />`;
    } else if (child.type === 'link') {
      return `<a id="${child.id}" href="${child.href || '#'}" style="${getStyleString(child.styles, child.inlineStyles, 'link', configuration)}" contenteditable="false">${child.content}</a>`;
    }
    return '';
  }).join('');

  return `
    <footer id="${className}" class="${className} templateFooter" style="${footerStyleString}">
      ${childrenHtml}
    </footer>
  `;
}
