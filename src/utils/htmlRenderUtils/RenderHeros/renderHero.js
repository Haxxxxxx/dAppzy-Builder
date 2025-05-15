// File: src/utils/htmlRenderUtils/RenderHeros/renderHero.js
import React from 'react';
import { CustomTemplateHeroStyles, defaultHeroStyles, heroTwoStyles } from '../../../Elements/Sections/Heros/defaultHeroStyles';
import { StyleManager } from '../../../styles/styleManager';
import { SecurityManager } from '../../../security/securityManager';

/**
 * Renders a hero section with support for different configurations.
 * The hero can include a caption, heading, description, buttons, and an optional image.
 * 
 * @param {Object} heroElement - The hero element to render
 * @param {string} heroElement.id - Unique identifier for the hero
 * @param {string} heroElement.configuration - Hero configuration ('heroOne', 'heroTwo', 'heroThree', or 'customTemplate')
 * @param {Object} heroElement.styles - Custom styles to apply
 * @param {Array} heroElement.children - Child elements (caption, heading, paragraph, buttons, image)
 * @param {Object} context - Rendering context with callbacks
 * @returns {React.Element} The rendered hero section
 */
export function renderHero(heroElement, context) {
  const { id, configuration, children = [], styles: customStyles = {} } = heroElement;

  // 1. Pick base styles based on configuration
  const styleConfig = (() => {
    switch (configuration) {
      case 'heroThree':
      case 'customTemplate':
        return CustomTemplateHeroStyles;
      case 'heroTwo':
        return heroTwoStyles;
      default:
        return defaultHeroStyles;
    }
  })();

  // 2. Parse children with improved type safety
  const caption = children.find(c => c?.type === 'span');
  const heading = children.find(c => c?.type === 'heading');
  const paragraph = children.find(c => c?.type === 'paragraph');
  const image = children.find(c => c?.type === 'image');
  const buttons = children.filter(c => c?.type === 'button');

  // 3. Apply styles using StyleManager with improved organization
  const appliedStyles = {
    hero: StyleManager.applyStyles(styleConfig.heroSection, customStyles, 'hero'),
    content: StyleManager.applyStyles(styleConfig.heroContent, {}, 'heroContent'),
    caption: StyleManager.applyStyles(styleConfig.caption, caption?.styles, 'span'),
    heading: StyleManager.applyStyles(styleConfig.heroTitle, heading?.styles, 'heading'),
    paragraph: StyleManager.applyStyles(styleConfig.heroDescription, paragraph?.styles, 'paragraph'),
    buttonContainer: StyleManager.applyStyles(styleConfig.buttonContainer, {}, 'buttonContainer'),
    imageContainer: StyleManager.applyStyles(styleConfig.heroImageContainer, {}, 'imageContainer'),
    image: StyleManager.applyStyles(styleConfig.heroImage, image?.styles, 'image')
  };

  // 4. Get image source with improved fallback handling
  const imageSrc = image?.src || 
                  image?.content?.src || 
                  (typeof image?.content === 'string' ? image.content : '');

  // 5. Render a single button with improved accessibility and event handling
  const renderButton = (button, index) => {
    if (!button?.content) return null;

    const buttonContent = typeof button.content === 'object' ? button.content.text : button.content;
    const buttonStyle = StyleManager.applyStyles(
      index === 0 ? styleConfig.primaryButton : styleConfig.secondaryButton,
      button.styles,
      'button'
    );
    
    return (
      <button
        key={`${id}-button-${index}`}
        className={index === 0 ? 'primaryButton' : 'secondaryButton'}
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

  // 6. Render the image with improved error handling and accessibility
  const renderImage = () => {
    if (!imageSrc) return null;

    const sanitizedSrc = SecurityManager.sanitizeUrl(imageSrc);
    const sanitizedAlt = SecurityManager.sanitizeInput(image?.alt || heading?.content || 'Hero image');

    return (
      <div 
        className="heroImageContainer" 
        style={appliedStyles.imageContainer}
        role="img"
        aria-label={sanitizedAlt}
      >
        <img
          className="heroImage"
          src={sanitizedSrc}
          alt={sanitizedAlt}
          style={appliedStyles.image}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/fallback-image.png';
          }}
        />
      </div>
    );
  };

  // 7. Render the hero section with improved structure and accessibility
  return (
    <section 
      id={id} 
      className={`hero-section ${configuration}`} 
      style={appliedStyles.hero}
      aria-labelledby={heading ? `${id}-heading` : undefined}
      role="banner"
    >
      <div 
        className="hero-content"
        style={appliedStyles.content}
      >
        {caption && (
          <span 
            className="hero-caption" 
            style={appliedStyles.caption}
            aria-label={SecurityManager.sanitizeInput(caption.content)}
          >
            {SecurityManager.sanitizeInput(caption.content)}
          </span>
        )}
        {heading && (
          <h1 
            id={`${id}-heading`}
            className="hero-title" 
            style={appliedStyles.heading}
          >
            {SecurityManager.sanitizeInput(heading.content)}
          </h1>
        )}
        {paragraph && (
          <p 
            className="hero-description" 
            style={appliedStyles.paragraph}
            aria-label={SecurityManager.sanitizeInput(paragraph.content)}
          >
            {SecurityManager.sanitizeInput(paragraph.content)}
          </p>
        )}
        {buttons.length > 0 && (
          <div 
            className="hero-buttons" 
            style={appliedStyles.buttonContainer}
            role="group"
            aria-label="Hero section actions"
          >
            {buttons.map(renderButton)}
        </div>
        )}
      </div>
      {renderImage()}
    </section>
  );
}
