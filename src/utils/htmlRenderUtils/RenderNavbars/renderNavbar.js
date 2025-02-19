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
  } = navbarElement;

  // 1) Convert each child to HTML and categorize them
  //    (logo = images, brand = special spans, links = normal spans, buttons = button/connectWallet)
  let logoHtml = '';
  let brandHtml = '';
  let linkHtmls = [];
  let buttonHtmls = [];

  children.forEach((child) => {
    const childHtml = renderElementToHtml(child, collectedStyles);

    // The type of the child is usually 'image', 'span', 'button', 'connectWalletButton', etc.
    if (child.type === 'image') {
      logoHtml += childHtml;
    } else if (child.type === 'span') {
      // For the customTemplate, you might treat a special "3S.Template" span as a brand
      if (configuration === 'customTemplate' && child.content === '3S.Template') {
        brandHtml += childHtml;
      } else {
        linkHtmls.push(childHtml);
      }
    } else if (child.type === 'button' || child.type === 'connectWalletButton') {
      buttonHtmls.push(childHtml);
    }
  });

  // 2) Merge default styles with user's custom styles,
  //    plus sub-rules for .logoContainer, .standardMenuContainer, etc.
  const className = `${id}`;

  // We'll define "base" as the main nav defaults.
  // For "customTemplate" we might use `CustomTemplateNavbarStyles.nav` as the base instead.
  let baseNavStyles = defaultNavbarStyles.nav; 
  if (configuration === 'customTemplate') {
    baseNavStyles = CustomTemplateNavbarStyles.nav;
  }

  // We do the same for sub-rules: if 'customTemplate', fallback to the custom style set:
  const mergedStyles = {
    ...baseNavStyles, // top-level nav
    ...styles,

    '.logoContainer': {
      ...(configuration === 'customTemplate'
        ? CustomTemplateNavbarStyles.logoContainer
        : defaultNavbarStyles.logoContainer),
    },
    // For convenience, let's define a "linksContainer" (or "navList") sub-rule
    '.linksContainer': {
      ...(configuration === 'customTemplate'
        ? CustomTemplateNavbarStyles.standardMenuContainer
        : defaultNavbarStyles.standardMenuContainer),
    },
    '.buttonContainer': {
      ...(configuration === 'customTemplate'
        ? CustomTemplateNavbarStyles.buttonContainer
        : defaultNavbarStyles.buttonContainer),
    },
    '.compactMenuIcon': {
      ...(configuration === 'customTemplate'
        ? CustomTemplateNavbarStyles.compactMenuIcon
        : defaultNavbarStyles.compactMenuIcon),
    },
    '.compactMenu': {
      ...(configuration === 'customTemplate'
        ? CustomTemplateNavbarStyles.compactMenu
        : defaultNavbarStyles.compactMenu),
    },
  };

  // 3) Depending on the layout (twoColumn / threeColumn / customTemplate),
  //    produce slightly different HTML groupings
  let navbarHtml = '';
  
  if (configuration === 'twoColumn') {
    // - Left = logoHtml
    // - Right = (links + brandHtml + buttons) or brand can also be combined with links
    navbarHtml = `
      <nav id="${className}" class="${className}">
        <div class="logoContainer">
          ${logoHtml}
        </div>
        <div class="linksContainer">
          <!-- If you have a brandHtml, you could place it before links -->
          ${brandHtml ? brandHtml : ''}
          ${linkHtmls.join('\n')}
          <div class="buttonContainer">
            ${buttonHtmls.join('\n')}
          </div>
        </div>
      </nav>
    `.trim();
  } else if (configuration === 'threeColumn') {
    // - Left = logo
    // - Middle = links
    // - Right = brand + buttons (or brand could be middle, etc.)
    navbarHtml = `
      <nav id="${className}" class="${className}">
        <div class="logoContainer">
          ${logoHtml}
        </div>
        <div class="linksContainer">
          ${linkHtmls.join('\n')}
        </div>
        <div class="buttonContainer">
          ${brandHtml}
          ${buttonHtmls.join('\n')}
        </div>
      </nav>
    `.trim();
  } else if (configuration === 'customTemplate') {
    // The "classic" left/logo + brand, center=links, right=buttons approach
    navbarHtml = `
      <nav id="${className}" class="${className}">
        <div class="logoContainer">
          ${logoHtml}
          ${brandHtml}
        </div>
        <div class="linksContainer">
          ${linkHtmls.join('\n')}
        </div>
        <div class="buttonContainer">
          ${buttonHtmls.join('\n')}
        </div>
      </nav>
    `.trim();
  } else {
    // fallback if unknown
    navbarHtml = `
      <nav class="${className}">
        ${logoHtml}
        ${brandHtml}
        ${linkHtmls.join('\n')}
        ${buttonHtmls.join('\n')}
      </nav>
    `.trim();
  }

  // 4) Push the final merged styles
  collectedStyles.push({
    className,
    styles: mergedStyles,
  });

  return navbarHtml;
}
