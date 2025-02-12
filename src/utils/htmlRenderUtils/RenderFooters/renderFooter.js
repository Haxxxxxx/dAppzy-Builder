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
  } = footerElement;

  // Depending on the config, we’ll group or position children in different ways:
  let footerHtml = '';
  
  // Decide how to build the DOM structure for each config:
  if (configuration === 'simple') {
    // 1) "Simple" config: single <footer> with all children inline (like your SimpleFooter)
    const childrenHtml = children
      .map((child) => renderElementToHtml(child, collectedStyles))
      .join('\n');
    footerHtml = `
      <footer class="element-${id} simpleFooter">
        ${childrenHtml}
      </footer>
    `.trim();
    
    // Merge style objects
    collectedStyles.push({
      className: `element-${id}`,
      styles: {
        ...SimplefooterStyles.simpleFooter, // top-level
        ...styles, // user overrides
      },
    });

  } else if (configuration === 'detailed') {
    // 2) "Detailed" config: single <footer> but you might want to place children
    // in certain sub-divs if needed. If your React code doesn't do sub-divs, you
    // can keep them all at the footer root.
    const childrenHtml = children
      .map((child) => renderElementToHtml(child, collectedStyles))
      .join('\n');
    footerHtml = `
      <footer class="element-${id} detailedFooter">
        ${childrenHtml}
      </footer>
    `.trim();

    collectedStyles.push({
      className: `element-${id}`,
      styles: {
        ...SimplefooterStyles.detailedFooter, // or DetailedFooterStyles.footer
        ...styles,
      },
    });

  } else if (configuration === 'template') {
    // 3) "Template" config: replicate the *three sections* (navigationLinks, branding, socialIcons)
    // plus optional “copyright” or other sections as you do in your TemplateFooter component.

    // Based on your TemplateFooter code, you typically do something like:
    // - First 3 spans = nav links
    // - 4th span = brand
    // - 5th span = copyright
    // - images = social icons
    // (Adjust if you want more robust grouping logic!)
    const spanChildren = children.filter((c) => c.type === 'span');
    const imageChildren = children.filter((c) => c.type === 'image');
    const navigationLinks = spanChildren.slice(0, 3);
    const branding = spanChildren[3];
    const copyright = spanChildren[4];
    const socialIcons = imageChildren; // everything else is images

    const navHtml = navigationLinks
      .map((child) => renderElementToHtml(child, collectedStyles))
      .join('\n');
    const brandingHtml = branding
      ? renderElementToHtml(branding, collectedStyles)
      : '';
    const copyrightHtml = copyright
      ? renderElementToHtml(copyright, collectedStyles)
      : '';
    const socialIconsHtml = socialIcons
      .map((child) => renderElementToHtml(child, collectedStyles))
      .join('\n');

    // Build final HTML with sub-divs:
    footerHtml = `
      <footer class="element-${id} templateFooter">
        <!-- left: navigation links -->
        <div class="navigationLinks">
          ${navHtml}
        </div>
        
        <!-- center: branding -->
        <div class="branding">
          ${brandingHtml}
        </div>
        
        <!-- right: social icons -->
        <div class="socialIcons">
          ${socialIconsHtml}
        </div>
      </footer>
    `.trim();

    // Merge styles from TemplateFooterStyles
    collectedStyles.push({
      className: `element-${id}`,
      styles: {
        ...TemplateFooterStyles.footer,
        ...styles, // user overrides

        // sub-rules
        '.navigationLinks': {
          ...TemplateFooterStyles.navigationLinks,
        },
        '.branding': {
          ...TemplateFooterStyles.branding,
        },
        '.socialIcons': {
          ...TemplateFooterStyles.socialIcons,
        },
        // etc...
      },
    });
  }

  return footerHtml;
}
