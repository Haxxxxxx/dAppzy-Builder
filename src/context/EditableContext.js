// src/context/EditableContext.js

import React, { createContext, useState, useEffect } from 'react';
import {
  generateUniqueId,
  buildHierarchy,
  findElementById,
  removeElementRecursively,
} from '../utils/LeftBarUtils/elementUtils';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../utils/LeftBarUtils/storageUtils';
import { structureConfigurations } from '../configs/structureConfigurations';

export const EditableContext = createContext();

const ELEMENTS_VERSION = '1.0';

export const EditableProvider = ({ children, userId }) => {
  console.log('EditableProvider received userId:', userId);

  // ---------------------------------------------
  // Selected element (for highlight, etc.)
  // ---------------------------------------------
  const [selectedElement, setSelectedElement] = useState(null);

  // ---------------------------------------------
  // Main elements state
  // ---------------------------------------------
  const [elements, setElements] = useState(() => {
    const savedVersion = localStorage.getItem('elementsVersion');
    const savedElements = JSON.parse(localStorage.getItem('editableElements') || '[]');
    return savedVersion === ELEMENTS_VERSION && Array.isArray(savedElements)
      ? savedElements
      : [];
  });

  // ---------------------------------------------
  // Undo/Redo History
  // ---------------------------------------------
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  /**
   * Push a new state of elements to the history,
   * discarding any future states if we've undone.
   */
  const pushToHistory = (newElements) => {
    // If user made a new change after undo, remove "future" states
    const truncatedHistory = history.slice(0, currentIndex + 1);
    // Push new state
    const updatedHistory = [...truncatedHistory, newElements];
    setHistory(updatedHistory);
    // Advance pointer
    setCurrentIndex(updatedHistory.length - 1);
  };

  /**
   * Wrap setElements so we automatically:
   *   1) Save to localStorage
   *   2) Push to history
   */
  const recordElementsUpdate = (updater) => {
    setElements((prev) => {
      const newElements =
        typeof updater === 'function' ? updater(prev) : updater;

      // Save to local storage
      saveToLocalStorage('editableElements', newElements);
      // Also push to history for undo/redo
      pushToHistory(newElements);

      return newElements;
    });
  };

  // ---------------------------------------------
  // Undo/Redo
  // ---------------------------------------------
  const undo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setElements(history[newIndex]);
      // Also save that version to localStorage
      saveToLocalStorage('editableElements', history[newIndex]);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setElements(history[newIndex]);
      // Also save that version to localStorage
      saveToLocalStorage('editableElements', history[newIndex]);
    }
  };

  // On mount, push the initial state (from localStorage) to the history
  useEffect(() => {
    pushToHistory(elements);
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
    // eslint-disable-next-line
  }, []);

  // ---------------------------------------------
  // Forced border style for selected elements
  // ---------------------------------------------
  const forcedBorderStyle = {
    outline: '1px solid #4D70FF',
    boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
  };

  const forceBorder = selectedElement !== null;
  const selectedStyle = {
    outline: '1px solid #4D70FF',
    boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
  };

  // ---------------------------------------------
  // CRUD-Like Functions
  // ---------------------------------------------

  /**
   * Add a new element (with optional children if using a structure).
   * Insert at `index` if top-level, or append if it has a parent.
   */
  const addNewElement = (type, level = 1, index = 0, parentId = null, structure = null) => {
    let newId = generateUniqueId(type);
    while (elements.some((el) => el.id === newId)) {
      console.warn(`Duplicate ID detected: ${newId}. Regenerating ID.`);
      newId = generateUniqueId(type);
    }

    const baseElement = {
      id: newId,
      type,
      styles: {},
      level,
      children: [],
      label: '',
      parentId: parentId || null,
      content: (() => {
        switch (type) {
          case 'paragraph':
            return 'New Paragraph';
          case 'anchor':
            return 'Click here';
          case 'blockquote':
            return 'Blockquote text...';
          case 'code':
            return 'Code snippet...';
          case 'pre':
            return 'Preformatted text...';
          case 'list-item':
            return 'Editable Item';
          case 'button':
            return 'Click Me';
          default:
            return '';
        }
      })(),
      structure: structure || null,
      configuration: structure || null,
      settings: {},
    };

    if (type === 'image') {
      baseElement.src = 'https://picsum.photos/150';
    }

    // If user chose a structure (e.g., "navbar"), create children from config
    if (structure && structureConfigurations[structure]) {
      baseElement.styles = structureConfigurations[structure].styles || {};
      const childrenElements = structureConfigurations[structure].children.map((child) => ({
        id: generateUniqueId(child.type),
        type: child.type,
        content: child.content || '',
        styles: child.styles || {},
        label: child.label || '',
        parentId: newId,
      }));
      baseElement.children = childrenElements.map((child) => child.id);

      // If top-level, insert at the provided index
      if (!parentId) {
        recordElementsUpdate((prev) => {
          const newElements = [...prev];
          newElements.splice(index, 0, baseElement, ...childrenElements);
          return newElements;
        });
      } else {
        // If child, just append
        recordElementsUpdate((prev) => [...prev, baseElement, ...childrenElements]);
      }
    } else {
      // No structure config
      if (!parentId) {
        // Insert top-level at the provided index
        recordElementsUpdate((prev) => {
          const newElements = [...prev];
          newElements.splice(index, 0, baseElement);
          return newElements;
        });
      } else {
        // Append as child
        recordElementsUpdate((prev) => [...prev, baseElement]);
      }
    }

    console.log('Added new element:', baseElement);
    return newId;
  };

  /**
   * Move an existing element to a new index (top-level reorder).
   */
  const moveElement = (id, newIndex) => {
    recordElementsUpdate((prevElements) => {
      const index = prevElements.findIndex((el) => el.id === id);
      if (index === -1) return prevElements;
      const element = prevElements[index];
      const newElements = [...prevElements];
      newElements.splice(index, 1);
      newElements.splice(newIndex, 0, element);
      return newElements;
    });
  };

  /**
   * Remove element (and its children).
   */
  const handleRemoveElement = (id) => {
    setSelectedElement(null);
    recordElementsUpdate((prevElements) => removeElementRecursively(id, prevElements));
  };

  /**
   * Update textual content.
   */
  const updateContent = (id, content) => {
    recordElementsUpdate((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  };

  /**
   * Update inline styles (merge with existing).
   */
  const updateStyles = (id, newStyles) => {
    console.log(`Updating styles for ${id}:`, newStyles);
    recordElementsUpdate((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, styles: { ...el.styles, ...newStyles } } : el
      )
    );
  };

  /**
   * Update entire element (merge in newProperties).
   */
  const updateElementProperties = (id, newProperties) => {
    recordElementsUpdate((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newProperties } : el))
    );
  };

  /**
   * Save a nested section to local storage (by ID).
   */
  const saveSectionToLocalStorage = (sectionId) => {
    const section = findElementById(sectionId, elements);
    if (section) {
      const buildNestedStructure = (parentId) => {
        const parent = findElementById(parentId, elements);
        if (!parent) return null;
        const children = parent.children.map((childId) => buildNestedStructure(childId));
        return {
          id: parent.id,
          type: parent.type,
          styles: parent.styles,
          content: parent.content,
          children,
        };
      };
      const navbarHierarchy = buildNestedStructure(sectionId);
      saveToLocalStorage(`section-${sectionId}`, navbarHierarchy);
    }
  };

  /**
   * Load a nested section from local storage (by ID).
   * This replaces the entire `elements`.
   */
  const loadSectionFromLocalStorage = (sectionId) => {
    const savedSection = loadFromLocalStorage(`section-${sectionId}`);
    if (savedSection) {
      const flattenNestedStructure = (node, accumulator = []) => {
        if (!node) return accumulator;
        const { children, ...rest } = node;
        accumulator.push(rest);
        children.forEach((child) => flattenNestedStructure(child, accumulator));
        return accumulator;
      };
      const flattenedElements = flattenNestedStructure(savedSection);
      recordElementsUpdate(flattenedElements);
    }
  };

  /**
   * Update "configuration" and "settings" for an element.
   */
  const updateConfiguration = (id, key, value) => {
    recordElementsUpdate((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              configuration: {
                ...el.configuration,
                [key]: value,
              },
              settings: {
                ...el.settings,
                [key]: value,
              },
            }
          : el
      )
    );
  };

  // ---------------------------------------------
  // Return context
  // ---------------------------------------------
  return (
    <EditableContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        elements,
        // CRUD
        addNewElement,
        moveElement,
        handleRemoveElement,
        updateContent,
        updateStyles,
        updateElementProperties,
        updateConfiguration,

        // Sections
        saveSectionToLocalStorage,
        loadSectionFromLocalStorage,

        // Utilities
        findElementById,
        buildHierarchy,
        saveToLocalStorage,

        // Undo/Redo
        undo,
        redo,

        // UI States
        selectedStyle,
        forcedBorderStyle,
        forceBorder,

        // Possibly useful to pass userId
        userId,
      }}
    >
      {children}
    </EditableContext.Provider>
  );
};
