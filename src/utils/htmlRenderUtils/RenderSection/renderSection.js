// File: src/utils/htmlRenderUtils/RenderSection/renderSection.js
import React from 'react';
import { StyleManager } from '../../../styles/styleManager';
import { SecurityManager } from '../../../security/securityManager';
import { renderHero } from '../RenderHeros/renderHero';
import { renderCta } from '../RenderCtas/renderCta';
import { renderMintingSection } from '../RenderWeb3/renderMintingSection';
import { renderFeature } from '../RenderFeatures/renderFeature';

/**
 * Unified render function for all section types.
 * Handles different section configurations and layouts.
 * 
 * @param {Object} sectionElement - The section element to render
 * @param {string} sectionElement.id - Unique identifier for the section
 * @param {string} sectionElement.type - Section type ('sectionOne' through 'sectionFour')
 * @param {Object} sectionElement.styles - Custom styles to apply
 * @param {Array} sectionElement.children - Child elements
 * @param {Object} context - Rendering context with callbacks
 * @returns {React.Element} The rendered section
 */
export function renderSection(sectionElement, context) {
  const { id, type, configuration, children = [], styles = {} } = sectionElement;

  // Configuration mapping for different section types
  const configMap = {
    sectionOne: {
      layout: ['left', 'right'],
      styles: {
        container: { display: 'flex', gap: '2rem', alignItems: 'center' },
        left: { flex: 1 },
        right: { flex: 1 }
      }
    },
    sectionTwo: {
      layout: ['top', 'bottom'],
      styles: {
        container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
        top: { width: '100%' },
        bottom: { width: '100%' }
      }
    },
    sectionThree: {
      layout: ['left', 'right'],
      styles: {
        container: { display: 'flex', gap: '2rem', alignItems: 'center' },
        left: { flex: 1 },
        right: { flex: 1 }
      }
    },
    sectionFour: {
      layout: ['top', 'bottom'],
      styles: {
        container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
        top: { width: '100%' },
        bottom: { width: '100%' }
      }
    }
  };

  // Get section configuration - use configuration if available, otherwise fallback to type
  const sectionType = configuration || type;
  const config = configMap[sectionType] || configMap.sectionOne;

  // Resolve child IDs to elements
  const resolvedChildren = children
    .map(child => typeof child === 'string' ? context.elements.find(el => el.id === child) : child)
    .filter(Boolean);

  // Distribute children evenly across layout zones by index position
  const zoneCount = config.layout.length;
  const parts = config.layout.reduce((acc, part, zoneIndex) => {
    const chunkSize = Math.ceil(resolvedChildren.length / zoneCount);
    const start = zoneIndex * chunkSize;
    acc[part] = resolvedChildren.slice(start, start + chunkSize);
    return acc;
  }, {});

  // Apply styles using StyleManager
  const containerStyle = StyleManager.applyStyles(
    config.styles.container,
    styles,
    'section'
  );

  // Render a single part with proper styling
  const renderPart = (partName, partChildren) => {
    const partStyle = StyleManager.applyStyles(
      config.styles[partName],
      {},
      partName
    );

    return (
      <div 
        key={`${id}-${partName}`}
        className={`section-${partName}`}
        style={partStyle}
        role="region"
        aria-label={`Section ${partName}`}
      >
        {partChildren.map(child => {
          // Handle different child types
          switch (child.type) {
            case 'hero':
              return renderHero(child, context);
            case 'cta':
              return renderCta(child, context);
            case 'minting':
              return renderMintingSection(child, context);
            case 'feature':
              return renderFeature(child, context);
            default:
              // Generic fallback for paragraph, heading, image, button, etc.
              return (
                <div key={child.id} style={child.styles || {}}>
                  {child.content || ''}
                </div>
              );
          }
        })}
      </div>
    );
  };

  return (
    <section 
      id={id}
      className={`section ${sectionType}`}
      style={containerStyle}
      role="region"
      aria-label={`Section ${sectionType}`}
    >
      {config.layout.map(part => renderPart(part, parts[part]))}
    </section>
  );
}
