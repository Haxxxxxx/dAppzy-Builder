// src/utils/htmlRenderUtils/RenderNavbars/renderNavbar.js

import { defaultNavbarStyles, CustomTemplateNavbarStyles } from '../../../Elements/Sections/Navbars/DefaultNavbarStyles';
import { renderElementToHtml } from '../../htmlRender';

/**
 * Generic handler for all "navbar" elements.
 * - Merges default styles + user's custom styles
 * - Groups children (logo, brand, links, buttons) based on `configuration`
 */
export function renderNavbar(navbarElement, collectedStyles) {
  const {
    id,
    configuration,
    children = [],
    styles = {},
    inlineStyles = {},
  } = navbarElement;

  // Group children
  const logo = children.find((c) => c.type === 'image');
  const spans = children.filter((c) => c.type === 'span');
  const brand = spans[0];
  const links = spans.slice(1);
  const buttons = children.filter((c) => c.type === 'button' || c.type === 'connectWalletButton');

  // Helper to convert camelCase to kebab-case
  function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  // Helper to merge and generate style string from styles and inlineStyles, with fallbacks
  function getStyleString(styles, inlineStyles, type) {
    let merged = { ...(styles || {}), ...(inlineStyles || {}) };
    // Fallbacks for logo image
    if (type === 'image') {
      if (!merged.width) merged.width = 'auto';
      if (!merged.height) merged.height = '40px';
      if (!merged.maxHeight) merged.maxHeight = '50px';
      if (!merged.objectFit) merged.objectFit = 'contain';
      if (!merged.borderRadius) merged.borderRadius = '8px';
      // Ensure the image doesn't exceed the navbar height
      merged.maxHeight = '100%';
      merged.height = 'auto';
    }
    // Fallbacks for brand text
    if (type === 'span' && merged.isBrand) {
      if (!merged.fontFamily) merged.fontFamily = 'Roboto, sans-serif';
      if (!merged.fontWeight) merged.fontWeight = 500;
      if (!merged.fontSize) merged.fontSize = '1.1rem';
      if (!merged.color) merged.color = '#fff';
    }
    return Object.entries(merged)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }

  // HTML for each part (pass down merged styles for children)
  const logoHtml = logo ? renderElementToHtml({ ...logo, style: getStyleString(logo.styles, logo.inlineStyles, 'image') }, collectedStyles) : '';
  // Mark brand span for fallback font styles
  const brandHtml = brand ? renderElementToHtml({ ...brand, style: getStyleString(brand.styles, brand.inlineStyles, 'span'), isBrand: true }, collectedStyles) : '';
  const linksHtml = links.map((c) => renderElementToHtml({ ...c, style: getStyleString(c.styles, c.inlineStyles, c.type) }, collectedStyles)).join('\n');
  const buttonsHtml = buttons.map((c) => renderElementToHtml({ ...c, style: getStyleString(c.styles, c.inlineStyles, c.type) }, collectedStyles)).join('\n');

  // Use all merged styles for the navbar itself, with sensible defaults
  function getNavbarFallbackStyles(styles, inlineStyles) {
    let merged = { ...(styles || {}), ...(inlineStyles || {}) };
    if (!merged.display) merged.display = 'flex';
    if (!merged.alignItems) merged.alignItems = 'center';
    if (!merged.justifyContent) merged.justifyContent = 'space-between';
    if (!merged.width) merged.width = '100%';
    if (!merged.padding) merged.padding = '1rem 2rem';
    if (!merged.background) merged.background = '#18181b';
    if (!merged.boxShadow) merged.boxShadow = 'rgba(0,0,0,0.12) 0px 2px 12px';
    if (!merged.position) merged.position = 'relative';
    if (!merged.zIndex) merged.zIndex = 1000;
    // Add max-height constraint for the navbar
    if (!merged.maxHeight) merged.maxHeight = '80px';
    return merged;
  }
  const className = `navbar-${id}`;
  const navbarStyleString = Object.entries(getNavbarFallbackStyles(styles, inlineStyles))
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');

  // If you have container-specific styles, you can extract them from children or use defaults
  const logoContainerStyles = logo && logo.parentStyles ? getStyleString(logo.parentStyles) : 'display: flex; align-items: center; gap: 1rem;';
  const linksContainerStyles = 'display: flex; gap: 16px; align-items: center;';
  const buttonContainerStyles = 'display: flex; gap: 16px; font-family: Roboto, sans-serif;';

  return `
    <nav id="${className}" class="${className}" style="${navbarStyleString}">
      <div class="logoContainer" style="${logoContainerStyles}">
        ${logoHtml}${brandHtml}
      </div>
      <div class="linksContainer" style="${linksContainerStyles}">
        ${linksHtml}
      </div>
      <div class="buttonContainer" style="${buttonContainerStyles}">
        ${buttonsHtml}
      </div>
    </nav>
  `;
}
