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
      structure = config.structure || config.configuration || config;
      // Use the type from config if provided, otherwise use the passed type
      type = config.type || type;
    }
  
    // Get base styles from configuration if it exists
    const baseStyles = structure && structureConfigurations[structure]?.styles || {};
    const configStyles = config?.styles || {};
    
    const baseElement = {
      id: newId,
      type, // Use the determined type
      styles: {
        ...baseStyles,
        ...configStyles
      },
      level,
      children: [],
      label: config?.label || '',
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
  
    // If config has children, use those instead of structure configurations
    if (config && config.children && Array.isArray(config.children)) {
      // Handle custom configuration with children
      const childrenElements = config.children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        styles: {
          ...(structureConfigurations[configuration]?.children?.find(c => c.type === child.type)?.styles || {}),
          ...(child.styles || {})
        },
        parentId: newId,
        settings: child.settings || {},
        children: child.children || []
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
    } else if (structure && structureConfigurations[structure]?.children) {
      // Fallback to structure configuration if no explicit children
      const childrenElements = structureConfigurations[structure].children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        styles: {
          ...(child.styles || {}),
          color: child.styles?.color || baseStyles.color || '#1a1a1a'
        },
        label: child.label || '',
        parentId: newId,
        settings: child.settings || {},
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
    if (!command || !command.action) {
      console.warn('Invalid AI command:', command);
      return;
    }

    // Helper function to merge styles with proper inheritance
    const mergeStyles = (baseStyles, existingStyles, newStyles) => {
      const merged = {
        ...baseStyles,
        ...existingStyles,
        ...newStyles
      };

      // Handle hover states separately
      if (newStyles?.hover || existingStyles?.hover) {
        merged.hover = {
          ...(baseStyles?.hover || {}),
          ...(existingStyles?.hover || {}),
          ...(newStyles?.hover || {})
        };
      }

      // Remove undefined values
      Object.keys(merged).forEach(key => {
        if (merged[key] === undefined) {
          delete merged[key];
        }
      });

      return merged;
    };

    // Helper function to handle style inheritance for children
    const applyChildStyles = (parentId, parentStyles, children, config) => {
      const parent = findElementById(parentId, elements);
      if (!parent?.children) return;

      parent.children.forEach((childId, index) => {
        const child = elements.find(el => el.id === childId);
        const childConfig = config?.children?.[index];
        
        if (child && childConfig) {
          const baseStyles = {
            color: parentStyles?.color || config?.styles?.color
          };

          const mergedStyles = mergeStyles(
            baseStyles,
            child.styles,
            childConfig.styles
          );

          updateStyles(childId, mergedStyles);
        }
      });
    };

    switch (command.action) {
      case 'add': {
        // Handle structured elements (navbar, footer)
        if ((command.elementType === 'navbar' || command.elementType === 'footer') && command.properties?.configuration) {
          const structureConfig = structureConfigurations[command.properties.configuration];
          if (!structureConfig) {
            console.warn(`Configuration not found for ${command.properties.configuration}`);
            return;
          }

          const newId = addNewElement(
            command.elementType,
            1,
            command.position?.index || 0,
            command.position?.parentId || null,
            command.properties
          );

          // Apply parent styles
          const baseStyles = mergeStyles(
            structureConfig.styles,
            {},
            command.properties.styles
          );
          updateStyles(newId, baseStyles);

          // Apply child styles
          applyChildStyles(newId, baseStyles, structureConfig.children, structureConfig);
          
          return newId;
        }

        // Handle other elements
          const newId = addNewElement(
            command.elementType,
            1,
            command.position?.index || 0,
            command.position?.parentId || null,
          command.properties
          );

          if (command.properties?.styles) {
            updateStyles(newId, command.properties.styles);
          }

          return newId;
      }

      case 'edit': {
        const { children, styles, ...otherProps } = command.properties || {};
        const targetElement = findElementById(command.targetId, elements);
        
        if (!targetElement) {
          console.warn(`Element not found: ${command.targetId}`);
          return;
        }
        
        // Update element properties
        if (Object.keys(otherProps).length > 0) {
          updateElementProperties(command.targetId, otherProps);
        }

        // Update styles if provided
        if (styles) {
          const structureConfig = targetElement.configuration ? 
            structureConfigurations[targetElement.configuration] : null;

          const mergedStyles = mergeStyles(
            structureConfig?.styles || {},
            targetElement.styles,
            styles
          );

          updateStyles(command.targetId, mergedStyles);

          // Update child styles if this is a structured element
          if (structureConfig) {
            applyChildStyles(command.targetId, mergedStyles, children, structureConfig);
          }
        }

        // Handle child updates
        if (children && targetElement.children) {
          children.forEach((childEdit, index) => {
            if (!childEdit?.type) return;

            const childId = targetElement.children[index];
            if (!childId) return;

            const child = elements.find(el => el.id === childId);
            if (!child) return;

            // Update child content
                if (childEdit.content !== undefined) {
              updateContent(childId, childEdit.content);
                }
                
            // Update child styles
                if (childEdit.styles) {
              const structureConfig = targetElement.configuration ? 
                structureConfigurations[targetElement.configuration] : null;
              const childConfig = structureConfig?.children?.[index];

              const mergedStyles = mergeStyles(
                childConfig?.styles || {},
                child.styles,
                childEdit.styles
              );

              updateStyles(childId, mergedStyles);
              }
            });
        }
        break;
      }

      case 'updateContent':
        updateContent(command.targetId, command.content);
        break;

      case 'updateStyles': {
        const targetElement = findElementById(command.targetId, elements);
        if (!targetElement) {
          console.warn(`Element not found: ${command.targetId}`);
          return;
        }

        const structureConfig = targetElement.configuration ? 
          structureConfigurations[targetElement.configuration] : null;

        const mergedStyles = mergeStyles(
          structureConfig?.styles || {},
          targetElement.styles,
          command.styles
        );

        updateStyles(command.targetId, mergedStyles);
        break;
      }

      case 'delete':
        handleRemoveElement(command.targetId);
        break;

      case 'move':
        moveElement(command.targetId, command.newIndex);
        break;

      default:
        console.warn('Unknown AI command:', command);
    }
  }, [elements, addNewElement, updateStyles, findElementById]);

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
