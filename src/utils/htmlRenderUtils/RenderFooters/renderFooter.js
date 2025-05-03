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
  function getStyleString(styles, inlineStyles, type) {
    let merged = { ...(styles || {}), ...(inlineStyles || {}) };
    // Remove maxWidth if present
    delete merged.maxWidth;
    // Fallbacks for images
    if (type === 'image') {
      if (!merged.width) merged.width = '32px';
      if (!merged.height) merged.height = '32px';
      if (!merged.maxHeight) merged.maxHeight = '50px';
      if (!merged.objectFit) merged.objectFit = 'cover';
      if (!merged.borderRadius) merged.borderRadius = '8px';
      if (!merged.display) merged.display = 'inline-flex';
      if (!merged.position) merged.position = 'relative';
    }
    // Fallbacks for text
    if (type === 'span') {
      if (!merged.fontFamily) merged.fontFamily = 'Roboto, sans-serif';
      if (!merged.fontWeight) merged.fontWeight = 500;
      if (!merged.fontSize) merged.fontSize = '1rem';
      if (!merged.color) merged.color = '#fff';
      if (!merged.cursor) merged.cursor = 'text';
      if (!merged.border) merged.border = 'none';
      if (!merged.outline) merged.outline = 'none';
    }
    // Fallbacks for links
    if (type === 'link') {
      if (!merged.color) merged.color = '#bbb';
      if (!merged.textDecoration) merged.textDecoration = 'none';
      if (!merged.fontSize) merged.fontSize = '0.9rem';
      if (!merged.display) merged.display = 'block';
      if (!merged.cursor) merged.cursor = 'text';
    }
    return Object.entries(merged)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }

  // Group children by type and order
  const logoImage = children.find((c) => c.type === 'image');
  const titleSpan = children.find((c) => c.type === 'span');
  const policyLinks = children.filter((c) => c.type === 'link' && (c.content?.toLowerCase().includes('privacy') || c.content?.toLowerCase().includes('terms')));
  const socialLinks = children.filter((c) => c.type === 'link' && !(c.content?.toLowerCase().includes('privacy') || c.content?.toLowerCase().includes('terms')));

  // HTML for logo + title group
  const logoHtml = logoImage ? `<div style="position: relative; box-sizing: border-box;"><div id="${logoImage.id}" aria-label="Editable image" style="${getStyleString(logoImage.styles, logoImage.inlineStyles, 'image')}"><img src="${logoImage.content}" alt="Editable element" style="width: 32px; height: 32px; object-fit: cover; border-radius: 8px; max-width: 100%; max-height: 100%;"></div></div>` : '';
  const titleHtml = titleSpan ? `<div style="position: relative; box-sizing: border-box;"><span id="${titleSpan.id}" style="${getStyleString(titleSpan.styles, titleSpan.inlineStyles, 'span')}" contenteditable="false">${titleSpan.content}</span></div>` : '';

  // HTML for policy links
  const policyLinksHtml = policyLinks.map(link => `<div style="position: relative; box-sizing: border-box;"><a id="${link.id}" href="${link.href || '#'}" style="${getStyleString(link.styles, link.inlineStyles, 'link')}" contenteditable="false">${link.content}</a></div>`).join('');

  // HTML for social links
  const socialLinksHtml = socialLinks.map(link => `<div style="position: relative; box-sizing: border-box;"><a id="${link.id}" href="${link.href || '#'}" style="${getStyleString(link.styles, link.inlineStyles, 'link')}" contenteditable="false">${link.content}</a></div>`).join('');

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

  // Inner row style
  const innerRowStyle = 'display: flex; justify-content: space-between; padding: 24px; align-items: center; margin: 0px auto;';
  const logoTitleGroupStyle = 'display: flex; align-items: center; gap: 12px;';
  const policyLinksGroupStyle = 'display: flex; gap: 24px;';
  const socialLinksGroupStyle = 'display: flex; gap: 16px;';

  return `
    <footer id="${className}" class="${className} templateFooter" style="${footerStyleString}">
      <div style="${innerRowStyle}">
        <div style="${logoTitleGroupStyle}">
          ${logoHtml}
          ${titleHtml}
        </div>
        <div style="${policyLinksGroupStyle}">
          ${policyLinksHtml}
        </div>
        <div style="${socialLinksGroupStyle}">
          ${socialLinksHtml}
        </div>
      </div>
    </footer>
  `;
}

window.addEventListener('load', function() {
  if (typeof Web3 === 'undefined') {
    alert('Web3 is not loaded!');
    return;
  }
  // ...rest of your wallet connect code...
});
