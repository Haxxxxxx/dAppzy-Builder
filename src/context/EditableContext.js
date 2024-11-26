import React, { createContext, useState, useEffect } from 'react';

export const EditableContext = createContext();

let elementCounter = 0;

const generateUniqueId = (type) => {
  elementCounter += 1;
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ''); // Clean timestamp
  return `${type}-${timestamp}-${elementCounter}`;
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
    const validElements = elements.filter(
      (el) => el.type !== 'navbar' || (el.type === 'navbar' && el.configuration)
    );
    localStorage.setItem('editableElements', JSON.stringify(validElements));
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);
  

  const addNewElement = (type, level = 1, index = null, parentId = null, structure = null) => {
    const newId = generateUniqueId(type); // Generate unique ID based on type
    let newElement = {
      id: newId,
      type,
      styles: {},
      level,
      children: [],
      parentId: parentId || null,
      structure,
    };
  
    // Configuration mapping for navbar structures
    const structureConfigurations = {
      customTemplate: {
        children: [
          { type: 'image', content: 'Logo' },
          { type: 'span', content: 'Link 1' },
          { type: 'span', content: 'Link 2' },
          { type: 'span', content: 'Link 3' },
          { type: 'span', content: 'Link 4' },
          { type: 'button', content: 'Button Text' },
          { type: 'button', content: 'Button Text' },
        ],
      },
      twoColumn: {
        children: [
          { type: 'image', content: 'Logo' },
          { type: 'span', content: 'Home' },
          { type: 'span', content: 'About' },
          { type: 'span', content: 'Contact' },
        ],
      },
      threeColumn: {
        children: [
          { type: 'image', content: 'Logo' },
          { type: 'span', content: 'Home' },
          { type: 'span', content: 'Services' },
          { type: 'span', content: 'Contact' },
          { type: 'button', content: 'Call to Action' },
        ],
      },
    };
  
    // Validate configuration for navbar
    if (type === 'navbar') {
      if (!structure) {
        console.warn(`Skipping navbar creation: Missing configuration for id ${newId}`);
        return null; // Do not create or store the element if configuration is missing
      }
  
      const structureConfig = structureConfigurations[structure];
      if (structureConfig) {
        const children = structureConfig.children.map((child) => ({
          id: generateUniqueId(child.type),
          type: child.type,
          content: child.content,
          parentId: newId,
        }));
        newElement.children = children.map((child) => child.id);
  
        // Add the element and its children to the state
        setElements((prev) => [...prev, newElement, ...children]);
      } else {
        console.warn(`Unsupported navbar structure: ${structure}`);
      }
    } else {
      setElements((prev) => [...prev, newElement]);
    }
  
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
    // console.log("Updating content for:", id, newCont ent);

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
    console.log(`Searching for id: ${id}`);
    for (const element of elementsArray) {
      if (element.id === id) {
        console.log('Found element:', element);
        return element;
      }
  
      if (element.children && element.children.length > 0) {
        const found = findElementById(id, elementsArray.filter((el) => element.children.includes(el.id)));
        if (found) {
          return found;
        }
      }
    }
  
    console.warn(`Element with id ${id} not found.`);
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

  const saveSectionToLocalStorage = (sectionId) => {
    const section = findElementById(sectionId, elements);
    if (!section) {
      console.warn(`Section with id ${sectionId} not found.`);
      return;
    }
  
    const sectionHierarchy = buildHierarchy(elements, sectionId);
    localStorage.setItem(`section-${sectionId}`, JSON.stringify(sectionHierarchy));
  };
  
  const loadSectionFromLocalStorage = (sectionId) => {
    const savedSection = localStorage.getItem(`section-${sectionId}`);
    if (!savedSection) {
      console.warn(`No saved section found with id ${sectionId}.`);
      return null;
    }
  
    return JSON.parse(savedSection);
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
        saveSectionToLocalStorage,
        loadSectionFromLocalStorage,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
