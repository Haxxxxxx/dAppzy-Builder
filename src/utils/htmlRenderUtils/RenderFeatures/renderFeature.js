import React from 'react';
import { StyleManager } from '../../../styles/styleManager';
import { SecurityManager } from '../../../security/securityManager';

/**
 * Renders a feature item with support for different configurations.
 * Features can include icons, images, titles, and descriptions.
 * 
 * @param {Object} featureElement - The feature element to render
 * @param {string} featureElement.id - Unique identifier for the feature
 * @param {Object} featureElement.content - Feature content (title, description, icon)
 * @param {Object} featureElement.styles - Custom styles to apply
 * @param {Object} context - Rendering context with callbacks
 * @returns {React.Element} The rendered feature
 */
export function renderFeature(featureElement, context) {
  const { id, content, styles = {} } = featureElement;

  // Default styles for feature components
  const defaultStyles = {
    container: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      backgroundColor: '#f8f9fa',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)'
      }
    },
    icon: {
      width: '48px',
      height: '48px',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#2d3748'
    },
    description: {
      fontSize: '1rem',
      color: '#4a5568',
      lineHeight: '1.5'
    }
  };

  // Apply styles using StyleManager
  const containerStyle = StyleManager.applyStyles(
    defaultStyles.container,
    styles.container,
    'feature-container'
  );

  const iconStyle = StyleManager.applyStyles(
    defaultStyles.icon,
    styles.icon,
    'feature-icon'
  );

  const titleStyle = StyleManager.applyStyles(
    defaultStyles.title,
    styles.title,
    'feature-title'
  );

  const descriptionStyle = StyleManager.applyStyles(
    defaultStyles.description,
    styles.description,
    'feature-description'
  );

  // Render icon or image
  const renderIcon = () => {
    if (!content.icon) return null;

    return (
      <div className="feature-icon" style={iconStyle}>
        {content.icon.startsWith('http') ? (
          <img
            src={SecurityManager.sanitizeUrl(content.icon)}
            alt={SecurityManager.sanitizeInput(content.title)}
            loading="lazy"
          />
        ) : (
          <i className={SecurityManager.sanitizeInput(content.icon)} />
        )}
      </div>
    );
  };

  return (
    <div 
      id={id}
      className="feature-item"
      style={containerStyle}
      role="article"
      aria-label={SecurityManager.sanitizeInput(content.title)}
    >
      {renderIcon()}
      <h3 className="feature-title" style={titleStyle}>
        {SecurityManager.sanitizeInput(content.title)}
      </h3>
      <p className="feature-description" style={descriptionStyle}>
        {SecurityManager.sanitizeInput(content.description)}
      </p>
    </div>
  );
} 