// src/utils/htmlRenderUtils/RenderFooters/renderFooter.js
import React from 'react';
import {
  SimplefooterStyles,
  DetailedFooterStyles,
  TemplateFooterStyles
} from '../../../Elements/Sections/Footers/defaultFooterStyles';
import { StyleManager } from '../../../styles/styleManager';
import { SecurityManager } from '../../../security/securityManager';

/**
 * Renders a footer with support for different configurations.
 * The footer can include company info, navigation links, social media icons, and copyright text.
 * 
 * @param {Object} footerElement - The footer element to render
 * @param {string} footerElement.id - Unique identifier for the footer
 * @param {string} footerElement.configuration - Footer configuration ('simple', 'detailed', or 'template')
 * @param {Object} footerElement.styles - Custom styles to apply
 * @param {Array} footerElement.children - Child elements (spans, buttons, images, links)
 * @param {Object} context - Rendering context with callbacks
 * @returns {React.Element} The rendered footer
 */
export function renderFooter(footerElement, context) {
  const { id, configuration = 'simple', children = [], styles: customStyles = {} } = footerElement;

  // 1. Get style configuration with improved organization
  const styleConfig = (() => {
    switch (configuration) {
      case 'detailed':
        return DetailedFooterStyles;
      case 'template':
        return TemplateFooterStyles;
      default:
        return SimplefooterStyles;
    }
  })();

  // 2. Group children by type with improved type safety
  const spans = children.filter(c => c?.type === 'span');
  const buttons = children.filter(c => c?.type === 'button');
  const images = children.filter(c => c?.type === 'image');
  const links = children.filter(c => c?.type === 'link');

  // 3. Apply styles using StyleManager with improved organization
  const appliedStyles = {
    footer: StyleManager.applyStyles(styleConfig.footer, customStyles, 'footer'),
    container: StyleManager.applyStyles(styleConfig.container, {}, 'container'),
    span: StyleManager.applyStyles(styleConfig.span, {}, 'span'),
    button: StyleManager.applyStyles(styleConfig.button, {}, 'button'),
    image: StyleManager.applyStyles(styleConfig.image, {}, 'image'),
    link: StyleManager.applyStyles(styleConfig.link, {}, 'link')
  };

  // 4. Render a single span element with improved accessibility
  const renderSpan = (span) => {
    if (!span?.content) return null;

    const spanStyle = StyleManager.applyStyles(
      appliedStyles.span,
      span.styles,
      'span'
    );

    return (
      <span
        key={span.id}
        id={span.id}
        style={spanStyle}
        aria-label={SecurityManager.sanitizeInput(span.content)}
        role="text"
      >
        {SecurityManager.sanitizeInput(span.content)}
      </span>
    );
  };

  // 5. Render a single button with improved accessibility and event handling
  const renderButton = (button) => {
    if (!button?.content) return null;

    const buttonContent = typeof button.content === 'object' ? button.content.text : button.content;
    const buttonStyle = StyleManager.applyStyles(
      appliedStyles.button,
      button.styles,
      'button'
    );

    return (
      <button
        key={button.id}
        id={button.id}
        style={buttonStyle}
        onClick={() => context.onButtonClick?.(button)}
        onKeyPress={(e) => e.key === 'Enter' && context.onButtonClick?.(button)}
        aria-label={SecurityManager.sanitizeInput(buttonContent)}
        role="button"
        tabIndex={0}
      >
        {SecurityManager.sanitizeInput(buttonContent)}
      </button>
    );
  };

  // 6. Render a single image with improved error handling and accessibility
  const renderImage = (image) => {
    if (!image?.content) return null;

    const imageStyle = StyleManager.applyStyles(
      appliedStyles.image,
      image.styles,
      'image'
    );

    const sanitizedSrc = SecurityManager.sanitizeUrl(image.content);
    const sanitizedAlt = SecurityManager.sanitizeInput(image.alt || 'Footer image');

    return (
      <img
        key={image.id}
        id={image.id}
        src={sanitizedSrc}
        alt={sanitizedAlt}
        style={imageStyle}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/fallback-image.png';
        }}
        role="img"
        aria-label={sanitizedAlt}
      />
    );
  };

  // 7. Render a single link with improved accessibility and event handling
  const renderLink = (link) => {
    if (!link?.content) return null;

    const linkStyle = StyleManager.applyStyles(
      appliedStyles.link,
      link.styles,
      'link'
    );

    const sanitizedHref = SecurityManager.sanitizeUrl(link.href || '#');
    const sanitizedContent = SecurityManager.sanitizeInput(link.content);

    return (
      <a
        key={link.id}
        id={link.id}
        href={sanitizedHref}
        style={linkStyle}
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

  // 8. Render the footer with improved structure and accessibility
  return (
    <footer
      id={id}
      className={`footer ${configuration}`}
      style={appliedStyles.footer}
      role="contentinfo"
      aria-label="Footer"
    >
      <div 
        className="footer-container" 
        style={appliedStyles.container}
        role="complementary"
      >
        {/* Company Info Section */}
        {spans.length > 0 && (
          <div 
            className="footer-info"
            role="region"
            aria-label="Company information"
          >
            {spans.map(renderSpan)}
          </div>
        )}

        {/* Navigation Links Section */}
        {links.length > 0 && (
          <div 
            className="footer-links"
            role="navigation"
            aria-label="Footer navigation"
          >
            {links.map(renderLink)}
          </div>
        )}

        {/* Social Media Section */}
        {images.length > 0 && (
          <div 
            className="footer-social"
            role="group"
            aria-label="Social media links"
          >
            {images.map(renderImage)}
          </div>
        )}

        {/* Action Buttons Section */}
        {buttons.length > 0 && (
          <div 
            className="footer-actions"
            role="group"
            aria-label="Footer actions"
          >
            {buttons.map(renderButton)}
          </div>
        )}
      </div>
    </footer>
  );
}
