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

  const addNewElement = (type, level = 1, index = null, parentId = null) => {
  const newId = `element${Date.now()}`;
  const newElement = {
    id: newId,
    type,
    content: type === 'button' ? 'Click Me' : `New ${type}`,
    styles: {},
    level,
    children: [],
  };

  const updatedElements = (elementsArray) => {
    if (parentId === null) {
      // Add as a root element
      return [...elementsArray, newElement];
    } else {
      return elementsArray.map((el) => {
        if (el.id === parentId) {
          // Add the new child to the specific parent
          return {
            ...el,
            children: [...el.children, newElement],
          };
        } else if (el.children && el.children.length > 0) {
          // Recurse to find the correct parent
          return {
            ...el,
            children: updatedElements(el.children),
          };
        }
        return el;
      });
    }
  };

  setElements((prevElements) => updatedElements(prevElements));
  return newId;
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
    console.log("Updating styles for:", id, newStyles);

    const updateElementStyles = (elementsArray) =>
      elementsArray.map((el) =>
        el.id === id
          ? { ...el, styles: { ...el.styles, ...newStyles } }
          : { ...el, children: updateElementStyles(el.children || []) }
      );

    setElements((prevElements) => {
      const updatedElements = updateElementStyles(prevElements);
      localStorage.setItem('editableElements', JSON.stringify(updatedElements));
      return updatedElements;
    });
  };

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
