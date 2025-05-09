import { useCallback } from 'react';
import { createElement, validateElement, structureConfigurations } from '../configs/elementConfigs';

export const useElementOperations = (elements, setElements, updateStyles) => {
  const findElementById = useCallback((id) => {
    return elements.find(el => el.id === id);
  }, [elements]);

  const addNewElement = useCallback((type, parentId = null, configuration = null) => {
    try {
      // Create the new element using the factory function
      const newElement = createElement(type, {
        configuration,
        parentId,
      });

      // Validate the element
      const validation = validateElement(newElement);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Add the element to the state
    setElements(prev => [...prev, newElement]);

      // Update parent's children if there is a parent
    if (parentId) {
      setElements(prev => prev.map(el => 
        el.id === parentId 
            ? { ...el, children: [...el.children, newElement.id] }
          : el
      ));
    }

      // Handle structure configuration children if present
      const structureConfig = configuration ? structureConfigurations[configuration] : null;
    if (structureConfig?.children) {
        const childElements = structureConfig.children.map(childConfig => 
          createElement(childConfig.type, {
            ...childConfig,
            parentId: newElement.id,
          })
        );

        // Add child elements to state
      setElements(prev => [...prev, ...childElements]);
        
        // Update parent's children array
      setElements(prev => prev.map(el => 
          el.id === newElement.id 
          ? { ...el, children: childElements.map(child => child.id) }
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