// src/utils/RenderUtils.js
import { typeToTagMap } from '../Mapping/typeMapping';
import { renderNavbar } from './htmlRenderUtils/RenderNavbars/renderNavbar';
import { renderHero } from './htmlRenderUtils/RenderHeros/renderHero';
import { renderFooter } from './htmlRenderUtils/RenderFooters/renderFooter';
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

export function renderElementToHtml(element, collectedStyles) {
  const {
    id,
    type,
    styles = {},
    content,
    attributes = {},
    children = [],
    settings = {}
  } = element;

  const className = `element-${id}`;

  // Delegate to specialized renderers for complex sections
  if (type === 'navbar') {
    return require('./htmlRenderUtils/RenderNavbars/renderNavbar').renderNavbar(element, collectedStyles);
  }
  if (type === 'hero') {
    return require('./htmlRenderUtils/RenderHeros/renderHero').renderHero(element, collectedStyles);
  }
  if (type === 'footer') {
    return require('./htmlRenderUtils/RenderFooters/renderFooter').renderFooter(element, collectedStyles);
  }
  if (type === 'defiSection') {
    return require('./htmlRenderUtils/RenderWeb3/renderDefiSection').renderDefiSection(element, collectedStyles);
  }
  if (type === 'defiModule') {
    return require('./htmlRenderUtils/RenderWeb3/renderDefiModule').renderDefiModule(element, collectedStyles);
  }
  if (type === 'cta') {
    return require('./htmlRenderUtils/RenderCtas/renderCta').renderCta(element, collectedStyles);
  }
  if (type === 'section') {
    return require('./htmlRenderUtils/RenderSection/renderSection').renderSection(element, collectedStyles);
  }

  const tag = typeToTagMap[type];
  if (!tag) {
    console.warn(`No HTML tag mapping found for type: ${type}`);
    return '';
  }

  // Compute the initial source
  let finalSrc = element.src || (styles && styles.src) || '';
  if (type === 'image' && !finalSrc && content) {
    finalSrc = content;
  }

  // If the element is a media type, update the URL if the project folder name is outdated
  if (finalSrc && ['img', 'video', 'audio', 'iframe', 'source'].includes(type)) {
    const parts = finalSrc.split('/o/');
    if (parts.length > 1) {
      const [basePart, pathAndQuery] = parts;
      const [encodedPath, query] = pathAndQuery.split('?');
      const decodedPath = decodeURIComponent(encodedPath);
      const segments = decodedPath.split('/');
      const projIndex = segments.indexOf('projects');
      if (projIndex !== -1 && segments.length > projIndex + 1) {
        const oldProjectName = segments[projIndex + 1];
        const currentProjectName = (settings.siteTitle || '').trim();
        if (currentProjectName && oldProjectName !== currentProjectName) {
          const newDecodedPath = decodedPath.replace(`/projects/${oldProjectName}/`, `/projects/${currentProjectName}/`);
          const newEncodedPath = encodeURIComponent(newDecodedPath);
          finalSrc = `${basePart}/o/${newEncodedPath}${query ? '?' + query : ''}`;
        }
      }
    }
  }

  // Fix: Always output <img src="..."> for image elements
  if (type === 'image') {
    const cleanedStyles = cleanStyles(styles);
    collectedStyles.push({ className, styles: cleanedStyles });
    // Use the style property if present, otherwise fallback to default sizing
    const styleAttr = element.style && element.style.length > 0
      ? ` style="${element.style}"`
      : ' style="max-height:50px;height:40px;width:auto;object-fit:cover;border-radius:8px;"';
    return `<img id="${id}" class="${className}" src="${finalSrc || ''}"${styleAttr} />`;
  }

  // Fix: Always output <button ...> for button elements with merged styles and fallbacks
  if (type === 'button' || type === 'connectWalletButton') {
    function camelToKebab(str) {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    let merged = { ...(styles || {}), ...((element.inlineStyles) || {}) };
    if (!merged.backgroundColor) merged.backgroundColor = '#334155';
    if (!merged.color) merged.color = '#fff';
    if (!merged.padding) merged.padding = '10px 20px';
    if (!merged.cursor) merged.cursor = 'pointer';
    if (!merged.border) merged.border = 'none';
    if (!merged.outline) merged.outline = 'none';
    if (!merged.borderRadius) merged.borderRadius = '4px';
    if (!merged.fontSize) merged.fontSize = '14px';
    if (!merged.fontWeight) merged.fontWeight = 500;
    if (!merged.transition) merged.transition = '0.2s';
    if (!merged.position) merged.position = 'relative';
    if (!merged.boxSizing) merged.boxSizing = 'border-box';
    if (!merged.marginLeft) merged.marginLeft = '16px';
    const styleAttr = ` style="${Object.entries(merged).map(([k, v]) => `${camelToKebab(k)}: ${v}`).join('; ')}"`;
    return `<button id="${id}" class="${className}"${styleAttr}>${content || ''}</button>`;
  }

  let styleForCSS = { ...styles };
  if ([
    'img', 'video', 'audio', 'iframe', 'source'
  ].includes(type)) {
    delete styleForCSS.src;
  }
  const cleanedStyles = cleanStyles(styleForCSS);
  collectedStyles.push({ className, styles: cleanedStyles });

  let attributesString = `id="${id}" class="${className}"`;
  attributesString += buildAttributesString(type, attributes, finalSrc, settings);

  const selfClosingTags = ['img', 'input', 'hr', 'br', 'meta', 'link', 'source'];
  const childrenHtml = children
    .map(childElement => renderElementToHtml(childElement, collectedStyles))
    .join('');

  if (
    type === 'button' &&
    settings.actionType === 'Dropdown' &&
    Array.isArray(settings.dropdownLinks) &&
    settings.dropdownLinks.length > 0
  ) {
    const toggleOnClick = "var dropdown = this.nextElementSibling; dropdown.style.display = (dropdown.style.display==='block' ? 'none' : 'block');";
    attributesString += ` onclick="${toggleOnClick}"`;
    const buttonHtml = `<${tag} ${attributesString}>${content || ''}${childrenHtml}</${tag}>`;
    let dropdownHtml = `<div class="dropdown-menu" style="${DropdownStyles.dropdownMenu}; display: none;">`;
    dropdownHtml += settings.dropdownLinks.map(link => {
      const linkOnClick = link.openInNewTab
        ? `window.open('${link.targetValue}', '_blank')`
        : `window.location.href='${link.targetValue}'`;
      return `<a href="#" style="${DropdownStyles.dropdownItem}" onclick="${linkOnClick}">${link.content || link.targetValue}</a>`;
    }).join('');
    dropdownHtml += `</div>`;
    return buttonHtml + dropdownHtml;
  }

  if (selfClosingTags.includes(tag)) {
    return `<${tag} ${attributesString} />`;
  } else {
    return `<${tag} ${attributesString}>${content || ''}${childrenHtml}</${tag}>`;
  }
}

function cleanStyles(styles = {}) {
  const { outline, boxShadow, ...productionStyles } = styles;
  return productionStyles;
}