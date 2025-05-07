// File: src/utils/htmlRenderUtils/RenderNavbars/renderNavbar.js
import React from 'react';
import { defaultNavbarStyles, CustomTemplateNavbarStyles } from '../../../Elements/Sections/Navbars/DefaultNavbarStyles';
import { StyleManager } from '../../../styles/styleManager';
import { SecurityManager } from '../../../security/securityManager';

/**
 * Renders a navigation bar with support for different configurations.
 * The navbar can include a logo, brand name, navigation links, and action buttons.
 * 
 * @param {Object} navbarElement - The navbar element to render
 * @param {string} navbarElement.id - Unique identifier for the navbar
 * @param {string} navbarElement.configuration - Navbar configuration ('customTemplate' or default)
 * @param {Object} navbarElement.styles - Custom styles to apply
 * @param {Array} navbarElement.children - Child elements (logo, brand, links, buttons)
 * @param {Object} context - Rendering context with callbacks
 * @returns {React.Element} The rendered navigation bar
 */
export function renderNavbar(navbarElement, context) {
  const { id, configuration, children = [], styles: customStyles = {} } = navbarElement;

  // 1. Group children by type with improved type safety
  const logo = children.find(c => c?.type === 'image');
  const spans = children.filter(c => c?.type === 'span');
  const brand = spans[0];
  const links = spans.slice(1);
  const buttons = children.filter(c => c?.type === 'button' || c?.type === 'connectWalletButton');

  // 2. Get style configuration
  const styleConfig = configuration === 'customTemplate' 
    ? CustomTemplateNavbarStyles 
    : defaultNavbarStyles;

  // 3. Apply styles using StyleManager with improved organization
  const appliedStyles = {
    navbar: StyleManager.applyStyles(styleConfig.navbar, customStyles, 'navbar'),
    logo: StyleManager.applyStyles(styleConfig.logo, logo?.styles, 'image'),
    brand: StyleManager.applyStyles(styleConfig.brand, brand?.styles, 'span'),
    link: StyleManager.applyStyles(styleConfig.link, {}, 'link'),
    button: StyleManager.applyStyles(styleConfig.button, {}, 'button'),
    linksContainer: StyleManager.applyStyles(styleConfig.linksContainer, {}, 'linksContainer'),
    buttonsContainer: StyleManager.applyStyles(styleConfig.buttonsContainer, {}, 'buttonsContainer')
  };

  // 4. Render a single navigation link with improved accessibility
  const renderLink = (link, index) => {
    if (!link?.content) return null;

    const sanitizedContent = SecurityManager.sanitizeInput(link.content);
    const sanitizedHref = SecurityManager.sanitizeUrl(link.href || '#');

    return (
      <a
        key={`${id}-link-${index}`}
        href={sanitizedHref}
        style={appliedStyles.link}
        onClick={(e) => {
          e.preventDefault();
          context.onLinkClick?.(link);
        }}
        onKeyPress={(e) => e.key === 'Enter' && context.onLinkClick?.(link)}
        aria-label={sanitizedContent}
        role="link"
        tabIndex={0}
      >
        {sanitizedContent}
      </a>
    );
  };

  // 5. Render a single button with improved accessibility and event handling
  const renderButton = (button, index) => {
    if (!button?.content) return null;

    const buttonContent = typeof button.content === 'object' ? button.content.text : button.content;
    const sanitizedContent = SecurityManager.sanitizeInput(buttonContent);
    const buttonTypeStyle = StyleManager.applyStyles(
      index === 0 ? styleConfig.primaryButton : styleConfig.secondaryButton,
      button.styles,
      'button'
    );

    return (
      <button
        key={`${id}-button-${index}`}
        style={buttonTypeStyle}
        onClick={() => context.onButtonClick?.(button)}
        onKeyPress={(e) => e.key === 'Enter' && context.onButtonClick?.(button)}
        aria-label={sanitizedContent}
        role="button"
        tabIndex={0}
      >
        {sanitizedContent}
      </button>
    );
  };

  // 6. Render the logo with improved error handling and accessibility
  const renderLogo = () => {
    if (!logo?.src) return null;

    const sanitizedSrc = SecurityManager.sanitizeUrl(logo.src);
    const sanitizedAlt = SecurityManager.sanitizeInput(logo.alt || brand?.content || 'Logo');

    return (
      <div className="navbar-logo" role="img" aria-label={sanitizedAlt}>
        <img
          src={sanitizedSrc}
          alt={sanitizedAlt}
          style={appliedStyles.logo}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/fallback-logo.png';
          }}
        />
      </div>
    );
  };

  // 7. Render the navbar with improved structure and accessibility
  return (
    <nav 
      id={id}
      className={`navbar ${configuration}`}
      style={appliedStyles.navbar}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar-brand-container">
        {renderLogo()}
        {brand && (
          <div className="navbar-brand">
            <span 
              style={appliedStyles.brand}
              aria-label={SecurityManager.sanitizeInput(brand.content)}
            >
              {SecurityManager.sanitizeInput(brand.content)}
            </span>
          </div>
        )}
      </div>

      {links.length > 0 && (
        <div 
          className="navbar-links"
          style={appliedStyles.linksContainer}
          role="navigation"
          aria-label="Navigation links"
        >
          {links.map(renderLink)}
        </div>
      )}

      {buttons.length > 0 && (
        <div 
          className="navbar-buttons"
          style={appliedStyles.buttonsContainer}
          role="group"
          aria-label="Action buttons"
        >
          {buttons.map(renderButton)}
      </div>
      )}
    </nav>
  );
}