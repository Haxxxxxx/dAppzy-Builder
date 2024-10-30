// src/context/EditableContext.js
import React, { createContext, useState, useEffect } from 'react';

export const EditableContext = createContext();

export const EditableProvider = ({ children }) => {
  const ELEMENTS_VERSION = '1.0';
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState(() => {
    const savedVersion = localStorage.getItem('elementsVersion');
    const savedElements = localStorage.getItem('editableElements');
    
    if (savedElements && savedVersion === ELEMENTS_VERSION) {
      return JSON.parse(savedElements);
    } else {
      const defaultElements = {
        p1: { type: 'paragraph', content: 'This is the first paragraph.', styles: {} },
        h1: { type: 'heading', level: 1, content: 'This is a Heading 1', styles: {} },
        h2: { type: 'heading', level: 2, content: 'This is a Heading 2', styles: {} },
      };
      localStorage.setItem('editableElements', JSON.stringify(defaultElements));
      localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
      return defaultElements;
    }
  });

  useEffect(() => {
    localStorage.setItem('editableElements', JSON.stringify(elements));
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);

  const updateContent = (id, newContent) => {
    setElements((prev) => ({ ...prev, [id]: { ...prev[id], content: newContent } }));
  };

  const updateStyles = (id, newStyles) => {
    setElements((prev) => ({
      ...prev,
      [id]: { ...prev[id], styles: { ...prev[id].styles, ...newStyles } },
    }));
  };

  const addNewElement = (type, level = 1, index = null) => {
    const newId = `element${Date.now()}`; // Unique ID based on timestamp
    const newElement = type === 'paragraph'
      ? { type: 'paragraph', content: 'New paragraph', styles: {} }
      : { type: 'heading', level, content: `New Heading ${level}`, styles: {} };

    setElements((prevElements) => {
      const entries = Object.entries(prevElements);
      const newEntries = index !== null
        ? [...entries.slice(0, index), [newId, newElement], ...entries.slice(index)]
        : [...entries, [newId, newElement]];
      return Object.fromEntries(newEntries);
    });
  };

  return (
    <EditableContext.Provider value={{ selectedElement, setSelectedElement, elements, updateContent, updateStyles, addNewElement }}>
      {children}
    </EditableContext.Provider>
  );
};
