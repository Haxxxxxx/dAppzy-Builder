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
  const [elements, setElements] = useState(() => {
    const savedVersion = localStorage.getItem('elementsVersion');
    const savedElements = JSON.parse(localStorage.getItem('editableElements') || '[]');
    return savedVersion === ELEMENTS_VERSION && Array.isArray(savedElements)
      ? savedElements
      : [];
  });

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
      configuration = config; // (or you might want to leave configuration null in this case)
    } else if (config && typeof config === 'object') {
      configuration = config;
    }
  
    const baseElement = {
      id: newId,
      type,
      styles: {},
      level,
      children: [],
      // Optional label property (could be redundant if in configuration)
      label: '',
      parentId: parentId || null,
      content: (() => {
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
      settings: {},
    };
  
    if (type === 'image') {
      baseElement.src = 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7';
    }
  
    // If a structure was provided and exists in structureConfigurations, create children accordingly.
    if (structure && structureConfigurations[structure]) {
      baseElement.styles = structureConfigurations[structure].styles || {};
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
          newElements.splice(index, 0, baseElement, ...childrenElements);
          return newElements;
        });
      } else {
        recordElementsUpdate((prev) => [...prev, baseElement, ...childrenElements]);
      }
    } else {
      // No structure configuration provided, so just add the base element.
      if (!parentId) {
        recordElementsUpdate((prev) => {
          const newElements = [...prev];
          newElements.splice(index, 0, baseElement);
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
      prev.map((el) =>
        el.id === id ? { ...el, styles: { ...el.styles, ...newStyles } } : el
      )
    );
    // Also update the selected element if it's the one being updated.
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement((prevSelected) => ({
        ...prevSelected,
        styles: { ...prevSelected.styles, ...newStyles },
      }));
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
    selectedStyle,
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
