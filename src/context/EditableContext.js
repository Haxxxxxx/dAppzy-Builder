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
      level, // Store level directly if it's a heading
      children: [],
    };

    setElements((prevElements) => {
      // Insert the new element at the specified index
      const newElements = [...prevElements];
      if (index !== null && index >= 0 && index <= newElements.length) {
        newElements.splice(index, 0, newElement); // Insert at specified index
      } else {
        newElements.push(newElement); // Fallback to the end if index is null or invalid
      }

      // Save to localStorage and update the state
      localStorage.setItem('editableElements', JSON.stringify(newElements));
      return newElements;
    });

    return newId; // Return the ID of the new element for immediate selection
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
