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
    let newElement = {
      id: newId,
      type,
      content: `New ${type}`,
      styles: {},
      level,
      children: [],
      parentId: parentId || null,
      structure,
    };

    let childrenToAdd = [];

    // Add specific children if the element is a special type like navbar
    if (type === 'navbar') {
      const logoId = generateUniqueId();
      const titleId = generateUniqueId();
      const link1Id = generateUniqueId();
      const link2Id = generateUniqueId();
      const link3Id = generateUniqueId();
      const link4Id = generateUniqueId();
      const button1Id = generateUniqueId();
      const button2Id = generateUniqueId();

      newElement.children = [
        logoId,
        titleId,
        link1Id,
        link2Id,
        link3Id,
        link4Id,
        button1Id,
        button2Id,
      ];

      childrenToAdd = [
        {
          id: logoId,
          type: 'image',
          content: 'Logo',
          styles: { width: '40px', height: '40px', borderRadius: '50%' },
          parentId: newId,
          children: [],
        },
        {
          id: titleId,
          type: 'span',
          content: '3S.Template',
          styles: { marginLeft: '8px', fontSize: '1.5rem' },
          parentId: newId,
          children: [],
        },
        {
          id: link1Id,
          type: 'span',
          content: 'Link',
          styles: {},
          parentId: newId,
          children: [],
        },
        {
          id: link2Id,
          type: 'span',
          content: 'Link',
          styles: {},
          parentId: newId,
          children: [],
        },
        {
          id: link3Id,
          type: 'span',
          content: 'Link',
          styles: {},
          parentId: newId,
          children: [],
        },
        {
          id: link4Id,
          type: 'span',
          content: 'Link',
          styles: {},
          parentId: newId,
          children: [],
        },
        {
          id: button1Id,
          type: 'button',
          content: 'Button Text',
          styles: {
            border: 'none',
            padding: '16px 28px',
            height: '48px',
            fontFamily: 'Roboto, sans-serif',
          },
          parentId: newId,
          children: [],
        },
        {
          id: button2Id,
          type: 'button',
          content: 'Button Text',
          styles: {
            backgroundColor: 'var(--dark-grey, #334155)',
            color: '#fff',
            padding: '16px 28px',
            border: 'none',
            height: '48px',
            fontFamily: 'Roboto, sans-serif',
          },
          parentId: newId,
          children: [],
        },
      ];
    }

    setElements((prevElements) => {
      // Check if the element already exists in prevElements to avoid duplication
      const doesElementExist = prevElements.some((el) => el.id === newId);
      if (doesElementExist) {
        console.warn('Attempted to add a duplicate element:', newId);
        return prevElements; // Return without making changes if duplicate
      }

      let updatedElements = [...prevElements, newElement];

      // Add the children if there are any
      if (childrenToAdd.length > 0) {
        updatedElements = updatedElements.concat(childrenToAdd);
      }

      // Update the parent element if necessary
      if (parentId !== null) {
        updatedElements = updatedElements.map((el) =>
          el.id === parentId ? { ...el, children: [...el.children, newId] } : el
        );
      }

      return updatedElements;
    });

    return newId;
  };

  const updateStyles = (id, newStyles) => {
    // console.log("Updating styles for:", id, newStyles);

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
    // console.log("Updating content for:", id, newContent);

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
        // console.log('Found element:', element);
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
    // console.log('Element not found with id:', id); // Add logging for missed elements
    return null;
  };

  // Function to build nested hierarchy
  const buildHierarchy = (elements, parentId = null) => {
    return elements
      .filter((element) => element.parentId === parentId)
      .map((element) => {
        return {
          ...element,
          children: buildHierarchy(elements, element.id),
        };
      });
  };

  return (
    <EditableContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        elements,
        addNewElement,
        setElements,
        findElementById,
        buildHierarchy,
        updateContent,
        updateStyles,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
