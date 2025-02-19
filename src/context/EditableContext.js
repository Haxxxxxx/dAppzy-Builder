// src/context/EditableContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
  generateUniqueId,
  buildHierarchy,
  findElementById,
  removeElementById,
  removeElementRecursively,
} from '../utils/LeftBarUtils/elementUtils';

import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../utils/LeftBarUtils/storageUtils';
import { structureConfigurations } from '../configs/structureConfigurations';

export const EditableContext = createContext();

const ELEMENTS_VERSION = '1.0';

export const EditableProvider = ({ children, userId }) => {
  const [selectedElement, setSelectedElement] = useState(null);

  const [elements, setElements] = useState(() => {
    const savedVersion = localStorage.getItem('elementsVersion');
    const savedElements = JSON.parse(localStorage.getItem('editableElements') || '[]');
    return savedVersion === ELEMENTS_VERSION && Array.isArray(savedElements)
      ? savedElements
      : [];
  });

  console.log("Current elements:", elements);

  const selectedStyle = {
    outline: '1px solid #4D70FF',
    boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
  };

  // -------------- Add Element --------------
  const addNewElement = (type, level = 1, index = null, parentId = null, structure = null) => {
    let newId = generateUniqueId(type);

    while (elements.some((el) => el.id === newId)) {
      console.warn(`Duplicate ID detected: ${newId}. Regenerating ID.`);
      newId = generateUniqueId(type);
    }

    const baseElement = {
      id: newId,
      type,
      styles: {},
      level,
      children: [],
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
      configuration: structure || null,
      settings: {},
    };

    // For image elements, set a default top-level src.
    if (type === 'image') {
      baseElement.src = "https://picsum.photos/150";
    }

    // If we have a structure config
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

      setElements((prev) => [...prev, baseElement, ...childrenElements]);
    } else {
      setElements((prev) => [...prev, baseElement]);
    }

    console.log('Added new element:', baseElement);
    return newId;
  };

  // -------------- Remove Element (recursively) --------------
  const handleRemoveElement = (id) => {
    setSelectedElement(null);
    setElements((prevElements) => {
      const updatedElements = removeElementRecursively(id, prevElements);
      saveToLocalStorage('editableElements', updatedElements);
      return updatedElements;
    });
  };

  // -------------- Update Content --------------
  const updateContent = (id, content) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  };

  // -------------- Update Styles --------------
  const updateStyles = (id, newStyles) => {
    console.log(`Updating styles for ${id}:`, newStyles);
    setElements((prev) => {
      const updatedElements = prev.map((el) =>
        el.id === id ? { ...el, styles: { ...el.styles, ...newStyles } } : el
      );
      saveToLocalStorage('editableElements', updatedElements);
      return updatedElements;
    });
  };

  // -------------- Update Element Properties (e.g. top-level src) --------------
  const updateElementProperties = (id, newProperties) => {
    setElements((prev) => {
      const updatedElements = prev.map((el) =>
        el.id === id ? { ...el, ...newProperties } : el
      );
      saveToLocalStorage('editableElements', updatedElements);
      return updatedElements;
    });
  };

  // -------------- Save Section to Local Storage --------------
  const saveSectionToLocalStorage = (sectionId) => {
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
  };

  const loadSectionFromLocalStorage = (sectionId) => {
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
      setElements(flattenedElements);
    }
  };

  const updateConfiguration = (id, key, value) => {
    setElements((prev) =>
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
  };

  useEffect(() => {
    saveToLocalStorage('editableElements', elements);
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);

  return (
    <EditableContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        elements,
        setElements,
        addNewElement,
        updateContent,
        updateStyles,
        saveSectionToLocalStorage,
        loadSectionFromLocalStorage,
        findElementById,
        buildHierarchy,
        handleRemoveElement,
        saveToLocalStorage,
        updateConfiguration,
        selectedStyle,
        updateElementProperties,
        userId,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
