import { useCallback } from 'react';
import { createElement, validateElement, structureConfigurations, elementTypes } from '../configs/elementConfigs';
import { v4 as uuidv4 } from 'uuid';

export const useElementOperations = (elements, setElements, updateStyles) => {
  const findElementById = useCallback((id) => {
    return elements.find(el => el.id === id);
  }, [elements]);

  const addNewElement = useCallback((type, level = 1, index = null, parentId = null, additionalProps = {}) => {
    try {
      // Get base configuration
      const baseConfig = elementTypes[type];
      if (!baseConfig) {
        throw new Error(`Invalid element type: ${type}`);
      }

      // Get structure configuration if provided
      const structureConfig = structureConfigurations[additionalProps.configuration || ''];
      
      // Create the new element
      const newElement = {
        id: uuidv4(),
        type,
        level,
        content: '',
        styles: {
          ...(baseConfig.defaultStyles || {}),
          ...(structureConfig?.styles || {}),
          ...(additionalProps.styles || {})
        },
        children: [],
        parentId,
        settings: {
          ...(baseConfig.settings || {}),
          ...(structureConfig?.settings || {}),
          ...(additionalProps.settings || {})
        },
        isConfigured: additionalProps.isConfigured || false // Track if element is part of a configured layout
      };

      // Validate the element
      const validation = validateElement(newElement);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Handle structure configuration children if present
      if (structureConfig?.children && !additionalProps.isConfigured) {
        const childElements = structureConfig.children.map(childConfig => ({
          id: uuidv4(),
          type: childConfig.type,
          content: childConfig.content || '',
          styles: {
            ...(elementTypes[childConfig.type]?.defaultStyles || {}),
            ...(childConfig.styles || {})
          },
          parentId: newElement.id,
          settings: childConfig.settings || {},
          isConfigured: false // These are unique elements
        }));

        // Set children IDs in the parent element
        newElement.children = childElements.map(child => child.id);

        // Add all elements to state in a single update
        setElements(prev => [...prev, newElement, ...childElements]);
      } else {
        // Add just the new element if no children or if it's a configured element
        setElements(prev => [...prev, newElement]);
      }

      // Update parent's children if there is a parent
      if (parentId) {
        setElements(prev => prev.map(el => 
          el.id === parentId 
            ? { ...el, children: [...el.children, newElement.id] }
            : el
        ));
      }

      return newElement.id;
    } catch (error) {
      console.error('Error creating new element:', error);
      throw error;
    }
  }, [setElements]);

  const updateElement = useCallback((id, updates) => {
    setElements(prev => prev.map(el => 
      el.id === id 
        ? { ...el, ...updates }
        : el
    ));
  }, [setElements]);

  const deleteElement = useCallback((id) => {
    const element = findElementById(id);
    if (!element) return;

    // Remove element from parent's children
    if (element.parentId) {
      setElements(prev => prev.map(el => 
        el.id === element.parentId 
          ? { ...el, children: el.children.filter(childId => childId !== id) }
          : el
      ));
    }

    // Remove element and its children
    const removeElementAndChildren = (elementId) => {
      const element = findElementById(elementId);
      if (!element) return;

      // Recursively remove children
      element.children.forEach(childId => removeElementAndChildren(childId));

      // Remove the element itself
      setElements(prev => prev.filter(el => el.id !== elementId));
    };

    removeElementAndChildren(id);
  }, [findElementById, setElements]);

  return {
    findElementById,
    addNewElement,
    updateElement,
    deleteElement,
  };
}; 