import React, { createContext, useState, useEffect } from 'react';
import {
  generateUniqueId,
  buildHierarchy,
  findElementById,
  removeElementById,
} from '../utils/LeftBarUtils/elementUtils';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../utils/LeftBarUtils/storageUtils';
import { structureConfigurations } from '../configs/structureConfigurations';

export const EditableContext = createContext();

const ELEMENTS_VERSION = '1.0';

export const EditableProvider = ({ children }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState(() => {
    const savedVersion = localStorage.getItem('elementsVersion');
    const savedElements = JSON.parse(localStorage.getItem('editableElements') || '[]');
    return savedVersion === ELEMENTS_VERSION && Array.isArray(savedElements) ? savedElements : [];
  });

  const addNewElement = (type, level = 1, index = null, parentId = null, structure = null) => {
    const existingElement = elements.find(
      (el) => el.type === type && el.parentId === parentId && el.structure === structure
    );
    if (existingElement) {
      console.warn(`Element of type ${type} already exists for parentId ${parentId}`);
      return existingElement.id;
    }
  
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
      label: '', // Default empty label
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
          default:
            return ''; // Default to an empty string
        }
      })(),
      structure: structure || null,
      configuration: structure || null,
      settings: {},
    };
  
    if (structure && structureConfigurations[structure]) {
      const children = structureConfigurations[structure].children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        styles: child.styles || {},
        label: child.label || '', // Ensure label is passed here
        parentId: newId,
      }));
  
      baseElement.children = children.map((child) => child.id);
  
      setElements((prev) => [...prev, baseElement, ...children]);
    } else {
      setElements((prev) => [...prev, baseElement]);
    }
  
    console.log('Added new element:', baseElement);
    return newId;
  };
  

  const handleRemoveElement = (id) => {
    setElements((prevElements) => {
      const updatedElements = removeElementById(id, prevElements);
      localStorage.setItem('editableElements', JSON.stringify(updatedElements));
      return updatedElements;
    });
  };

  const updateContent = (id, content) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  };

  const updateStyles = (id, newStyles) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, styles: { ...el.styles, ...newStyles } } : el))
    );
  };

  const saveSectionToLocalStorage = (sectionId) => {
    const section = findElementById(sectionId, elements);
    if (section) {
      const hierarchy = buildHierarchy(elements);
      saveToLocalStorage(`section-${sectionId}`, hierarchy);
    }
  };

  const loadSectionFromLocalStorage = (sectionId) => {
    return loadFromLocalStorage(`section-${sectionId}`);
  };

  const updateConfiguration = (id, key, value) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id
          ? {
            ...el,
            configuration: {
              ...el.configuration,
              [key]: value,
            },
            settings: {
              ...el.settings,
              [key]: value, // Ensure settings are updated
            },
          }
          : el
      )
    );
  };

  useEffect(() => {
    saveToLocalStorage('editableElements', elements);
    saveToLocalStorage('elementsVersion', ELEMENTS_VERSION);
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
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
