import React from 'react';
import { StyleManager } from '../styles/styleManager';

/**
 * Centralized rendering management system
 */
export const RenderManager = {
  /**
   * Renders a basic element with its children
   * @param {Object} element - The element to render
   * @param {Object} context - The rendering context
   * @returns {React.Element} The rendered element
   */
  renderBasicElement: (element, context) => {
    const { id, type, content, styles = {}, inlineStyles = {}, children = [] } = element;
    const styleString = StyleManager.applyStyles(styles, inlineStyles, type);
    
    return React.createElement(
      type,
      {
        id,
        key: id,
        style: styleString,
        ...context.attributes
      },
      content || (children.length > 0 ? children.map(child => 
        RenderManager.renderElement(child, context)
      ) : null)
    );
  },

  /**
   * Renders an element based on its type
   * @param {Object} element - The element to render
   * @param {Object} context - The rendering context
   * @returns {React.Element} The rendered element
   */
  renderElement: (element, context) => {
    if (!element || !element.id || !element.type) {
      return null;
    }

    const { type } = element;
    
    // Special case renderers
    const specialRenderers = {
      navbar: context.renderers?.navbar,
      footer: context.renderers?.footer,
      hero: context.renderers?.hero,
      cta: context.renderers?.cta,
      mintingSection: context.renderers?.mintingSection,
      defiSection: context.renderers?.defiSection,
      defiModule: context.renderers?.defiModule
    };

    // Use special renderer if available, otherwise use basic renderer
    const renderer = specialRenderers[type];
    if (renderer) {
      return renderer(element, context);
    }

    return RenderManager.renderBasicElement(element, context);
  },

  /**
   * Creates a rendering context with all necessary utilities
   * @param {Object} options - Context options
   * @returns {Object} The rendering context
   */
  createContext: (options = {}) => {
    return {
      renderers: options.renderers || {},
      attributes: options.attributes || {},
      styleManager: StyleManager,
      ...options
    };
  },

  /**
   * Renders a collection of elements
   * @param {Array} elements - The elements to render
   * @param {Object} context - The rendering context
   * @returns {Array} Array of rendered elements
   */
  renderElements: (elements, context) => {
    if (!Array.isArray(elements)) return null;
    return elements.map(element => RenderManager.renderElement(element, context));
  }
}; 