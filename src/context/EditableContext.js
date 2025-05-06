// src/context/EditableContext.js

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  generateUniqueId,
  buildHierarchy,
  findElementById,
  removeElementRecursively,
} from '../utils/LeftBarUtils/elementUtils';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../utils/LeftBarUtils/storageUtils';
import { structureConfigurations } from '../configs/structureConfigurations';

export const EditableContext = createContext();
export const ELEMENTS_VERSION = '1.0.0'; // Define the version constant

export const EditableProvider = ({ children, userId }) => {
  // Initialize state first
  const [elements, setElements] = useState([]); // Start with empty array instead of loading from localStorage

  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [forceBorder, setForceBorder] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);

  // Define findElementById function
  const findElementById = useCallback((id, elementsList = elements) => {
    return elementsList.find(el => el.id === id);
  }, [elements]);

  // Initialize functions after state
  const pushToHistory = useCallback((newElements) => {
    const truncatedHistory = history.slice(0, currentIndex + 1);
    const updatedHistory = [...truncatedHistory, newElements];
    setHistory(updatedHistory);
    setCurrentIndex(updatedHistory.length - 1);
  }, [history, currentIndex]);

  const recordElementsUpdate = useCallback((updater) => {
    setElements((prev) => {
      const newElements = typeof updater === 'function' ? updater(prev) : updater;
      saveToLocalStorage('editableElements', newElements);
      pushToHistory(newElements);
      return newElements;
    });
  }, [pushToHistory]);

  const addNewElement = useCallback((type, level = 1, index = 0, parentId = null, config = null) => {
    console.log('[addNewElement] type:', type, 'config:', config);
    
    // If this is a second call for the same element type with children config, skip it
    if (config && config.children && typeof config !== 'string') {
      console.log('Skipping duplicate element creation');
      return null;
    }

    let newId = generateUniqueId(type);
    while (elements.some((el) => el.id === newId)) {
      console.warn(`Duplicate ID detected: ${newId}. Regenerating ID.`);
      newId = generateUniqueId(type);
    }
  
    // Determine if config is a structure (string) or a configuration (object)
    let configuration = null;
    let structure = null;
    if (typeof config === 'string' && structureConfigurations[config]) {
      structure = config;
      configuration = config;
    } else if (config && typeof config === 'object') {
      configuration = config.configuration || config;
      structure = config.configuration || config;
    }
  
    const baseElement = {
      id: newId,
      type,
      styles: config?.styles || {},
      level,
      children: [],
      label: '',
      parentId: parentId || null,
      content: config?.content || (() => {
        switch (type) {
          case 'paragraph':
            return 'New Paragraph';
          case 'anchor':
            return 'Click here';
          case 'blockquote':
            return 'Blockquote text...';
          case 'code':
            return 'Code snippet...';
          case 'pre':
            return 'Preformatted text...';
          case 'list-item':
            return 'Editable Item';
          case 'button':
            return 'Click Me';
          default:
            return '';
        }
      })(),
      structure: structure || null,
      configuration: configuration || null,
      settings: config?.settings || {},
    };
  
    if (type === 'image') {
      baseElement.src = config?.src || 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7';
    }
  
    // If a structure was provided and exists in structureConfigurations, create children accordingly.
    if (structure && structureConfigurations[structure]) {
      baseElement.styles = { ...baseElement.styles, ...(structureConfigurations[structure].styles || {}) };
      const childrenElements = structureConfigurations[structure].children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        styles: child.styles || {},
        label: child.label || '',
        parentId: newId,
      }));
      baseElement.children = childrenElements.map((child) => child.id);
  
      if (!parentId) {
        recordElementsUpdate((prev) => {
          const newElements = [...prev];
          newElements.splice(index || 0, 0, baseElement, ...childrenElements);
          return newElements;
        });
      } else {
        recordElementsUpdate((prev) => [...prev, baseElement, ...childrenElements]);
      }
    } else if (config && config.children) {
      // Handle custom configuration with children
      baseElement.styles = { ...baseElement.styles, ...(config.styles || {}) };
      const childrenElements = config.children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        styles: child.styles || {},
        label: child.label || '',
        parentId: newId,
      }));
      baseElement.children = childrenElements.map((child) => child.id);
  
      if (!parentId) {
        recordElementsUpdate((prev) => {
          const newElements = [...prev];
          newElements.splice(index || 0, 0, baseElement, ...childrenElements);
          return newElements;
        });
      } else {
        recordElementsUpdate((prev) => [...prev, baseElement, ...childrenElements]);
      }
    } else {
      // No structure or custom configuration provided, so just add the base element.
      if (!parentId) {
        recordElementsUpdate((prev) => {
          const newElements = [...prev];
          newElements.splice(index || 0, 0, baseElement);
          return newElements;
        });
      } else {
        recordElementsUpdate((prev) => [...prev, baseElement]);
      }
    }
  
    console.log('Added new element:', baseElement);
    return newId;
  }, [recordElementsUpdate]);

  const moveElement = useCallback((id, newIndex) => {
    recordElementsUpdate((prevElements) => {
      const index = prevElements.findIndex((el) => el.id === id);
      if (index === -1) return prevElements;
      const element = prevElements[index];
      const newElements = [...prevElements];
      newElements.splice(index, 1);
      newElements.splice(newIndex, 0, element);
      return newElements;
    });
  }, [recordElementsUpdate]);

  const handleRemoveElement = useCallback((id) => {
    setSelectedElement(null);
    recordElementsUpdate((prevElements) => removeElementRecursively(id, prevElements));
  }, [recordElementsUpdate]);

  const updateContent = useCallback((id, content) => {
    recordElementsUpdate((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  }, [recordElementsUpdate]);

  const updateStyles = useCallback((id, newStyles) => {
    console.log(`Updating styles for ${id}:`, newStyles);
    recordElementsUpdate((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          // Create a new styles object to avoid reference issues
          const updatedStyles = { ...newStyles };
          // If the element has existing styles, merge them carefully
          if (el.styles) {
            Object.keys(el.styles).forEach(key => {
              // Only keep existing styles if they're not being updated
              if (!(key in newStyles)) {
                updatedStyles[key] = el.styles[key];
              }
            });
          }
          return { ...el, styles: updatedStyles };
        }
        return el;
      })
    );
    // Also update the selected element if it's the one being updated
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement((prevSelected) => {
        const updatedStyles = { ...newStyles };
        if (prevSelected.styles) {
          Object.keys(prevSelected.styles).forEach(key => {
            if (!(key in newStyles)) {
              updatedStyles[key] = prevSelected.styles[key];
            }
          });
        }
        return {
          ...prevSelected,
          styles: updatedStyles
        };
      });
    }
  }, [recordElementsUpdate]);

  const updateElementProperties = useCallback((id, newProperties) => {
    recordElementsUpdate((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newProperties } : el))
    );
  }, [recordElementsUpdate]);

  const saveSectionToLocalStorage = useCallback((sectionId) => {
    const section = findElementById(sectionId, elements);
    if (section) {
      const buildNestedStructure = (parentId) => {
        const parent = findElementById(parentId, elements);
        if (!parent) return null;
        const children = parent.children.map((childId) => buildNestedStructure(childId));
        return {
          id: parent.id,
          type: parent.type,
          styles: parent.styles,
          content: parent.content,
          children,
        };
      };
      const navbarHierarchy = buildNestedStructure(sectionId);
      saveToLocalStorage(`section-${sectionId}`, navbarHierarchy);
    }
  }, [elements]);

  const loadSectionFromLocalStorage = useCallback((sectionId) => {
    const savedSection = loadFromLocalStorage(`section-${sectionId}`);
    if (savedSection) {
      const flattenNestedStructure = (node, accumulator = []) => {
        if (!node) return accumulator;
        const { children, ...rest } = node;
        accumulator.push(rest);
        children.forEach((child) => flattenNestedStructure(child, accumulator));
        return accumulator;
      };
      const flattenedElements = flattenNestedStructure(savedSection);
      recordElementsUpdate(flattenedElements);
    }
  }, [recordElementsUpdate]);

  const updateConfiguration = useCallback((id, key, value) => {
    recordElementsUpdate((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              configuration: {
                ...el.configuration,
                [key]: value,
              },
              settings: {
                ...el.settings,
                [key]: value,
              },
            }
          : el
      )
    );
  }, [recordElementsUpdate]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setElements(history[newIndex]);
      saveToLocalStorage('editableElements', history[newIndex]);
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setElements(history[newIndex]);
      saveToLocalStorage('editableElements', history[newIndex]);
    }
  }, [currentIndex, history]);

  const handleAICommand = useCallback((command) => {
    console.log('[handleAICommand] action:', command.action, 'elementType:', command.elementType, 'properties:', command.properties);
    switch (command.action) {
      case 'add': {
        // If adding a navbar, use the structure argument for default children
        if (command.elementType === 'navbar' && command.properties?.configuration) {
          const newId = addNewElement(
            command.elementType,
            1,
            command.position?.index || 0,
            command.position?.parentId || null,
            command.properties // Pass the entire properties object
          );
          if (command.properties?.styles) {
            updateStyles(newId, command.properties.styles);
          }
          return newId;
        } else if (command.properties?.configuration) {
          // For hero, cta, defiSection, etc.
          const newId = addNewElement(
            command.elementType,
            1,
            command.position?.index || 0,
            command.position?.parentId || null,
            command.properties // Pass the entire properties object
          );
          if (command.properties?.styles) {
            updateStyles(newId, command.properties.styles);
          }
          return newId;
        } else {
          return addNewElement(
            command.elementType,
            1,
            command.position?.index || 0,
            command.position?.parentId || null,
            command.properties || {}
          );
        }
      }
      case 'edit': {
        const { children, styles, ...otherProps } = command.properties || {};
        
        // First update the parent element's properties and styles
        if (Object.keys(otherProps).length > 0) {
          updateElementProperties(command.targetId, otherProps);
        }
        if (styles) {
          updateStyles(command.targetId, styles);
        }

        // Then handle children updates if provided
        if (children) {
          const parent = findElementById(command.targetId, elements);
          if (parent && parent.children && parent.children.length) {
            // Create a map of child elements by type and index for more precise matching
            const childrenByTypeAndIndex = parent.children.reduce((acc, childId, index) => {
              const child = elements.find(el => el.id === childId);
              if (child) {
                const key = `${child.type}-${index}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push({ id: childId, element: child, index });
              }
              return acc;
            }, {});

            // Update each child based on type and index matching
            children.forEach((childEdit, idx) => {
              if (!childEdit || !childEdit.type) return;
              
              // Try to find a matching child by type and index
              const key = `${childEdit.type}-${idx}`;
              const matchingChildren = childrenByTypeAndIndex[key] || [];
              const targetChild = matchingChildren[0]; // Get the first matching child
              
              if (targetChild) {
                // Update content if provided
                if (childEdit.content !== undefined) {
                  updateContent(targetChild.id, childEdit.content);
                }
                
                // Update styles if provided
                if (childEdit.styles) {
                  // Handle hover styles separately
                  const { hover, ...baseStyles } = childEdit.styles;
                  updateStyles(targetChild.id, baseStyles);
                  
                  // If hover styles are provided, update them as well
                  if (hover) {
                    const currentStyles = elements.find(el => el.id === targetChild.id)?.styles || {};
                    updateStyles(targetChild.id, {
                      ...currentStyles,
                      hover: hover
                    });
                  }
                }
                
                // Remove the used child from the map
                childrenByTypeAndIndex[key] = matchingChildren.slice(1);
              } else {
                // If no exact match found, try to find any child of the same type
                const fallbackKey = childEdit.type;
                const fallbackChildren = Object.entries(childrenByTypeAndIndex)
                  .filter(([k]) => k.startsWith(fallbackKey))
                  .flatMap(([_, children]) => children);
                
                if (fallbackChildren.length > 0) {
                  const fallbackChild = fallbackChildren[0];
                  if (childEdit.content !== undefined) {
                    updateContent(fallbackChild.id, childEdit.content);
                  }
                  if (childEdit.styles) {
                    const { hover, ...baseStyles } = childEdit.styles;
                    updateStyles(fallbackChild.id, baseStyles);
                    if (hover) {
                      const currentStyles = elements.find(el => el.id === fallbackChild.id)?.styles || {};
                      updateStyles(fallbackChild.id, {
                        ...currentStyles,
                        hover: hover
                      });
                    }
                  }
                }
              }
            });
          }
        }
        break;
      }
      case 'updateContent':
        updateContent(command.targetId, command.content);
        break;
      case 'updateStyles':
        updateStyles(command.targetId, command.styles || {});
        break;
      case 'delete':
        handleRemoveElement(command.targetId);
        break;
      case 'move':
        moveElement(command.targetId, command.newIndex);
        break;
      default:
        console.warn('Unknown AI command:', command);
    }
  }, [addNewElement, updateElementProperties, updateContent, updateStyles, handleRemoveElement, moveElement, elements]);

  // Memoize context value after all state and functions are defined
  const contextValue = useMemo(() => ({
    elements,
    setElements: recordElementsUpdate,
    selectedElement,
    setSelectedElement,
    addNewElement,
    updateContent,
    updateStyles,
    updateElementProperties,
    updateConfiguration,
    handleRemoveElement,
    moveElement,
    undo,
    redo,
    forceBorder,
    setForceBorder,
    selectedStyle,
    setSelectedStyle,
    handleAICommand,
    saveSectionToLocalStorage,
    loadSectionFromLocalStorage,
    findElementById
  }), [
    elements,
    selectedElement,
    forceBorder,
    selectedStyle,
    recordElementsUpdate,
    addNewElement,
    updateContent,
    updateStyles,
    updateElementProperties,
    updateConfiguration,
    handleRemoveElement,
    moveElement,
    undo,
    redo,
    handleAICommand,
    saveSectionToLocalStorage,
    loadSectionFromLocalStorage,
    findElementById
  ]);

  // Initialize history on mount
  useEffect(() => {
    pushToHistory(elements);
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, []);

  return (
    <EditableContext.Provider value={contextValue}>
      {children}
    </EditableContext.Provider>
  );
};
