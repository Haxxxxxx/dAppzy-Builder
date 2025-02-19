import { typeToTagMap } from './htmlRenderUtils/typeMapping';
import { renderNavbar } from './htmlRenderUtils/RenderNavbars/renderNavbar';
import { renderHero } from './htmlRenderUtils/RenderHeros/renderHero';
import { renderFooter } from './htmlRenderUtils/RenderFooters/renderFooter';
import { renderCta } from './htmlRenderUtils/RenderCtas/renderCta';
import { renderMintingSection } from './htmlRenderUtils/RenderWeb3/renderMintingSection';
import { DropdownStyles } from '../Elements/DefaultStyles/DropdownStyles';

export function buildAttributesString(type, attributes, src, settings = {}) {
  let attributesString = '';

  if (type === 'input' && attributes.type) {
    attributesString += ` type="${attributes.type}"`;
  }

  // Handle anchor elements
  if (type === 'anchor') {
    const href = attributes.href || settings.targetValue;
    if (href) {
      attributesString += ` href="${href}"`;
    }
    if (settings.openInNewTab) {
      attributesString += ` target="_blank"`;
    }
  }

  // Handle media elements
  if (['img', 'video', 'audio', 'iframe', 'source'].includes(type) && src) {
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

  // For buttons that are not Dropdowns, apply URL redirection if set.
  if (
    type === 'button' &&
    settings.targetValue &&
    settings.actionType !== 'Dropdown'
  ) {
    if (settings.openInNewTab) {
      attributesString += ` onclick="window.open('${settings.targetValue}', '_blank')"`;
    } else {
      attributesString += ` onclick="window.location.href='${settings.targetValue}'"`;
    }
  }

  // For spans: internal redirection and file redirection
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
  const { id, type, styles, content, src, attributes = {}, children = [], settings = {} } = element;
  const tag = typeToTagMap[type];

  // Handle custom renderers first
  if (type === 'navbar') {
    return renderNavbar(element, collectedStyles);
  }
  if (type === 'hero') {
    return renderHero(element, collectedStyles);
  }
  if (type === 'footer') {
    return renderFooter(element, collectedStyles);
  }
  if (type === 'cta') {
    return renderCta(element, collectedStyles);
  }
  if (type === 'mintingSection') {
    return renderMintingSection(element, collectedStyles);
  }

  if (!tag) {
    console.warn(`No HTML tag mapping found for type: ${type}`);
    return '';
  }

  // Create a unique class name and store the styles
  const className = `element-${id}`;
  collectedStyles.push({ className, styles });

  // Build attributes including both id and class.
  let attributesString = `id="${id}" class="${className}"`;
  attributesString += buildAttributesString(type, attributes, src, settings);

  const selfClosingTags = ['img', 'input', 'hr', 'br', 'meta', 'link', 'source'];
  const childrenHtml = children
    .map((childElement) => renderElementToHtml(childElement, collectedStyles))
    .join('');

  // Special case: Button with Dropdown action type.
  if (
    type === 'button' &&
    settings.actionType === 'Dropdown' &&
    Array.isArray(settings.dropdownLinks) &&
    settings.dropdownLinks.length > 0
  ) {
    // For a dropdown button, we want to override the onclick to toggle the dropdown.
    const toggleOnClick = "var dropdown = this.nextElementSibling; dropdown.style.display = (dropdown.style.display==='block' ? 'none' : 'block');";
    // Append our toggle onclick to the attributesString.
    attributesString += ` onclick="${toggleOnClick}"`;

    // Render the button as usual.
    const buttonHtml = `<${tag} ${attributesString}>${content || ''}${childrenHtml}</${tag}>`;

    // Render the dropdown menu container.
    // We set initial display to none so that it's hidden.
    let dropdownHtml = `<div class="dropdown-menu" style="${DropdownStyles.dropdownMenu}; display: none;">`;
    dropdownHtml += settings.dropdownLinks.map(link => {
      // Render each dropdown link as an anchor element.
      const linkOnClick = link.openInNewTab
        ? `window.open('${link.targetValue}', '_blank')`
        : `window.location.href='${link.targetValue}'`;
      return `<a href="#" style="${DropdownStyles.dropdownItem}" onclick="${linkOnClick}">${link.content || link.targetValue}</a>`;
    }).join('');
    dropdownHtml += `</div>`;

    // Return the combined HTML: button followed immediately by the dropdown menu.
    return buttonHtml + dropdownHtml;
  }

  // Standard element rendering
  if (selfClosingTags.includes(tag)) {
    return `<${tag} ${attributesString} />`;
  } else {
    return `<${tag} ${attributesString}>${content || ''}${childrenHtml}</${tag}>`;
  }
}
