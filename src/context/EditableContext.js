import React, { createContext, useState, useEffect } from 'react';

export const EditableContext = createContext();

let elementCounter = 0;

const generateUniqueId = () => {
  elementCounter += 1;
  return `element-${Date.now()}-${elementCounter}-${Math.random().toString(36).substr(2, 5)}`;
};

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

  const addNewElement = (type, level = 1, index = null, parentId = null, structure = null) => {
    const newId = generateUniqueId();
    const newElement = {
      id: newId,
      type,
      content: `New ${type}`,
      styles: {},
      level,
      children: [],
      parentId: parentId || null,
      structure,
    };

    setElements((prevElements) => {
      if (parentId === null) {
        // If there's no parent, add as a top-level element
        return [...prevElements, newElement];
      }

      // If there is a parent, find and add the new element as a child of that parent
      const updatedElements = prevElements.map((el) => {
        if (el.id === parentId) {
          return {
            ...el,
            children: [...el.children, newId],
          };
        }
        return el;
      });

      return [...updatedElements, newElement];
    });

    return newId;
  };


  const updateContent = (id, newContent) => {
    const updateElementContent = (elementsArray) =>
      elementsArray.map((el) => {
        if (el.id === id) {
          return { ...el, content: newContent };
        } else if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: updateElementContent(el.children),
          };
        }
        return el;
      });

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
        setElements,findElementById,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
