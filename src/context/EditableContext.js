import React, { createContext, useState, useEffect } from 'react';

export const EditableContext = createContext();

let elementCounter = 0;

const generateUniqueId = () => {
  elementCounter += 1;
  return `element-${Date.now()}-${elementCounter}-${Math.random().toString(36).substr(2, 8)}`;
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
    console.log(`Generated new element ID: ${newId}`); // Debugging log
  
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
      let updatedElements = [...prevElements];
  
      if (parentId === null) {
        updatedElements = [...prevElements, newElement];
      } else {
        // Find parent and add this element as a child
        updatedElements = prevElements.map((el) => {
          if (el.id === parentId) {
            return {
              ...el,
              children: [...el.children, newId],
            };
          }
          return el;
        });
        updatedElements.push(newElement);
      }
  
      console.log('Updated elements array:', updatedElements); // Debugging log
      return updatedElements;
    });
  
    return newId;
  };
  





  const updateStyles = (id, newStyles) => {
    console.log("Updating styles for:", id, newStyles);

    const updateElementStyles = (elementsArray) => {
      return elementsArray.map((el) => {
        if (!el) return el; // Skip undefined elements to avoid errors

        if (el.id === id) {
          return {
            ...el,
            styles: {
              ...el.styles,
              ...newStyles,
            },
          };
        }

        if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: el.children.map((childId) => {
              const child = elementsArray.find((childEl) => childEl && childEl.id === childId);
              if (child) {
                return child.id; // Keep child reference in the parent
              }
              return childId; // If child is not found, return the childId itself
            }),
          };
        }

        return el;
      });
    };

    setElements((prevElements) => {
      const updatedElements = updateElementStyles(prevElements);
      localStorage.setItem('editableElements', JSON.stringify(updatedElements));
      return updatedElements;
    });
  };


  const updateContent = (id, newContent) => {
    console.log("Updating content for:", id, newContent);

    const updateElementContent = (elementsArray) => {
      return elementsArray.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            content: newContent,
          };
        }
        return el;
      });
    };

    setElements((prevElements) => {
      const updatedElements = updateElementContent(prevElements);
      localStorage.setItem('editableElements', JSON.stringify(updatedElements));
      return updatedElements;
    });
  };

  const findElementById = (id, elementsArray) => {
    for (const element of elementsArray) {
      if (element.id === id) {
        console.log('Found element:', element);
        return element;
      }
  
      // Traverse children if they exist
      if (element.children && element.children.length > 0) {
        const found = findElementById(id, elementsArray.filter((el) => element.children.includes(el.id)));
        if (found) {
          return found;
        }
      }
    }
    console.log('Element not found with id:', id); // Add logging for missed elements
    return null;
  };
  

  return (
    <EditableContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        elements,
        addNewElement,
        updateStyles,
        updateContent,
        setElements,
        findElementById,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
