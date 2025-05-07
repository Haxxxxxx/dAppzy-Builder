import React from 'react';
import { ctaOneStyles, ctaTwoStyles } from '../../../Elements/Sections/CTAs/defaultCtaStyles';
import { StyleManager } from '../../../styles/styleManager';
import { SecurityManager } from '../../../security/securityManager';

/**
 * Renders a Call-to-Action (CTA) section with support for different configurations.
 * The CTA can include a title, description, buttons, and an optional image.
 * 
 * @param {Object} element - The CTA element to render
 * @param {string} element.id - Unique identifier for the CTA
 * @param {Object} element.styles - Custom styles to apply
 * @param {Array} element.children - Child elements (title, description, buttons, image)
 * @param {string} element.configuration - CTA configuration ('ctaOne' or 'ctaTwo')
 * @param {Object} context - Rendering context with callbacks
 * @returns {React.Element} The rendered CTA section
 */
export function renderCta(element, context) {
  const { id, styles = {}, children = [], configuration = 'ctaOne' } = element;

  // Select the appropriate style based on configuration
  const ctaStyles = configuration === 'ctaTwo' ? ctaTwoStyles : ctaOneStyles;

  // Extract elements
  const title = children.find(c => c.type === 'title' || c.type === 'heading');
  const description = children.find(c => c.type === 'paragraph');
  const buttons = children.filter(c => c.type === 'button');
  const imageElement = children.find(c => c.type === 'image');

  // Apply styles using StyleManager
  const ctaStyle = StyleManager.applyStyles(
    ctaStyles.cta,
    styles,
    'cta'
  );

  const sectionStyle = StyleManager.applyStyles(
    ctaStyles.ctaSection,
    {},
    'ctaSection'
  );

  const contentStyle = StyleManager.applyStyles(
    ctaStyles.ctaContent,
    {},
    'ctaContent'
  );

  const titleStyle = StyleManager.applyStyles(
    ctaStyles.ctaTitle,
    title?.styles,
    'heading'
  );

  const descriptionStyle = StyleManager.applyStyles(
    ctaStyles.ctaDescription,
    description?.styles,
    'paragraph'
  );

  const buttonContainerStyle = StyleManager.applyStyles(
    ctaStyles.buttonContainer,
    {},
    'buttonContainer'
  );

  const imageContainerStyle = StyleManager.applyStyles(
    ctaStyles.ctaImageContainer,
    {},
    'imageContainer'
  );

  const imageStyle = StyleManager.applyStyles(
    ctaStyles.ctaImage,
    imageElement?.styles,
    'image'
  );

  // Get image source with fallback handling
  const imageSrc = imageElement?.src || 
                  imageElement?.content?.src || 
                  (typeof imageElement?.content === 'string' ? imageElement.content : '');

  // Render a single button with proper styling and security
  const renderButton = (button, index) => {
      const buttonContent = typeof button.content === 'object' ? button.content.text : button.content;
    const buttonStyle = StyleManager.applyStyles(
      index === 0 ? ctaStyles.primaryButton : ctaStyles.secondaryButton,
      button.styles,
      'button'
    );
    
    return (
      <button
        key={`${id}-button-${index}`}
        className={index === 0 ? 'primaryButton' : 'secondaryButton'}
        style={buttonStyle}
        onClick={() => context.onButtonClick?.(button)}
        aria-label={SecurityManager.sanitizeInput(buttonContent)}
      >
        {SecurityManager.sanitizeInput(buttonContent)}
      </button>
    );
  };

  // Render the image with proper security and styling
  const renderImage = () => {
    if (!imageSrc) return null;

    return (
      <div className="ctaImageContainer" style={imageContainerStyle}>
        <img
          className="ctaImage"
          src={SecurityManager.sanitizeUrl(imageSrc)}
          alt={SecurityManager.sanitizeInput(imageElement.alt || '')}
          style={imageStyle}
          loading="lazy"
        />
        </div>
    );
  };

  return (
    <section 
      id={id} 
      className={id} 
      style={ctaStyle}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <div className="ctaSection" style={sectionStyle}>
        <div className="ctaContent" style={contentStyle}>
          {title && (
            <h2 
              id={`${id}-title`}
              className="ctaTitle" 
              style={titleStyle}
            >
              {SecurityManager.sanitizeInput(title.content)}
            </h2>
          )}
          {description && (
            <p className="ctaDescription" style={descriptionStyle}>
              {SecurityManager.sanitizeInput(description.content)}
            </p>
          )}
          {buttons.length > 0 && (
            <div 
              className="buttonContainer" 
              style={buttonContainerStyle}
              role="group"
              aria-label="Call to action buttons"
            >
              {buttons.map(renderButton)}
          </div>
          )}
        </div>
        {renderImage()}
      </div>
    </section>
  );
}
