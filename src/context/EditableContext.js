import React, { createContext, useState, useEffect } from 'react';
import {
  generateUniqueId,
  buildHierarchy,
  findElementById,
  removeElementById,
} from '../utils/elementUtils';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../utils/storageUtils';
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
    const newId = generateUniqueId(type);
    const baseElement = {
      id: newId,
      type,
      styles: {},
      level,
      children: [],
      parentId: parentId || null,
      content: type === 'paragraph' ? 'New Paragraph' : null,
      structure: structure || null,
      configuration: structure || null, // Include configuration for proper rendering
    };
  
    // Create children based on structure
    if (structure && structureConfigurations[structure]) {
      const children = structureConfigurations[structure].children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        styles: child.styles || {},
        parentId: newId, // Set the parentId for each child
      }));
  
      baseElement.children = children.map((child) => child.id);
  
      // Add base element and its children to the state
      setElements((prev) => [...prev, baseElement, ...children]);
    } else {
      // Add only the base element if no structure
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
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
