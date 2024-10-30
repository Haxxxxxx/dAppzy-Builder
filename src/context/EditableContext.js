// src/context/EditableContext.js
import React, { createContext, useState, useEffect } from 'react';

export const EditableContext = createContext();

export const EditableProvider = ({ children }) => {
  const ELEMENTS_VERSION = '1.0';
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState(() => {
    const savedVersion = localStorage.getItem('elementsVersion');
    const savedElements = JSON.parse(localStorage.getItem('editableElements') || '[]');
    
    if (Array.isArray(savedElements) && savedVersion === ELEMENTS_VERSION) {
      return savedElements;
    } else {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('editableElements', JSON.stringify(elements));
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);

  const addNewElement = (type, level = 1, index = null) => {
    const newId = `element${Date.now()}`;
    const newElement = {
      id: newId,
      type,
      content: type === 'button' ? 'Click Me' : `New ${type}`,
      styles: {},
      children: [],
    };
  
    if (type === 'heading') newElement.level = level;
  
    setElements((prevElements) => {
      const newElements = [...prevElements];
  
      if (index !== null && index >= 0 && index <= newElements.length) {
        // Insert element at the specified index
        newElements.splice(index, 0, newElement);
      } else {
        // Add to the end if index is not specified
        newElements.push(newElement);
      }
  
      // Save to localStorage for persistence
      localStorage.setItem('editableElements', JSON.stringify(newElements));
      return newElements;
    });
  };
  
  
  
  
  
  const updateContent = (id, newContent) => {
    const updateElementContent = (elementsArray) =>
      elementsArray.map((el) =>
        el.id === id
          ? { ...el, content: newContent }
          : { ...el, children: updateElementContent(el.children || []) }
      );

    setElements((prevElements) => updateElementContent(prevElements));
  };

  const updateStyles = (id, newStyles) => {
    console.log("Updating styles for:", id, newStyles); // Debugging
    
    // Recursive update function to handle nested elements
    const updateElementStyles = (elementsArray) =>
      elementsArray.map((el) =>
        el.id === id
          ? { ...el, styles: { ...el.styles, ...newStyles } }
          : { ...el, children: updateElementStyles(el.children || []) }
      );
  
    setElements((prevElements) => {
      const updatedElements = updateElementStyles(prevElements);
      localStorage.setItem('editableElements', JSON.stringify(updatedElements)); // Save updated elements immediately
      return updatedElements;
    });
  };
  
  useEffect(() => {
    localStorage.setItem('editableElements', JSON.stringify(elements));
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);
  
  // Helper function to find an element by ID, even if nested
  const findElementById = (id, elementsArray) => {
    for (const element of elementsArray) {
      if (element.id === id) {
        return element;
      }
      if (element.children) {
        const found = findElementById(id, element.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  return (
    <EditableContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        elements,
        addNewElement,
        updateContent,
        updateStyles,
        findElementById,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
