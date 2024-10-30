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

  const addNewElement = (type, level = 1, parentId = null, index = null) => {
    const newId = `element${Date.now()}`;
    const newElement = {
      id: newId,
      type,
      content: type === 'button' ? 'Click Me' : `New ${type}`,
      styles: {}, // Initialize an empty styles object
      children: [], // Initialize empty children array for nesting
    };
  
    // Set level if the new element is a heading
    if (type === 'heading') newElement.level = level;
  
    setElements((prevElements) => {
      const newElements = [...prevElements];
  
      if (parentId) {
        // Recursive function to add element to the parent
        const addElementToParent = (elementsArray) => {
          return elementsArray.map((element) => {
            if (element.id === parentId) {
              const updatedElement = { ...element };
              if (index !== null) {
                updatedElement.children.splice(index, 0, newElement);
              } else {
                updatedElement.children.push(newElement);
              }
              return updatedElement;
            }
            // Recurse into children if element has nested elements
            if (element.children) {
              return { ...element, children: addElementToParent(element.children) };
            }
            return element;
          });
        };
        return addElementToParent(newElements);
      } else {
        // Add to root level if no parentId is specified
        if (index !== null) {
          newElements.splice(index, 0, newElement);
        } else {
          newElements.push(newElement);
        }
        return newElements;
      }
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
    const updateElementStyles = (elementsArray) =>
      elementsArray.map((el) =>
        el.id === id
          ? { ...el, styles: { ...el.styles, ...newStyles } }
          : { ...el, children: updateElementStyles(el.children || []) }
      );
  
    setElements((prevElements) => updateElementStyles(prevElements));
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
