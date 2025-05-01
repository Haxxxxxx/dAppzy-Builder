import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { pinata, pinataSDK, pinataConfig } from '../../utils/configPinata';
import { renderElementToHtml } from '../../utils/htmlRender'; // Your render method
import { defaultHeroStyles, CustomTemplateHeroStyles, heroTwoStyles } from '../../Elements/Sections/Heros/defaultHeroStyles';
// Import your hierarchy builder – this should nest elements with a valid parentId.
import { buildHierarchy } from '../../utils/LeftBarUtils/elementUtils';

const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Helper: Convert camelCase to kebab-case.
 */
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Helper: Merge default styles into an element.
 * For hero elements, we merge the appropriate default style (including heroTwoStyles)
 * with any user overrides. Extend this function as needed.
 */
function mergeDefaultsIntoElement(element) {
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
  return element;
}

/**
 * exportProject
 * • Builds a hierarchy from the flat element tree.
 * • Merges default styles into each element (recursively).
 * • Renders the HTML using your renderElementToHtml function.
 * • Injects global styles and wraps the content in a main container.
 */
export function exportProject(elements, websiteSettings) {
  const collectedStyles = new Set();
  let bodyHtml = '';

  // 1. Build a hierarchy so that container elements nest their children.
  const hierarchicalElements = buildHierarchy(elements);

  // 2. Track processed elements to prevent duplicates
  const processedElements = new Set();

  // 3. Collect global styles first
  const globalStyles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      min-height: 100vh;
      overflow-x: hidden;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      display: flex;
      flex-direction: column;
    }
    .main-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    .navbar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: #fff;
      box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 12px;
      position: relative;
      z-index: 1000;
    }
    .navbar-logo {
      display: flex;
      align-items: center;
      gap: 2vh;
    }
    .navbar-logo img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 50%;
    }
    .navbar-links {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .navbar-links span {
      cursor: pointer;
      color: #222;
      margin-right: 16px;
    }
    .navbar-buttons {
      display: flex;
      gap: 16px;
      font-family: Roboto, sans-serif;
    }
    .navbar-buttons button {
      border: none;
      padding: 10px 20px;
      background-color: #334155;
      color: #ffffff;
      cursor: pointer;
    }
    .navbar-buttons button:last-child {
      background-color: #64748b;
    }
    .hero {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 4rem 2rem;
      position: relative;
    }
    .hero-left, .hero-right {
      flex: 1;
      min-width: 300px;
    }
    .hero-left {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 600px;
    }
    .hero-left h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .hero-left p {
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .hero-left button {
      background-color: #334155;
      color: #ffffff;
      padding: 12px 24px;
      font-weight: bold;
      border: none;
      border-radius: 4px;
      transition: 0.2s;
      font-size: 1rem;
    }
    .hero-right img {
      width: auto;
      height: 400px;
      object-fit: cover;
      border-radius: 8px;
    }
    .cta-section {
      width: 100%;
      text-align: center;
      padding: 4rem 2rem;
      position: relative;
    }
    .cta-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .cta-content h1 {
      font-size: 48px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      color: #1a1a1a;
    }
    .cta-content p {
      font-size: 18px;
      line-height: 1.6;
      text-align: center;
      color: #4a4a4a;
      max-width: 600px;
    }
    .cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .cta-buttons button {
      padding: 12px 24px;
      background-color: #4d70ff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .cta-image {
      width: 100%;
      max-width: 600px;
      height: auto;
      border-radius: 8px;
      overflow: hidden;
    }
    .cta-image img {
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: 8px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    button {
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .hero {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
      }
      .hero-left, .hero-right {
        width: 100%;
        max-width: 100%;
      }
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      .navbar-links {
        justify-content: center;
      }
      .cta-section {
        padding: 2rem 1rem;
      }
      .cta-content h1 {
        font-size: 36px;
      }
      .cta-content p {
        font-size: 16px;
      }
    }
  `;
  collectedStyles.add(globalStyles);

  // Helper function to convert styles object to string
  function stylesToString(styles) {
    if (!styles) return '';
    return Object.entries(styles)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case and handle special cases
        const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        
        // Handle special cases for values that need quotes or special formatting
        if (key === 'backgroundImage' && value) {
          return `background-image: url('${value}')`;
        }
        if (key === 'fontFamily' && value) {
          return `font-family: ${value}`;
        }
        if (key === 'boxShadow' && value) {
          return `box-shadow: ${value}`;
        }
        if (key === 'transform' && value) {
          return `transform: ${value}`;
        }
        if (key === 'transition' && value) {
          return `transition: ${value}`;
        }
        if (key === 'content' && value) {
          return `content: "${value}"`;
        }
        if (key === 'background' && value) {
          return `background: ${value}`;
        }
        if (key === 'border' && value) {
          return `border: ${value}`;
        }
        if (key === 'borderRadius' && value) {
          return `border-radius: ${value}`;
        }
        if (key === 'textAlign' && value) {
          return `text-align: ${value}`;
        }
        if (key === 'display' && value) {
          return `display: ${value}`;
        }
        if (key === 'flexDirection' && value) {
          return `flex-direction: ${value}`;
        }
        if (key === 'justifyContent' && value) {
          return `justify-content: ${value}`;
        }
        if (key === 'alignItems' && value) {
          return `align-items: ${value}`;
        }
        if (key === 'gap' && value) {
          return `gap: ${value}`;
        }
        if (key === 'padding' && value) {
          return `padding: ${value}`;
        }
        if (key === 'margin' && value) {
          return `margin: ${value}`;
        }
        if (key === 'width' && value) {
          return `width: ${value}`;
        }
        if (key === 'height' && value) {
          return `height: ${value}`;
        }
        if (key === 'maxWidth' && value) {
          return `max-width: ${value}`;
        }
        if (key === 'minWidth' && value) {
          return `min-width: ${value}`;
        }
        if (key === 'maxHeight' && value) {
          return `max-height: ${value}`;
        }
        if (key === 'minHeight' && value) {
          return `min-height: ${value}`;
        }
        if (key === 'position' && value) {
          return `position: ${value}`;
        }
        if (key === 'top' && value) {
          return `top: ${value}`;
        }
        if (key === 'right' && value) {
          return `right: ${value}`;
        }
        if (key === 'bottom' && value) {
          return `bottom: ${value}`;
        }
        if (key === 'left' && value) {
          return `left: ${value}`;
        }
        if (key === 'zIndex' && value) {
          return `z-index: ${value}`;
        }
        if (key === 'opacity' && value) {
          return `opacity: ${value}`;
        }
        if (key === 'backgroundColor' && value) {
          return `background-color: ${value}`;
        }
        if (key === 'color' && value) {
          return `color: ${value}`;
        }
        if (key === 'fontSize' && value) {
          return `font-size: ${value}`;
        }
        if (key === 'fontWeight' && value) {
          return `font-weight: ${value}`;
        }
        if (key === 'lineHeight' && value) {
          return `line-height: ${value}`;
        }
        if (key === 'letterSpacing' && value) {
          return `letter-spacing: ${value}`;
        }
        if (key === 'textTransform' && value) {
          return `text-transform: ${value}`;
        }
        if (key === 'textDecoration' && value) {
          return `text-decoration: ${value}`;
        }
        if (key === 'cursor' && value) {
          return `cursor: ${value}`;
        }
        if (key === 'pointerEvents' && value) {
          return `pointer-events: ${value}`;
        }
        if (key === 'userSelect' && value) {
          return `user-select: ${value}`;
        }
        if (key === 'visibility' && value) {
          return `visibility: ${value}`;
        }
        if (key === 'whiteSpace' && value) {
          return `white-space: ${value}`;
        }
        if (key === 'wordBreak' && value) {
          return `word-break: ${value}`;
        }
        if (key === 'wordWrap' && value) {
          return `word-wrap: ${value}`;
        }
        if (key === 'overflow' && value) {
          return `overflow: ${value}`;
        }
        if (key === 'overflowX' && value) {
          return `overflow-x: ${value}`;
        }
        if (key === 'overflowY' && value) {
          return `overflow-y: ${value}`;
        }
        if (key === 'objectFit' && value) {
          return `object-fit: ${value}`;
        }
        if (key === 'borderTop' && value) {
          return `border-top: ${value}`;
        }
        if (key === 'borderRight' && value) {
          return `border-right: ${value}`;
        }
        if (key === 'borderBottom' && value) {
          return `border-bottom: ${value}`;
        }
        if (key === 'borderLeft' && value) {
          return `border-left: ${value}`;
        }
        if (key === 'borderRadius' && value) {
          return `border-radius: ${value}`;
        }
        if (key === 'boxShadow' && value) {
          return `box-shadow: ${value}`;
        }
        if (key === 'outline' && value) {
          return `outline: ${value}`;
        }
        if (key === 'outlineColor' && value) {
          return `outline-color: ${value}`;
        }
        if (key === 'outlineStyle' && value) {
          return `outline-style: ${value}`;
        }
        if (key === 'outlineWidth' && value) {
          return `outline-width: ${value}`;
        }
        if (key === 'outlineOffset' && value) {
          return `outline-offset: ${value}`;
        }
        if (key === 'resize' && value) {
          return `resize: ${value}`;
        }
        if (key === 'appearance' && value) {
          return `appearance: ${value}`;
        }
        if (key === 'backfaceVisibility' && value) {
          return `backface-visibility: ${value}`;
        }
        if (key === 'perspective' && value) {
          return `perspective: ${value}`;
        }
        if (key === 'perspectiveOrigin' && value) {
          return `perspective-origin: ${value}`;
        }
        if (key === 'transformStyle' && value) {
          return `transform-style: ${value}`;
        }
        if (key === 'transformOrigin' && value) {
          return `transform-origin: ${value}`;
        }
        if (key === 'animation' && value) {
          return `animation: ${value}`;
        }
        if (key === 'animationName' && value) {
          return `animation-name: ${value}`;
        }
        if (key === 'animationDuration' && value) {
          return `animation-duration: ${value}`;
        }
        if (key === 'animationTimingFunction' && value) {
          return `animation-timing-function: ${value}`;
        }
        if (key === 'animationDelay' && value) {
          return `animation-delay: ${value}`;
        }
        if (key === 'animationIterationCount' && value) {
          return `animation-iteration-count: ${value}`;
        }
        if (key === 'animationDirection' && value) {
          return `animation-direction: ${value}`;
        }
        if (key === 'animationFillMode' && value) {
          return `animation-fill-mode: ${value}`;
        }
        if (key === 'animationPlayState' && value) {
          return `animation-play-state: ${value}`;
        }
        if (key === 'transition' && value) {
          return `transition: ${value}`;
        }
        if (key === 'transitionProperty' && value) {
          return `transition-property: ${value}`;
        }
        if (key === 'transitionDuration' && value) {
          return `transition-duration: ${value}`;
        }
        if (key === 'transitionTimingFunction' && value) {
          return `transition-timing-function: ${value}`;
        }
        if (key === 'transitionDelay' && value) {
          return `transition-delay: ${value}`;
        }
        return `${kebabKey}: ${value}`;
      })
      .join(';');
  }

  // Helper function to render DeFi modules with JavaScript
  function renderDefiModule(element) {
    if (!element || processedElements.has(element.id)) return '';
    processedElements.add(element.id);

    const moduleData = {
      type: element.config?.type || 'swap',
      config: element.config || {},
      customScript: element.customScript || '',
      content: element.content || '',
      styles: element.styles || {}
    };
    
    return `
      <div class="defi-module" id="${element.id}" style="background-color: rgb(42, 42, 60); padding: 1.5rem; border-radius: 12px; color: rgb(255, 255, 255); cursor: pointer; position: relative;">
        <div style="margin-bottom: 1rem;">
          <h3 style="margin: 0px; font-size: 1.2rem; font-weight: bold; color: rgb(255, 255, 255);">DeFi Aggregator</h3>
          <div style="margin-top: 0.5rem; padding: 0.5rem; background-color: rgba(255, 0, 0, 0.1); border-radius: 4px; font-size: 0.9rem; color: rgb(255, 77, 79);">Connect your wallet to view DeFi data</div>
              </div>
        <div style="display: grid; gap: 1rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="opacity: 0.8;">Connected Wallet</span>
            <span style="font-weight: bold;">Not Connected</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="opacity: 0.8;">Total Pools</span>
            <span style="font-weight: bold;">Not Connected</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="opacity: 0.8;">Total Value Locked</span>
            <span style="font-weight: bold;">$0</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="opacity: 0.8;">Best APY</span>
            <span style="font-weight: bold;">Not Connected</span>
          </div>
        </div>
      </div>
    `;
  }

  // Helper function to collect custom scripts
  function collectCustomScripts(elements) {
    const scripts = new Set();
    
    function processElement(element) {
      if (!element) return;
      
      // Add element's custom script if it exists
      if (element.customScript) {
        scripts.add(element.customScript);
      }
      
      // Process children
      if (element.children) {
        element.children.forEach(processElement);
      }
    }
    
    elements.forEach(processElement);
    return Array.from(scripts);
  }

  // 4. Render elements in correct order
  function renderElement(element) {
    if (!element || processedElements.has(element.id)) return '';
    
    processedElements.add(element.id);
    let html = '';
    
    if (element.type === 'navbar') {
      // Remove box-shadow from navbar styles
      const navbarStyles = { ...element.styles };
      delete navbarStyles.boxShadow;
      
      html += `<nav class="navbar" id="${element.id}" style="${stylesToString(navbarStyles)}">`;
      if (element.children) {
        const logo = element.children.find(child => child.label === 'logo');
        const links = element.children.filter(child => child.type === 'span');
        const buttons = element.children.filter(child => child.type === 'button');
        
        if (logo) {
          html += `<div class="navbar-logo" style="display: flex; align-items: center; gap: 2vh;">`;
          if (logo.content) {
            html += `<img src="${logo.content}" alt="${logo.label}" style="width: 40px; height: 40px; object-fit: contain; display: block; max-width: 100%;" />`;
          }
          html += `</div>`;
        }
        
        if (links.length > 0) {
          html += `<div class="navbar-links" style="display: flex; gap: 16px; align-items: center;">`;
          links.forEach(link => {
            html += `<span style="cursor: pointer; color: #222; margin-right: 16px;">${link.content}</span>`;
          });
          html += `</div>`;
        }
        
        if (buttons.length > 0) {
          html += `<div class="navbar-buttons" style="display: flex; gap: 16px; font-family: Roboto, sans-serif;">`;
          buttons.forEach(button => {
            const buttonStyles = {
              ...button.styles,
              border: button.styles?.border || 'none',
              padding: button.styles?.padding || '10px 20px',
              backgroundColor: button.styles?.backgroundColor || '#334155',
              color: button.styles?.color || '#ffffff',
              cursor: button.styles?.cursor || 'pointer',
              borderRadius: button.styles?.borderRadius || '4px',
              fontSize: button.styles?.fontSize || '1rem',
              fontWeight: button.styles?.fontWeight || 'normal',
              transition: button.styles?.transition || 'all 0.2s ease'
            };
            html += `<button style="${stylesToString(buttonStyles)}">${button.content}</button>`;
          });
          html += `</div>`;
        }
      }
      html += `</nav>`;
    } else if (element.type === 'hero') {
      html += `<section class="hero" id="${element.id}" style="width: 100%;display: flex;align-items: center;gap: 2rem;padding: 4rem 2rem;position: relative;justify-content: center;">`;
      if (element.children) {
        const leftContent = element.children.find(child => child.id.includes('left'));
        const rightContent = element.children.find(child => child.id.includes('right'));
        
        if (leftContent) {
          html += `<div class="hero-left" style="flex: 1;min-width: 300px;display: flex;flex-direction: column;gap: 1.5rem;max-width: 600px;align-items: center;">`;
          leftContent.children?.forEach(child => {
            if (child.type === 'h1') {
              html += `<h1 style="">${child.content}</h1>`;
            } else if (child.type === 'p') {
              html += `<p style="">${child.content}</p>`;
            } else if (child.type === 'button') {
              html += `<button style="border: none;padding: 12px 24px;background-color: #334155;color: #ffffff;cursor: pointer;border-radius: 4px;font-size: 1rem;font-weight: bold;transition: 0.2s">${child.content}</button>`;
            } else {
              html += renderElement(child);
            }
          });
          html += `</div>`;
        }
        
        if (rightContent) {
          html += `<div class="hero-right" style="justify-content: center;align-items: center;">`;
          rightContent.children?.forEach(child => {
            if (child.type === 'img') {
              html += `<img src="${child.content}" alt="" style="">`;
            } else {
              html += renderElement(child);
            }
          });
          html += `</div>`;
        }
      }
      html += `</section>`;
    } else if (element.type === 'cta') {
      html += `<section class="cta-section" id="${element.id}" style="${stylesToString(element.styles)}">`;
      if (element.children) {
        const textContent = element.children.find(child => child.id.includes('text'));
        const buttonsContent = element.children.find(child => child.id.includes('buttons'));
        const imageContent = element.children.find(child => child.id.includes('image'));
        
        if (textContent) {
          html += `<div class="cta-content" style="${stylesToString(textContent.styles)}">`;
          textContent.children?.forEach(child => {
            html += renderElement(child);
          });
          html += `</div>`;
        }
        
        if (buttonsContent) {
          html += `<div class="cta-buttons" style="${stylesToString(buttonsContent.styles)}">`;
          buttonsContent.children?.forEach(child => {
            // Ensure all button styles are applied
            const buttonStyles = {
              ...child.styles,
              border: child.styles?.border || 'none',
              padding: child.styles?.padding || '12px 24px',
              backgroundColor: child.styles?.backgroundColor || '#4d70ff',
              color: child.styles?.color || '#ffffff',
              cursor: child.styles?.cursor || 'pointer',
              borderRadius: child.styles?.borderRadius || '4px',
              fontSize: child.styles?.fontSize || '16px',
              fontWeight: child.styles?.fontWeight || '600',
              transition: child.styles?.transition || 'background-color 0.2s'
            };
            html += `<button style="${stylesToString(buttonStyles)}">${child.content}</button>`;
          });
          html += `</div>`;
        }
        
        if (imageContent) {
          html += `<div class="cta-image" style="${stylesToString(imageContent.styles)}">`;
          imageContent.children?.forEach(child => {
            html += renderElement(child);
          });
          html += `</div>`;
        }
      }
      html += `</section>`;
    } else if (element.type === 'footer') {
      html += `<footer class="footer" id="${element.id}" style="background-color: #1F2937; color: #D1D5DB; padding: 2rem; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem; border-top: 2px solid #374151;">`;
      if (element.children) {
        element.children.forEach(child => {
          if (child.type === 'span') {
            html += `<span style="font-size: 1rem; color: #E5E7EB; font-weight: normal; line-height: 1.5; text-align: left; margin: 0; padding: 0.5rem;">${child.content}</span>`;
          } else if (child.type === 'img') {
            html += `<img src="${child.content}" alt="" style="width: 40px; height: 40px; object-fit: contain; display: block;" />`;
      } else {
            html += renderElement(child);
          }
        });
      }
      html += `</footer>`;
    } else if (element.type === 'defiSection') {
      // Only render the first 3 defiModule children
      const defiChildren = (element.children || []).slice(0, 3);
      html += `<section class="defi-section" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; background-color: rgb(29, 28, 43); color: rgb(255, 255, 255); border: none; border-radius: 16px; min-height: 600px; overflow: hidden;">
        <div class="defi-header" style="text-align: center; margin-bottom: 2rem; width: 100%;">
          <div style="position: relative; box-sizing: border-box;">
            <span style="font-size: 2rem; color: rgb(255, 255, 255); font-weight: bold; display: block; margin-bottom: 1rem;">Monitor your assets, track performance, and manage your DeFi portfolio with ease.</span>
          </div>
          <div style="position: relative; box-sizing: border-box;">
            <span style="font-size: 1rem; color: rgb(204, 204, 204); display: block; margin-bottom: 2rem;">Swap, stake, and lend your assets with ease</span>
          </div>
        </div>
        <div class="defi-modules-grid" style="position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 1100px; width: 100%; margin: 0 auto; justify-items: center; align-items: start;">
          ${defiChildren.map(child => renderDefiModule(child)).join('')}
        </div>
        <div class="defi-wallet-notice" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 255, 255, 0.1); padding: 1.5rem; border-radius: 12px; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); max-width: 420px; width: 90%; z-index: 2; box-shadow: 0 4px 32px rgba(0,0,0,0.18);">
          <div style="font-size: 1.2rem; font-weight: bold; color: rgb(255, 255, 255); margin-bottom: 0.5rem;">Wallet Not Connected</div>
          <div style="font-size: 0.9rem; color: rgb(204, 204, 204); margin-bottom: 1rem;">Please connect your wallet to view DeFi data and interact with this section</div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: rgb(76, 175, 80); font-size: 0.9rem;">
            <span>Tip:</span>
            <span>Add a Connect Wallet button to your page / Navbar to enable this section</span>
          </div>
        </div>
      </section>`;
    } else if (element.type === 'defiModule') {
      html += renderDefiModule(element);
    } else {
      // Handle basic elements
      if (element.type === 'section' || element.type === 'div') {
        const containerStyles = {
          ...element.styles,
          padding: element.styles?.padding || '1rem',
          gap: element.styles?.gap || '1rem',
          display: element.styles?.display || 'flex',
          flexDirection: element.styles?.flexDirection || 'column',
          alignItems: element.styles?.alignItems || 'flex-start',
          justifyContent: element.styles?.justifyContent || 'flex-start'
        };
        html += `<${element.type} id="${element.id}" class="${element.className || ''}" style="${stylesToString(containerStyles)}" data-custom-script="${element.customScript || ''}">`;
      }
      
      // Render content with all styles
      if (element.content) {
        if (element.type === 'image') {
          html += `<img src="${element.content}" alt="${element.label || ''}" style="${stylesToString(element.styles)}" />`;
        } else if (element.type === 'title' || element.type === 'heading') {
          html += `<h${element.level || 1} style="${stylesToString(element.styles)}">${element.content}</h${element.level || 1}>`;
        } else if (element.type === 'paragraph') {
          html += `<p style="${stylesToString(element.styles)}">${element.content}</p>`;
        } else if (element.type === 'button') {
          // Ensure all button styles are applied
          const buttonStyles = {
            ...element.styles,
            border: element.styles?.border || 'none',
            padding: element.styles?.padding || '10px 20px',
            backgroundColor: element.styles?.backgroundColor || '#334155',
            color: element.styles?.color || '#ffffff',
            cursor: element.styles?.cursor || 'pointer',
            borderRadius: element.styles?.borderRadius || '4px',
            fontSize: element.styles?.fontSize || '1rem',
            fontWeight: element.styles?.fontWeight || 'normal',
            transition: element.styles?.transition || 'all 0.2s ease'
          };
          html += `<button style="${stylesToString(buttonStyles)}">${element.content}</button>`;
        } else {
          // For spans and other text elements, ensure all styles are applied
          const textStyles = {
            ...element.styles,
            fontSize: element.styles?.fontSize || '1rem',
            color: element.styles?.color || '#222',
            fontWeight: element.styles?.fontWeight || 'normal',
            lineHeight: element.styles?.lineHeight || '1.5',
            textAlign: element.styles?.textAlign || 'left',
            margin: element.styles?.margin || '0',
            padding: element.styles?.padding || '0.5rem'
          };
          html += `<span style="${stylesToString(textStyles)}">${element.content}</span>`;
        }
      }
      
      // Render children
      if (element.children && element.children.length) {
        element.children.forEach(child => {
          html += renderElement(child);
        });
      }
      
      // Close container elements
      if (element.type === 'section' || element.type === 'div') {
        html += `</${element.type}>`;
      }
    }
    
    // Add responsive styles
    const responsiveStyles = `
      @media (max-width: 1200px) {
        .defi-modules-grid {
          grid-template-columns: repeat(2, 1fr);
          max-width: 750px;
        }
      }
      @media (max-width: 900px) {
        .defi-modules-grid {
          grid-template-columns: 1fr;
          max-width: 400px;
        }
      }
      @media (max-width: 768px) {
        .navbar {
          padding: 1rem;
          flex-direction: column;
          gap: 1rem;
        }
        .navbar-logo img {
          width: 30px;
          height: 30px;
        }
        .navbar-links {
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .navbar-buttons {
          flex-direction: column;
          width: 100%;
        }
        .navbar-buttons button {
          width: 100%;
        }
        .defi-section {
          padding: 1rem;
          min-height: 400px;
        }
        .defi-wallet-notice {
          padding: 1rem;
          max-width: 95vw;
        }
      }
      @media (max-width: 480px) {
        .navbar-logo img {
          width: 25px;
          height: 25px;
        }
        .defi-section {
          padding: 0.5rem;
          min-height: 300px;
        }
        .defi-module {
          padding: 1rem;
        }
        .defi-wallet-notice {
          padding: 0.5rem;
          max-width: 99vw;
        }
      }
    `;
    collectedStyles.add(responsiveStyles);

    return html;
  }

  // 5. Render all elements
  hierarchicalElements.forEach(element => {
    if (!processedElements.has(element.id)) {
      bodyHtml += renderElement(element);
    }
  });

  // 6. Convert collected styles to HTML
  const stylesHtml = `<style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      min-height: 100vh;
      overflow-x: hidden;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
    }
    .main-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    button {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    button:hover {
      opacity: 0.9;
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .hero {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
      }
      .hero-left, .hero-right {
        width: 100%;
        max-width: 100%;
      }
      .hero-left {
        align-items: center;
      }
      .hero-right img {
        width: 100%;
        height: auto;
        max-height: 300px;
      }
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      .navbar-links {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .navbar-buttons {
        flex-direction: column;
        width: 100%;
      }
      .navbar-buttons button {
        width: 100%;
      }
      .cta-section {
        padding: 2rem 1rem;
      }
      .cta-content h1 {
        font-size: 36px;
      }
      .cta-content p {
        font-size: 16px;
      }
      .cta-buttons {
        flex-direction: column;
        width: 100%;
      }
      .cta-buttons button {
        width: 100%;
      }
      .footer {
        flex-direction: column;
        padding: 1rem;
        gap: 1rem;
        text-align: center;
      }
      .footer img {
        width: 30px;
        height: 30px;
      }
      .defi-module {
        width: 100%;
        margin-bottom: 1rem;
      }
    }

    @media (max-width: 480px) {
      .hero h1 {
        font-size: 2rem;
      }
      .hero p {
        font-size: 0.9rem;
      }
      .navbar-logo img {
        width: 30px;
        height: 30px;
      }
      .cta-content h1 {
        font-size: 28px;
      }
      .cta-content p {
        font-size: 14px;
      }
    }
  </style>`;

  // 7. Add necessary scripts
  const customScripts = collectCustomScripts(hierarchicalElements);
  const scriptsHtml = `
    <script src="https://cdn.jsdelivr.net/npm/web3@1.5.2/dist/web3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      // Initialize Web3 if needed
      if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
      }
      
      // Initialize DeFi modules
      document.querySelectorAll('.defi-module').forEach(module => {
        const moduleData = JSON.parse(module.dataset.module);
        if (moduleData) {
          console.log('Initializing DeFi module:', moduleData);
          
          // Initialize charts if present
          if (moduleData.config?.charts) {
            moduleData.config.charts.forEach(chart => {
              const ctx = document.getElementById(chart.id);
              if (ctx) {
                new Chart(ctx, {
                  type: chart.type || 'line',
                  data: chart.data || {},
                  options: chart.options || {}
                });
              }
            });
          }
          
          // Initialize custom script if present
          if (moduleData.customScript) {
            try {
              const scriptFunction = new Function(moduleData.customScript);
              scriptFunction.call(module);
            } catch (error) {
              console.error('Error executing DeFi module custom script:', error);
            }
          }
        }
      });

      // Initialize custom scripts
      document.querySelectorAll('[data-custom-script]').forEach(element => {
        const customScript = element.dataset.customScript;
        if (customScript) {
          try {
            const scriptFunction = new Function(customScript);
            scriptFunction.call(element);
          } catch (error) {
            console.error('Error executing custom script:', error);
          }
        }
      });

      // Execute collected custom scripts
      ${customScripts.map(script => `
        try {
          ${script}
        } catch (error) {
          console.error('Error executing custom script:', error);
        }
      `).join('\n')}
    </script>
  `;

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
      <div class="main-container">
        ${bodyHtml}
      </div>
      ${scriptsHtml}
    </body>
    </html>
  `.trim();

  return fullHtml;
}

/**
 * Uses the Pinata API to pin the exported HTML file to IPFS.
 */
async function pinDirectoryToPinata(files, metadata) {
  try {
    console.log('Starting Pinata upload...');
    
    const formData = new FormData();
    
    // Create a File object from the Blob
    const file = new File([files[0].file], files[0].fileName, {
      type: files[0].type || 'text/html'
    });
    
    // Append the file
    formData.append('file', file);
    
    // Add metadata if provided
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify(metadata));
    }

    console.log('Uploading to Pinata:', {
      fileName: file.name,
      fileSize: file.size,
      metadata: metadata
    });

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataConfig.pinata_jwt}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to upload to Pinata: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('Pinata upload successful:', result);

    // Check for the IPFS hash in the response
    if (!result.IpfsHash) {
      throw new Error('No IPFS hash in Pinata response');
    }

    return {
      IpfsHash: result.IpfsHash,
      PinSize: result.PinSize,
      Timestamp: result.Timestamp
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

/**
 * Saves project data to Firestore
 */
async function saveProjectToFirestore(userId, htmlContent, type, url, websiteSettings, elements, projectId) {
  try {
    if (!userId) {
      throw new Error('No valid user ID provided');
    }

    const projectData = {
  userId,
      htmlContent,
      type,
      url,
  websiteSettings,
  elements,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    // If projectId exists, update the existing project
    if (projectId) {
      const projectRef = doc(db, 'projects', projectId);
      await setDoc(projectRef, projectData, { merge: true });
      console.log('Project updated in Firestore:', projectId);
    } else {
      // Create a new project with a generated ID
      const newProjectRef = doc(collection(db, 'projects'));
      await setDoc(newProjectRef, {
        ...projectData,
        id: newProjectRef.id
      });
      console.log('New project created in Firestore:', newProjectRef.id);
    }
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
}

/**
 * ExportSection Component
 * Renders a Publish button that exports your element tree to HTML, deploys it to IPFS,
 * and optionally saves a record to Firestore.
 */
const ExportSection = ({ elements, websiteSettings, userId, projectId, onProjectPublished }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [shareableUrl, setShareableUrl] = useState('');

  const handleDeployToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS...');
    try {
      if (!userId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return null;
      }

      // Generate HTML
      const fullHtml = exportProject(elements, websiteSettings);
      console.log('Generated HTML length:', fullHtml.length);
      
      // Create Blob with explicit type
      const htmlBlob = new Blob([fullHtml], { 
        type: 'text/html;charset=utf-8'
      });
      console.log('Blob size:', htmlBlob.size);
      
      // Prepare file for upload
      const files = [{ 
        file: htmlBlob, 
        fileName: 'index.html',
        type: 'text/html'
      }];
      
      // Prepare metadata
      const metadata = {
        name: websiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { 
          userId,
          timestamp: new Date().toISOString(),
          size: htmlBlob.size
        },
      };
      
      console.log('Starting IPFS upload process...');
      
      // Upload to Pinata
      const result = await pinDirectoryToPinata(files, metadata);
      
      if (!result || !result.IpfsHash) {
        throw new Error('No IPFS hash returned from Pinata');
      }
      
      const cid = result.IpfsHash;
      // Use the CID directly without appending index.html
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
      console.log('Generated IPFS URL:', ipfsUrl);
      
      // Save to Firestore with both URL and CID
      await saveProjectToFirestore(userId, fullHtml, 'ipfs', ipfsUrl, websiteSettings, elements, projectId);
      
      setAutoSaveStatus('IPFS deploy complete!');
      return ipfsUrl;
    } catch (error) {
      console.error('IPFS deployment failed:', error);
      setAutoSaveStatus(`Error publishing to IPFS: ${error.message}`);
      return null;
    }
  };

  const handlePublish = async () => {
    const ipfsUrl = await handleDeployToIPFS();
    if (ipfsUrl) {
      setShareableUrl(ipfsUrl);
      if (onProjectPublished) onProjectPublished(ipfsUrl);
      window.open(ipfsUrl, '_blank');
    }
  };

  return (
    <div className="export-section">
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>
      <button className="button" onClick={handlePublish}>
        Publish
      </button>
    </div>
  );
};

export default ExportSection;