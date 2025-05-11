import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { pinata, pinataSDK, pinataConfig } from '../../utils/configPinata';
import { renderElementToHtml } from '../../utils/htmlRender'; // Your render method
import { defaultHeroStyles, CustomTemplateHeroStyles, heroTwoStyles } from '../../Elements/Sections/Heros/defaultHeroStyles';
import { ctaOneStyles, ctaTwoStyles } from '../../Elements/Sections/CTAs/defaultCtaStyles';
import { defaultDeFiStyles } from '../../Elements/Sections/Web3Related/DeFiSection';
// Import your hierarchy builder – this should nest elements with a valid parentId.
import { buildHierarchy } from '../../utils/LeftBarUtils/elementUtils';
import { SimplefooterStyles, TemplateFooterStyles } from '../../Elements/Sections/Footers/defaultFooterStyles';
import { structureConfigurations, mergeStyles } from '../../core/configs/elementConfigs';
import { pinDirectoryToPinata } from '../../utils/ipfs';
import '../css/Topbar.css';
import SnsDomainSelector from './Deployements/SnsDomainSelector';
import { elementTypes } from '../../core/configs/elementConfigs';
const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Helper: Convert camelCase to kebab-case
 */
function camelToKebab(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Helper: Validate and format color values
 */
function formatColorValue(value) {
  if (!value || typeof value !== 'string') return '';
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) return value;
  if (/^[a-zA-Z]+$/.test(value)) return value;
  if (/^(rgb|rgba|hsl|hsla)/.test(value)) return value;
  if (/^[A-Fa-f0-9]{6}$/.test(value)) return `#${value}`;
  return value;
}

/**
 * Helper: Merge default styles into an element.
 * For hero elements, we merge the appropriate default style (including heroTwoStyles)
 * with any user overrides. Extend this function as needed.
 */
function mergeDefaultsIntoElement(element) {
  // Handle hero elements
  if (element.type === 'hero') {
    let baseHeroSection = defaultHeroStyles.heroSection;
    if (element.configuration === 'heroThree' || element.configuration === 'customTemplate') {
      baseHeroSection = CustomTemplateHeroStyles.heroSection;
    } else if (element.configuration === 'heroTwo') {
      baseHeroSection = heroTwoStyles.heroSection;
    }
    element.styles = {
      ...baseHeroSection,
      ...element.styles,
    };
  }
  
  // Handle CTA elements
  if (element.type === 'cta') {
    const ctaStyles = element.configuration === 'ctaTwo' ? ctaTwoStyles : ctaOneStyles;
    element.styles = {
      ...ctaStyles.ctaSection,
      ...element.styles,
    };
  }

  // Handle DeFi elements
  if (element.type === 'defi') {
    element.styles = {
      ...defaultDeFiStyles.section,
      ...element.styles,
    };
  }

  // Handle form elements
  if (element.type === 'input' || element.type === 'textarea' || element.type === 'button') {
    const defaultFormStyles = {
      input: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
      },
      textarea: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        minHeight: '100px',
      },
      button: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      }
    };
    element.styles = {
      ...defaultFormStyles[element.type],
      ...element.styles,
    };
  }

  // Handle text elements
  if (element.type === 'paragraph' || element.type === 'heading') {
    const defaultTextStyles = {
      paragraph: {
        fontSize: '16px',
        lineHeight: '1.5',
        margin: '0 0 16px 0',
      },
      heading: {
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }
    };
    element.styles = {
      ...defaultTextStyles[element.type],
      ...element.styles,
    };
  }

  return element;
}

/**
 * Helper: Process styles for export
 * This ensures styles are properly formatted and includes any necessary vendor prefixes
 */
function processStylesForExport(styles) {
  const processedStyles = { ...styles };
  
  // Handle vendor prefixes
  if (styles.transform) {
    processedStyles.WebkitTransform = styles.transform;
    processedStyles.MozTransform = styles.transform;
    processedStyles.msTransform = styles.transform;
  }
  
  if (styles.transition) {
    processedStyles.WebkitTransition = styles.transition;
    processedStyles.MozTransition = styles.transition;
    processedStyles.msTransition = styles.transition;
  }
  
  // Handle special cases
  if (styles.backgroundImage) {
    processedStyles.backgroundImage = styles.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, (match, url) => {
      return `url('${url}')`;
    });
  }
  
  return processedStyles;
}

// Add missing element types
defaultDeFiStyles.section = defaultDeFiStyles.section || {};

// In processElementStyles, skip unknown types gracefully
function processElementStyles(element) {
  const elementType = elementTypes[element.type];
  if (!elementType) {
    // Instead of warning, just skip or provide a default
    return {};
  }

  // Get structure configuration styles if present
  const structureConfig = element.configuration ?
    structureConfigurations[element.configuration] : null;
  const structureStyles = structureConfig?.styles || {};

  // Special handling for sections and navbars
  const isSection = element.type === 'section' || element.type === 'defiNavbar' || element.type === 'navbar';
  if (isSection) {
    // Always include base styles for sections
    const baseStyles = {
      display: 'flex',
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
    return {};
  }

  const mergedStyles = mergeStyles(
    structureStyles,
    element.styles || {},
    element.inlineStyles || {}
  );

  const { outline, boxShadow, ...productionStyles } = mergedStyles;

  Object.entries(productionStyles).forEach(([key, value]) => {
    if (key.includes('color') || key.includes('background')) {
      productionStyles[key] = formatColorValue(value);
    }
  });

  return productionStyles;
}

function cleanEmptyDivs(html) {
  // Remove empty divs with only style attributes
  return html.replace(/<div style="[^"]*"><\/div>/g, '');
}

function fixClassName(html) {
  // Replace classname with class
  return html.replace(/classname=/g, 'class=');
}

/**
 * Helper: Convert style object to CSS string
 */
function styleObjectToString(styles) {
  if (!styles) return '';
  return Object.entries(styles)
    .filter(([_, value]) => value != null)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');
}

/**
 * exportProject
 * • Builds a hierarchy from the flat element tree.
 * • Merges default styles into each element (recursively).
 * • Renders the HTML using your renderElementToHtml function.
 * • Injects global styles and wraps the content in a main container.
 */
function exportProject(elements, websiteSettings) {
  let bodyHtml = '';
  const processedElements = new Set();
  const collectedStyles = [];
  const userScripts = new Set();

  // Helper to generate style string
  function getStyleString(element) {
    const processedStyles = processElementStyles(element);
    return Object.entries(processedStyles)
      .filter(([k, v]) => k != null && v != null)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }

  // Helper to sanitize class names
  function sanitizeClassName(className) {
    if (!className) return '';
    return className.replace(/class=/g, 'className=');
  }

  // Helper to clean up empty divs
  function cleanEmptyDivs(html) {
    return html.replace(/<div[^>]*>\s*<\/div>/g, '');
  }

  // Helper to fix class names
  function fixClassName(html) {
    return html.replace(/className=/g, 'class=');
  }

  // Helper to build element hierarchy
  function buildElementHierarchy(elements) {
    const elementMap = new Map();
    const rootElements = [];

    // First pass: create element map and preserve section structure
    elements.forEach(element => {
      const isSection = element.type === 'section' || element.type === 'defiNavbar' || element.type === 'navbar';
      elementMap.set(element.id, {
        ...element,
        children: [],
        isSection,
        // Preserve section-specific attributes
        ...(isSection && {
          role: 'navigation',
          'aria-label': element.type === 'navbar' ? 'Main Navigation' : `Section ${element.type}`
        })
      });
    });

    // Second pass: build hierarchy while preserving section structure
    elements.forEach(element => {
      const mappedElement = elementMap.get(element.id);
      if (element.parentId) {
        const parent = elementMap.get(element.parentId);
        if (parent) {
          // Ensure sections maintain their structure
          if (mappedElement.isSection) {
            parent.children.push({
              ...mappedElement,
              className: `${mappedElement.className || ''} section-${mappedElement.type}`.trim()
            });
          } else {
          parent.children.push(mappedElement);
          }
        }
      } else {
        rootElements.push(mappedElement);
      }
    });

    return rootElements;
  }

  // Process elements and build HTML
  const hierarchicalElements = buildElementHierarchy(elements);
  
  // Render each root element and its children recursively
  hierarchicalElements.forEach(element => {
    if (!processedElements.has(element.id)) {
      let renderedContent;

      // Special handling for sections and navbars
      if (element.type === 'hero') {
        // Group children by type
        const image = element.children.find(child => child?.type === 'image');
        const heading = element.children.find(child => child?.type === 'heading');
        const paragraph = element.children.find(child => child?.type === 'paragraph');
        const button = element.children.find(child => child?.type === 'button');

        // Content container styles based on hero type
        const contentContainerStyles = element.configuration === 'heroTwo' ? 
          'display: flex; justify-content: center; align-items: center; flex-direction: column; background-color: transparent' :
          element.configuration === 'heroThree' ?
          'display: flex; justify-content: flex-start; align-items: flex-start; flex-direction: column; background-color: transparent; max-width: 40%; width: 40%' :
          'display: flex; justify-content: center; align-items: center; flex-direction: column; background-color: transparent; max-width: 40%; width: 40%';

        // Left content group
        const leftContentHtml = `
          <div style="${contentContainerStyles}">
            ${heading ? `
              <h3 id="${heading.id}" style="font-size: 2.5rem; font-weight: bold; margin-bottom: 16px; color: ${element.configuration === 'heroTwo' ? '#ffffff' : '#1a1a1a'}">${heading.content}</h3>
            ` : ''}
            ${paragraph ? `
              <div id="${paragraph.id}" style="font-size: 1rem; line-height: 1.5; margin-bottom: 24px; color: ${element.configuration === 'heroTwo' ? '#ffffff' : '#1a1a1a'}">${paragraph.content}</div>
            ` : ''}
            ${button ? `
              <button id="${button.id}" style="background-color: #334155; color: #ffffff; padding: 12px 24px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; font-size: 1rem">${button.content}</button>
            ` : ''}
          </div>
        `;

        // Right content group (image)
        const rightContentHtml = image ? `
          <div style="background-color: transparent; max-width: 40%; width: 40%; display: flex; justify-content: flex-end; align-items: center;">
            <img id="${image.id}" style="max-width: 100%; height: 400px; background-color: #334155; object-fit: cover; border-radius: 8px" src="${image.content}" alt="">
          </div>
        ` : '';

        // Get base styles based on hero configuration
        let baseHeroStyles = {
          display: 'flex',
          position: 'relative',
          flexDirection: element.configuration === 'heroTwo' ? 'column' : 'row',
          flexWrap: 'wrap',
          alignItems: element.configuration === 'heroThree' ? 'flex-start' : 'center',
          justifyContent: element.configuration === 'heroThree' ? 'space-between' : 'center',
          padding: element.configuration === 'heroTwo' ? '60px' : '40px',
          backgroundColor: element.configuration === 'heroTwo' ? '#6B7280' : '#ffffff',
          gap: element.configuration === 'heroThree' ? '10vw' : '1rem',
          margin: '0',
          color: element.configuration === 'heroTwo' ? '#fff' : 'inherit',
          textAlign: element.configuration === 'heroTwo' ? 'center' : 'left',
          borderRadius: element.configuration === 'heroTwo' ? '8px' : '0'
        };

        // Merge with any custom styles
        const heroStyles = {
          ...baseHeroStyles,
          ...element.styles
        };

        const heroStyleString = Object.entries(heroStyles)
          .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
          .join('; ');

        renderedContent = `
          <div id="${element.id}" class="section-hero" style="${heroStyleString}">
            ${leftContentHtml}
            ${element.configuration !== 'heroTwo' ? rightContentHtml : ''}
          </div>
        `;
      } else if (element.type === 'navbar') {
        // Group children by type
        const logo = element.children.find(child => child?.type === 'image');
        const spans = element.children.filter(child => child?.type === 'span');
        const buttons = element.children.filter(child => child?.type === 'button' || child?.type === 'connectWalletButton');
        
        // Get base styles based on navbar configuration
        let baseNavbarStyles = {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#ffffff',
          flexWrap: 'wrap',
          position: 'relative',
          borderRadius: '4px'
        };

        // Override styles for specific navbar types
        if (element.configuration === 'defiNavbar') {
          baseNavbarStyles = {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)'
          };
        }

        // Merge with any custom styles
        const navbarStyles = {
          ...baseNavbarStyles,
          ...element.styles
        };

        const navbarStyleString = Object.entries(navbarStyles)
          .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
          .join('; ');

        // Different structure based on navbar type
        if (element.configuration === 'twoColumn') {
          renderedContent = `
            <nav id="${element.id}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${logo ? `
                  <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${logo.content}" alt="">
                ` : ''}
              </div>
              <div style="display: flex; align-items: center; flex: 1; gap: 30px; justify-content: flex-end;">
                ${spans.map((span, index) => `
                  <span id="${span.id}" style="color: #1a1a1a; cursor: pointer${index === spans.length - 1 ? '; margin-right: 16px;' : ''}">${span.content}</span>
                `).join('')}
              </div>
            </nav>
          `;
        } else if (element.configuration === 'threeColumn') {
          renderedContent = `
            <nav id="${element.id}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${logo ? `
                  <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${logo.content}" alt="">
                ` : ''}
              </div>
              <div style="display: flex; align-items: center; justify-content: center; flex: 1;">
                ${spans.map((span, index) => `
                  <span id="${span.id}" style="color: #1a1a1a; cursor: pointer; margin-right: 16px">${span.content}</span>
                `).join('')}
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                ${buttons.map(button => `
                  <button id="${button.id}" style="border: none; padding: 10px 20px; background-color: #334155; color: #ffffff; cursor: pointer">${button.content}</button>
                `).join('')}
              </div>
            </nav>
          `;
        } else {
          // Logo group with image and first span (brand name)
          const logoGroupHtml = `
            <div style="display: flex; align-items: center; gap: 12px;">
              ${logo ? `
                <img id="${logo.id}" style="width: 40px; height: 40px; border-radius: 50%; color: #1a1a1a" src="${logo.content}" alt="">
              ` : ''}
              ${spans[0] ? `
                <span id="${spans[0].id}" style="color: #1a1a1a; cursor: pointer">${spans[0].content}</span>
              ` : ''}
            </div>
          `;

          // Navigation links (remaining spans)
          const navGroupHtml = spans.length > 1 ? `
            <div style="display: flex; align-items: center; justify-content: center; flex: 1;">
              ${spans.slice(1).map(span => `
                <span id="${span.id}" style="color: #1a1a1a; cursor: pointer; margin-right: 16px">${span.content}</span>
              `).join('')}
            </div>
          ` : '';

          // Button group
          const buttonGroupHtml = buttons.length > 0 ? `
            <div style="display: flex; align-items: center; gap: 16px;">
              ${buttons.map(button => `
                <button id="${button.id}" style="border: none; padding: 10px 20px; background-color: #334155; color: #ffffff; cursor: pointer">${button.content}</button>
              `).join('')}
            </div>
          ` : '';

          renderedContent = `
            <nav id="${element.id}" class="section-navbar" role="navigation" aria-label="Main Navigation" style="${navbarStyleString}">
              ${logoGroupHtml}
              ${navGroupHtml}
              ${buttonGroupHtml}
            </nav>
          `;
        }
      } else if (element.type === 'section') {
        // Group children by type
        const label = element.children.find(child => child?.type === 'span');
        const heading = element.children.find(child => child?.type === 'heading');
        const paragraph = element.children.find(child => child?.type === 'paragraph');
        const buttons = element.children.filter(child => child?.type === 'button');
        const image = element.children.find(child => child?.type === 'image');
        const features = element.children.filter(child => child?.type === 'featureItem');

        // Base styles for all sections
        const baseStyles = {
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '60px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        };

        // Merge with any custom styles
        const sectionStyles = {
          ...baseStyles,
          ...element.styles
        };

        const sectionStyleString = Object.entries(sectionStyles)
          .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
          .join('; ');

        let contentHtml = '';

        // Generate content based on section type
        if (element.configuration === 'sectionOne') {
          contentHtml = `
            <div style="display: flex; gap: 32px; align-items: center;">
              <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
                ${label ? `<span style="color: #6B7280; font-size: 14px; font-weight: 700; text-transform: uppercase;">${label.content}</span>` : ''}
                ${heading ? `<h2 style="font-size: 32px; font-weight: bold; color: #1F2937;">${heading.content}</h2>` : ''}
                ${paragraph ? `<p style="font-size: 16px; line-height: 1.5; color: #4B5563;">${paragraph.content}</p>` : ''}
                ${buttons.length > 0 ? `
                  <div style="display: flex; gap: 12px; margin-top: 24px;">
                    ${buttons.map(button => `
                      <button style="background-color: #334155; color: #ffffff; padding: 12px 24px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; font-size: 1rem">${button.content}</button>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              ${image ? `
                <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                  <img src="${image.content}" alt="" style="max-width: 100%; height: 400px; object-fit: cover; border-radius: 8px;">
                </div>
              ` : ''}
            </div>
          `;
        } else if (element.configuration === 'sectionTwo') {
          contentHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              ${label ? `<span style="color: #6B7280; font-size: 14px; font-weight: 700; text-transform: uppercase;">${label.content}</span>` : ''}
              ${heading ? `<h2 style="font-size: 32px; font-weight: bold; color: #1F2937; margin: 16px 0;">${heading.content}</h2>` : ''}
              ${buttons.length > 0 ? `
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                  ${buttons.map(button => `
                    <button style="background-color: #334155; color: #ffffff; padding: 12px 24px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; font-size: 1rem">${button.content}</button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        } else if (element.configuration === 'sectionThree') {
          contentHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              ${label ? `<span style="color: #6B7280; font-size: 14px; font-weight: 700; text-transform: uppercase;">${label.content}</span>` : ''}
              ${heading ? `<h2 style="font-size: 32px; font-weight: bold; color: #1F2937; margin: 16px 0;">${heading.content}</h2>` : ''}
              ${paragraph ? `<p style="font-size: 16px; line-height: 1.5; color: #4B5563; max-width: 600px; margin: 0 auto;">${paragraph.content}</p>` : ''}
            </div>
          `;
        } else if (element.configuration === 'sectionFour') {
          contentHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              ${label ? `<span style="color: #6B7280; font-size: 14px; font-weight: 700; text-transform: uppercase;">${label.content}</span>` : ''}
              ${heading ? `<h2 style="font-size: 32px; font-weight: bold; color: #1F2937; margin: 16px 0;">${heading.content}</h2>` : ''}
              ${features.length > 0 ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; width: 100%; margin: 24px 0;">
                  ${features.map(feature => `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                      ${feature.children.find(child => child.type === 'icon') ? `
                        <img src="${feature.children.find(child => child.type === 'icon').src}" alt="" style="width: 48px; height: 48px; object-fit: contain;">
                      ` : ''}
                      ${feature.children.find(child => child.type === 'paragraph') ? `
                        <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">${feature.children.find(child => child.type === 'paragraph').content}</p>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${buttons.length > 0 ? `
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                  ${buttons.map(button => `
                    <button style="background-color: #334155; color: #ffffff; padding: 12px 24px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; transition: all 0.2s ease; font-size: 1rem">${button.content}</button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }

        renderedContent = `
          <section id="${element.id}" class="section ${element.configuration}" style="${sectionStyleString}">
            ${contentHtml}
          </section>
        `;
      } else if (element.type === 'cta') {
        const ctaConfig = element.configuration;
        const isCtaOne = ctaConfig === 'ctaOne';
        const isCtaTwo = ctaConfig === 'ctaTwo';

        // Group children by type
        const title = element.children.find(child => child.type === 'title');
        const paragraph = element.children.find(child => child.type === 'paragraph');
        const buttons = element.children.filter(child => child.type === 'button');
        const image = element.children.find(child => child.type === 'image');

        // Base styles for CTA
        const baseStyles = {
          display: 'flex',
          position: 'relative',
          flexDirection: isCtaTwo ? 'column' : 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isCtaTwo ? '40px' : '48px 24px',
          backgroundColor: '#FFFFFF',
          gap: isCtaTwo ? '24px' : '32px',
          margin: 0,
          color: '#1a1a1a',
          textAlign: isCtaTwo ? 'center' : 'left',
          borderRadius: '8px',
          width: '100%'
        };

        // Merge with custom styles
        const mergedStyles = mergeStyles(baseStyles, element.styles);

        // Generate HTML content
        let htmlContent = `<div id="${element.id}" class="section-cta" style="${styleObjectToString(mergedStyles)}">`;

        // Content container for CTAOne
        if (isCtaOne) {
          htmlContent += `
            <div style="display: flex; justify-content: flex-start; align-items: center; flex-direction: column; background-color: transparent; max-width: 50%; width: 50%">
              ${title ? `<h2 id="${title.id}" style="font-size: 48px; font-weight: 700; line-height: 1.2; text-align: center; color: #1A1A1A; margin-bottom: 16px">${title.content}</h2>` : ''}
              ${paragraph ? `<div id="${paragraph.id}" style="font-size: 18px; line-height: 1.6; text-align: center; color: #4A4A4A; max-width: 600px; margin-bottom: 24px">${paragraph.content}</div>` : ''}
              <div style="display: flex; flex-flow: wrap; align-items: center; justify-content: center; gap: 16px; padding: 10px; margin: 10px 0px; position: relative">
                ${buttons.map((button, index) => {
                  const buttonStyles = {
                    padding: '12px 24px',
                    backgroundColor: 'rgb(51, 65, 85)',
                    color: 'rgb(255, 255, 255)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'text',
                    transition: '0.2s',
                    outline: 'none'
                  };
                  return `
                    <div style="position: relative; box-sizing: border-box">
                      <button id="${button.id}" contenteditable="false" style="${styleObjectToString(buttonStyles)}">${button.content}</button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            ${image ? `
              <div style="display: flex; justify-content: flex-end; align-items: center; max-width: 40%; width: 40%">
                <img id="${image.id}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; overflow: hidden" src="${image.content}" alt="">
              </div>
            ` : ''}`;
        }
        // Content container for CTATwo
        else if (isCtaTwo) {
          htmlContent += `
            <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; background-color: transparent; width: 100%">
              ${title ? `<h2 id="${title.id}" style="font-size: 2rem; font-weight: bold; margin-bottom: 16px; color: #1a1a1a">${title.content}</h2>` : ''}
              <div style="display: flex; flex-flow: wrap; align-items: center; justify-content: center; gap: 16px; padding: 10px; margin: 10px 0px; position: relative">
                ${buttons.map((button, index) => {
                  const buttonStyles = {
                    padding: '12px 24px',
                    backgroundColor: 'rgb(51, 65, 85)',
                    color: 'rgb(255, 255, 255)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'text',
                    transition: '0.2s',
                    outline: 'none'
                  };
                  return `
                    <div style="position: relative; box-sizing: border-box">
                      <button id="${button.id}" contenteditable="false" style="${styleObjectToString(buttonStyles)}">${button.content}</button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>`;
        }

        htmlContent += '</div>';
        renderedContent = htmlContent;
      } else {
        renderedContent = renderElementToHtml({
        ...element,
        style: getStyleString(element),
        className: element.className ? `${sanitizeClassName(element.className)} ${element.id}` : element.id,
        ...(element.attributes || {}),
        ...(element.dataAttributes || {}),
        ...(element.events || {})
      }, collectedStyles);
      }

      if (renderedContent) {
        let cleanedContent = cleanEmptyDivs(renderedContent);
        cleanedContent = fixClassName(cleanedContent);
        bodyHtml += cleanedContent;
        processedElements.add(element.id);
      }
    }
  });

  // Generate styles HTML
  const stylesHtml = `
    <style>
    body{
      margin: 0;
      padding: 0;
    }
      /* Preserve element-specific styles */
      ${collectedStyles.map(style => `
        .${style.className} {
          ${Object.entries(style.styles)
            .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
            .join(';\n          ')}
        }
      `).join('\n')}

      /* Section-specific responsive styles */
      @media (max-width: 768px) {
        .section-navbar {
          flex-direction: column;
          padding: 12px 16px;
        }
        .section-navbar > div {
          width: 100%;
          justify-content: center;
        }
        .section-navbar span {
          margin: 8px 0;
        }
      }
    </style>
  `;

  // Generate the final HTML
  const title = websiteSettings.siteTitle || 'Exported Website';
  const favicon = websiteSettings.faviconUrl || '/favicon.ico';

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" href="${favicon}">
      <title>${title}</title>
      ${stylesHtml}
    </head>
    <body>
          ${bodyHtml}
    </body>
    </html>
  `.trim();

  return fullHtml;
}

const ExportSection = ({ elements, websiteSettings, userId, projectId, onProjectPublished }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSnsSelector, setShowSnsSelector] = useState(false);
  const dropdownRef = useRef(null);

  // Get wallet address from session storage
  const walletAddress = sessionStorage.getItem("userAccount");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanElementData = (element) => {
    if (!element) {
      console.warn('Received null or undefined element');
      return null;
    }

    try {
      // Validate element type
      const elementType = elementTypes[element.type];
      if (!elementType) {
        console.warn(`Invalid element type: ${element.type}`);
        return null;
      }

      // Create a new object with only valid properties
      const cleanedElement = {
        id: element.id || '',
        type: element.type,
        content: element.content || '',
        parentId: element.parentId || null,
        children: Array.isArray(element.children) ? element.children : [],
        configuration: element.configuration || '',
        className: element.className || '',
        attributes: element.attributes || {},
        dataAttributes: element.dataAttributes || {},
        events: element.events || {},
      };

      // Add type-specific properties
      if (element.type === 'image') {
        cleanedElement.src = element.src || 'https://via.placeholder.com/400x300';
      }

      // Process styles
      cleanedElement.styles = processElementStyles(element);

      // Validate required properties
      const missingProps = elementType.requiredProps.filter(prop => !cleanedElement[prop]);
      if (missingProps.length > 0) {
        console.warn(`Element missing required properties: ${missingProps.join(', ')}`);
        return null;
      }

      return cleanedElement;
    } catch (error) {
      console.error('Error cleaning element:', error, element);
      return null;
    }
  };

  const handleDeployToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS...');
    try {
      if (!userId || !projectId) {
        const errorMsg = !userId ? 'No valid user ID found!' : 'No valid project ID found!';
        setAutoSaveStatus(`Error: ${errorMsg}`);
        return null;
      }

      const sanitizedUserId = userId.toString().trim();
      const sanitizedProjectId = projectId.toString().trim();

      if (!sanitizedUserId || !sanitizedProjectId) {
        setAutoSaveStatus('Error: Invalid user ID or project ID format');
        return null;
      }

      const projectRef = doc(db, 'projects', sanitizedUserId, 'ProjectRef', sanitizedProjectId);
      
      if (!Array.isArray(elements)) {
        setAutoSaveStatus('Error: Invalid elements data');
        return null;
      }

      // Log the original elements
      console.log('Original elements:', elements);

      // Clean and validate elements data
      const cleanedElements = elements
        .map(cleanElementData)
        .filter(Boolean)
        .map(element => {
          // Additional validation for each element
          if (!element.id || !element.type) {
            console.warn('Invalid element found:', element);
            return null;
          }
          return element;
        })
        .filter(Boolean);

      // Log the cleaned elements
      console.log('Cleaned elements:', cleanedElements);

      // Clean and validate website settings
      const cleanedWebsiteSettings = {
        siteTitle: websiteSettings?.siteTitle || 'My Website',
        faviconUrl: websiteSettings?.faviconUrl || '',
        metaDescription: websiteSettings?.metaDescription || '',
        metaKeywords: websiteSettings?.metaKeywords || '',
        customStyles: websiteSettings?.customStyles || '',
        customScripts: websiteSettings?.customScripts || '',
      };

      // Log the data being sent to Firestore
      console.log('Data being sent to Firestore:', {
        elements: cleanedElements,
        websiteSettings: cleanedWebsiteSettings,
        userId: sanitizedUserId
      });

      await setDoc(projectRef, {
        elements: cleanedElements,
        websiteSettings: cleanedWebsiteSettings,
        lastUpdated: serverTimestamp(),
        userId: sanitizedUserId,
      }, { merge: true });

      const fullHtml = exportProject(cleanedElements, cleanedWebsiteSettings);
      
      const htmlBlob = new Blob([fullHtml], { 
        type: 'text/html;charset=utf-8'
      });
      
      const files = [{ 
        file: htmlBlob, 
        fileName: 'index.html',
        type: 'text/html'
      }];
      
      const metadata = {
        name: cleanedWebsiteSettings.siteTitle,
        keyvalues: { 
          userId: sanitizedUserId,
          timestamp: new Date().toISOString(),
          size: htmlBlob.size
        },
      };
      
      const ipfsHash = await pinDirectoryToPinata(files, metadata);
      
      if (!ipfsHash) {
        throw new Error('No IPFS hash returned from Pinata');
      }
      
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      
      await setDoc(projectRef, {
        ipfsUrl,
        ipfsHash,
        lastDeployed: serverTimestamp(),
      }, { merge: true });

      setAutoSaveStatus('IPFS deploy complete!');
      return ipfsUrl;
    } catch (error) {
      console.error('Deployment error:', error);
      setAutoSaveStatus('Error during deployment: ' + error.message);
      return null;
    }
  };

  const handlePublish = async () => {
    const ipfsUrl = await handleDeployToIPFS();
    
    if (ipfsUrl) {
      if (onProjectPublished) {
        onProjectPublished(ipfsUrl);
      }
      window.open(ipfsUrl, '_blank');
    }
    setIsDropdownOpen(false);
  };

  const handleSnsDeploy = () => {
    if (!walletAddress) {
      setAutoSaveStatus('Error: No Solana wallet connected');
      return;
    }
    setShowSnsSelector(true);
    setIsDropdownOpen(false);
  };

  const handleSnsDomainSelected = (domain) => {
    setShowSnsSelector(false);
    if (onProjectPublished) {
      onProjectPublished(`https://${domain}.sol`);
    }
  };

  const handleSnsCancel = () => {
    setShowSnsSelector(false);
  };

  const handleExport = () => {
    const html = exportProject(elements, websiteSettings);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  return (
    <div className="export-section" ref={dropdownRef}>
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>
      <div className="dropdown-container">
        <button 
          className="button" 
          onMouseEnter={() => setIsDropdownOpen(true)}
        >
          Publish
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handlePublish} className="dropdown-item">
              Publish to IPFS
            </button>
            <button 
              onClick={handleSnsDeploy} 
              className="dropdown-item"
              disabled={!walletAddress}
            >
              Deploy to SNS
            </button>
            <button onClick={handleExport} className="dropdown-item">
              Export Files
            </button>
          </div>
        )}
      </div>
      {showSnsSelector && (
        <SnsDomainSelector
          userId={userId}
          walletAddress={walletAddress}
          elements={elements}
          websiteSettings={websiteSettings}
          onDomainSelected={handleSnsDomainSelected}
          onCancel={handleSnsCancel}
          setAutoSaveStatus={setAutoSaveStatus}
          generateFullHtml={() => exportProject(elements, websiteSettings)}
          saveProjectToFirestore={async (userId, html, type, domain) => {
            const projectRef = doc(db, 'projects', userId);
            await setDoc(projectRef, {
              elements,
              websiteSettings: {
                ...websiteSettings,
                snsDomain: domain,
                walletAddress: walletAddress, // Store the wallet address
              },
              lastUpdated: serverTimestamp(),
              userId,
            }, { merge: true });
          }}
        />
      )}
    </div>
  );
};

export default ExportSection;