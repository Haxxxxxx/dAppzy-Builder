// src/context/EditableContext.js

import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  generateUniqueId,
  removeElementRecursively,
} from '../utils/LeftBarUtils/elementUtils';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../utils/LeftBarUtils/storageUtils';
import { structureConfigurations } from '../configs/structureConfigurations';

export const EditableContext = createContext();
export const ELEMENTS_VERSION = '1.0.0'; // Define the version constant

export const EditableProvider = ({ children, userId }) => {
  // Initialize state first
  const [elements, setElements] = useState([]); // Start with empty array instead of loading from localStorage

  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([{ elements: [], selectedElement: null }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [forceBorder, setForceBorder] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [copiedElement, setCopiedElement] = useState(null);
  const [styleEditingMode, setStyleEditingMode] = useState('normal'); // 'normal' | 'hover' | 'focus'
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  // Wrap setSelectedElement to reset style editing mode when selection changes
  const selectElement = useCallback((el) => {
    setSelectedElement(el);
    setStyleEditingMode('normal');
  }, []);

  // Keep a ref to elements for use in handlers that need fresh state mid-execution
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  // Define findElementById function
  const findElementById = useCallback((id, elementsList = elements) => {
    return elementsList.find(el => el.id === id);
  }, [elements]);

  const MAX_HISTORY = 50;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Uses functional setHistory to avoid stale closure over history/currentIndex
  const pushToHistory = useCallback((newElements) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, currentIndexRef.current + 1);
      const updated = [...truncated, { elements: newElements, selectedElement }];
      // Cap history to prevent unbounded growth
      if (updated.length > MAX_HISTORY) {
        const trimmed = updated.slice(updated.length - MAX_HISTORY);
        setCurrentIndex(trimmed.length - 1);
        return trimmed;
      }
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }, [selectedElement]);

  const recordElementsUpdate = useCallback((updater) => {
    setElements((prev) => {
      const newElements = typeof updater === 'function' ? updater(prev) : updater;
      saveToLocalStorage('editableElements', newElements);
      pushToHistory(newElements);
      return newElements;
    });
  }, [pushToHistory]);

  // Build an element and its children into a flat array without recording to history.
  // Returns { id, allElements } where allElements is the flat list of all created elements.
  const buildElementTree = useCallback((type, parentId, config, existingIds, depth = 0) => {
    if (depth > 20) {
      // Prevent stack overflow from deeply nested elements
      const safeId = generateUniqueId(type);
      existingIds.add(safeId);
      return { id: safeId, allElements: [{ id: safeId, type, styles: {}, content: '', children: [], parentId, settings: {} }] };
    }
    let newId = generateUniqueId(type);
    while (existingIds.has(newId)) {
      newId = generateUniqueId(type);
    }
    existingIds.add(newId);

    let resolvedType = type;
    let configuration = null;
    let structure = null;
    if (typeof config === 'string' && structureConfigurations[config]) {
      structure = config;
      configuration = config;
    } else if (config && typeof config === 'object') {
      configuration = config.configuration || config;
      structure = config.structure || config.configuration || config;
      resolvedType = config.type || type;
    }

    const configStyles = structure && structureConfigurations[structure]?.styles || {};
    const elementStyles = config?.styles || {};

    // For mintingSection, inject a candyMachineId child at creation time
    let childConfigs = config?.children || [];
    if (resolvedType === 'mintingSection' && Array.isArray(childConfigs)) {
      const hasCandyId = childConfigs.some(c => c.type === 'candyMachineId');
      if (!hasCandyId) {
        childConfigs = [{ type: 'candyMachineId', content: crypto.randomUUID() }, ...childConfigs];
      }
    }

    // Recursively build children
    const allElements = [];
    const childrenIds = childConfigs.map(childConfig => {
      const result = buildElementTree(childConfig.type, newId, childConfig, existingIds, depth + 1);
      allElements.push(...result.allElements);
      return result.id;
    });

    const baseElement = {
      id: newId,
      type: resolvedType,
      configuration,
      structure,
      styles: { ...configStyles, ...elementStyles },
      content: config?.content || '',
      label: config?.label || '',
      parentId,
      settings: config?.settings || {},
      children: childrenIds,
    };

    allElements.push(baseElement);
    return { id: newId, allElements };
  }, []);

  const addNewElement = useCallback((type, level = 1, index = 0, parentId = null, config = null) => {
    // Collect existing IDs for collision checking
    const existingIds = new Set(elementsRef.current.map(el => el.id));
    const { id: newId, allElements } = buildElementTree(type, parentId, config, existingIds);

    // Single recordElementsUpdate for the entire tree (one history entry, one save)
    recordElementsUpdate((prev) => {
      let newElements;
      if (!parentId) {
        newElements = [...prev];
        newElements.splice(index || 0, 0, ...allElements);
      } else {
        // Add all elements AND update parent's children array in a single pass
        newElements = [...prev, ...allElements].map(el =>
          el.id === parentId
            ? { ...el, children: [...(el.children || []), newId] }
            : el
        );
      }
      return newElements;
    });

    return newId;
  }, [recordElementsUpdate, buildElementTree]);

  const moveElement = useCallback((id, newIndex, newParentId) => {
    recordElementsUpdate((prevElements) => {
      const index = prevElements.findIndex((el) => el.id === id);
      if (index === -1) return prevElements;
      const element = prevElements[index];
      const oldParentId = element.parentId;

      let newElements = [...prevElements];
      newElements.splice(index, 1);
      newElements.splice(newIndex, 0, element);

      // Update parentId and parent children arrays when reparenting
      if (newParentId !== undefined && newParentId !== oldParentId) {
        newElements = newElements.map(el => {
          if (el.id === id) {
            return { ...el, parentId: newParentId };
          }
          // Remove from old parent's children
          if (el.id === oldParentId && el.children) {
            return { ...el, children: el.children.filter(cid => cid !== id) };
          }
          // Add to new parent's children
          if (el.id === newParentId && el.children) {
            return { ...el, children: [...el.children, id] };
          }
          return el;
        });
      }

      return newElements;
    });
  }, [recordElementsUpdate]);

  const handleRemoveElement = useCallback((id) => {
    setSelectedElement(null);
    recordElementsUpdate((prevElements) => removeElementRecursively(id, prevElements));
  }, [recordElementsUpdate]);

  const updateContent = useCallback((id, content) => {
    recordElementsUpdate((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  }, [recordElementsUpdate]);

  const updateStyles = useCallback((id, newStyles) => {
    recordElementsUpdate(prev => {
      const element = findElementById(id, prev);
      if (!element) return prev;

      // When editing a non-desktop breakpoint, store overrides in breakpointStyles
      if (activeBreakpoint !== 'desktop') {
        const bpKey = activeBreakpoint; // 'tablet' or 'mobile'
        const existingBp = element.breakpointStyles || {};
        const existingBpStyles = existingBp[bpKey] || {};
        return prev.map(el =>
          el.id === id
            ? {
                ...el,
                breakpointStyles: {
                  ...existingBp,
                  [bpKey]: { ...existingBpStyles, ...newStyles },
                },
              }
            : el
        );
      }

      // Get the configuration styles if available
      const configStyles = element.configuration && structureConfigurations[element.configuration]?.styles;

      // Merge styles in the correct order: base styles -> config styles -> new styles
      const mergedStyles = {
        ...(configStyles?.[element.type] || {}), // Base styles from configuration
        ...(element.styles || {}), // Existing styles
        ...newStyles // New styles override everything
      };

      // Handle nested styles (like img styles for images)
      if (element.type === 'image' && configStyles?.image?.img) {
        mergedStyles.img = {
          ...(configStyles.image.img || {}), // Base img styles from configuration
          ...(element.styles?.img || {}), // Existing img styles
          ...(newStyles?.img || {}) // New img styles override everything
        };
      }

      return prev.map(el =>
        el.id === id
          ? { ...el, styles: mergedStyles }
          : el
      );
    });
  }, [findElementById, recordElementsUpdate, activeBreakpoint]);

  const updateStateStyles = useCallback((id, stateName, newStyles) => {
    const stateKey = stateName === 'hover' ? 'hoverStyles' : 'focusStyles';
    recordElementsUpdate(prev =>
      prev.map(el =>
        el.id === id
          ? { ...el, [stateKey]: { ...(el[stateKey] || {}), ...newStyles } }
          : el
      )
    );
  }, [recordElementsUpdate]);

  const updateElementProperties = useCallback((id, newProperties) => {
    recordElementsUpdate((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newProperties } : el))
    );
  }, [recordElementsUpdate]);

  const saveSectionToLocalStorage = useCallback((sectionId) => {
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
  }, [elements]);

  const loadSectionFromLocalStorage = useCallback((sectionId) => {
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
  }, [recordElementsUpdate]);

  const updateConfiguration = useCallback((id, key, value) => {
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
  }, [recordElementsUpdate]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const snapshot = history[newIndex];
      const restoredElements = snapshot.elements || snapshot;
      setElements(restoredElements);
      if (snapshot.selectedElement !== undefined) {
        setSelectedElement(snapshot.selectedElement);
      }
      saveToLocalStorage('editableElements', restoredElements);
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const snapshot = history[newIndex];
      const restoredElements = snapshot.elements || snapshot;
      setElements(restoredElements);
      if (snapshot.selectedElement !== undefined) {
        setSelectedElement(snapshot.selectedElement);
      }
      saveToLocalStorage('editableElements', restoredElements);
    }
  }, [currentIndex, history]);

  const copyElement = useCallback((elementId) => {
    const allElements = elementsRef.current;
    const root = allElements.find(el => el.id === elementId);
    if (!root) return;

    // Build a deep config tree from the flat elements array so that
    // buildElementTree (which expects child config objects) can recreate the full tree.
    const buildConfigTree = (el, depth = 0) => {
      const { id, ...config } = el;
      if (depth > 20) {
        config.children = [];
        return config;
      }
      if (el.children && el.children.length > 0) {
        config.children = el.children
          .map(childId => allElements.find(c => c.id === childId))
          .filter(Boolean)
          .map(child => buildConfigTree(child, depth + 1));
      } else {
        config.children = [];
      }
      return config;
    };

    setCopiedElement(buildConfigTree(root));
  }, []);

  const pasteElement = useCallback((parentId, index) => {
    if (!copiedElement) return;
    addNewElement(copiedElement.type, copiedElement.level || 0, index, parentId, copiedElement);
  }, [copiedElement, addNewElement]);

  const handleAICommand = useCallback((command) => {
    if (!command || !command.action) {
      return null;
    }

    // Helper function to merge styles with proper inheritance
    const mergeStyles = (baseStyles, existingStyles, newStyles) => {
      const merged = {
        ...baseStyles,
        ...existingStyles,
        ...newStyles
      };

      // Handle hover states separately
      if (newStyles?.hover || existingStyles?.hover) {
        merged.hover = {
          ...(baseStyles?.hover || {}),
          ...(existingStyles?.hover || {}),
          ...(newStyles?.hover || {})
        };
      }

      // Remove undefined values
      Object.keys(merged).forEach(key => {
        if (merged[key] === undefined) {
          delete merged[key];
        }
      });

      return merged;
    };

    // Helper function to handle style inheritance for children
    const applyChildStyles = (parentId, parentStyles, children, config) => {
      const currentElements = elementsRef.current;
      const parent = currentElements.find(el => el.id === parentId);
      if (!parent?.children) return;

      parent.children.forEach((childId, index) => {
        const child = currentElements.find(el => el.id === childId);
        const childConfig = config?.children?.[index];
        
        if (child && childConfig) {
          const baseStyles = {
            color: parentStyles?.color || config?.styles?.color
          };

          const mergedStyles = mergeStyles(
            baseStyles,
            child.styles,
            childConfig.styles
          );

          updateStyles(childId, mergedStyles);
        }
      });
    };

    switch (command.action) {
      case 'add': {
        // Handle structured elements (navbar, footer)
        if ((command.elementType === 'navbar' || command.elementType === 'footer') && command.properties?.configuration) {
          const structureConfig = structureConfigurations[command.properties.configuration];
          if (!structureConfig) {
            return;
          }

          const newId = addNewElement(
            command.elementType,
            1,
            command.position?.index || 0,
            command.position?.parentId || null,
            command.properties
          );

          // Apply parent styles
          const baseStyles = mergeStyles(
            structureConfig.styles,
            {},
            command.properties.styles
          );
          updateStyles(newId, baseStyles);

          // Apply child styles
          applyChildStyles(newId, baseStyles, structureConfig.children, structureConfig);
          
          return newId;
        }

        // Handle other elements
          const newId = addNewElement(
            command.elementType,
            1,
            command.position?.index || 0,
            command.position?.parentId || null,
          command.properties
          );

          if (command.properties?.styles) {
            updateStyles(newId, command.properties.styles);
          }

          return newId;
      }

      case 'edit': {
        const { children: childEdits, styles, ...otherProps } = command.properties || {};
        const targetElement = elementsRef.current.find(el => el.id === command.targetId);

        if (!targetElement) {
          return null;
        }

        // Batch all mutations into a single history entry
        recordElementsUpdate((prev) => {
          let updated = [...prev];

          // Apply element properties
          if (Object.keys(otherProps).length > 0) {
            updated = updated.map(el =>
              el.id === command.targetId ? { ...el, ...otherProps } : el
            );
          }

          // Apply styles to target
          if (styles) {
            const structureConfig = targetElement.configuration ?
              structureConfigurations[targetElement.configuration] : null;

            const mergedStyles = mergeStyles(
              structureConfig?.styles || {},
              targetElement.styles,
              styles
            );

            updated = updated.map(el =>
              el.id === command.targetId ? { ...el, styles: mergedStyles } : el
            );

            // Apply child styles if structured element
            if (structureConfig && targetElement.children) {
              targetElement.children.forEach((childId, index) => {
                const child = prev.find(el => el.id === childId);
                const childConfig = structureConfig.children?.[index];
                if (child && childConfig) {
                  const baseStyles = {
                    color: mergedStyles?.color || structureConfig.styles?.color
                  };
                  const childMergedStyles = mergeStyles(baseStyles, child.styles, childConfig.styles);
                  updated = updated.map(el =>
                    el.id === childId ? { ...el, styles: childMergedStyles } : el
                  );
                }
              });
            }
          }

          // Handle child updates
          if (childEdits && targetElement.children) {
            childEdits.forEach((childEdit, index) => {
              if (!childEdit?.type) return;
              const childId = targetElement.children[index];
              if (!childId) return;
              const child = prev.find(el => el.id === childId);
              if (!child) return;

              const mutations = {};
              if (childEdit.content !== undefined) {
                mutations.content = childEdit.content;
              }
              if (childEdit.styles) {
                const structureConfig = targetElement.configuration ?
                  structureConfigurations[targetElement.configuration] : null;
                const childConfig = structureConfig?.children?.[index];
                mutations.styles = mergeStyles(
                  childConfig?.styles || {},
                  child.styles,
                  childEdit.styles
                );
              }

              if (Object.keys(mutations).length > 0) {
                updated = updated.map(el =>
                  el.id === childId ? { ...el, ...mutations } : el
                );
              }
            });
          }

          return updated;
        });
        return command.targetId;
      }

      case 'updateContent':
        updateContent(command.targetId, command.content);
        return command.targetId;

      case 'updateStyles': {
        const targetElement = elementsRef.current.find(el => el.id === command.targetId);
        if (!targetElement) {
          return null;
        }

        const structureConfig = targetElement.configuration ?
          structureConfigurations[targetElement.configuration] : null;

        const mergedStyles = mergeStyles(
          structureConfig?.styles || {},
          targetElement.styles,
          command.styles
        );

        updateStyles(command.targetId, mergedStyles);
        return command.targetId;
      }

      case 'delete':
        handleRemoveElement(command.targetId);
        return command.targetId;

      case 'move':
        moveElement(command.targetId, command.newIndex, command.newParentId);
        return command.targetId;

      default:
        return null;
    }
  }, [addNewElement, updateStyles, updateContent, updateElementProperties, handleRemoveElement, moveElement]);

  // Memoize context value after all state and functions are defined
  const contextValue = useMemo(() => ({
    elements,
    setElements: recordElementsUpdate,
    selectedElement,
    setSelectedElement: selectElement,
    addNewElement,
    updateContent,
    updateStyles,
    updateElementProperties,
    updateConfiguration,
    handleRemoveElement,
    moveElement,
    undo,
    redo,
    forceBorder,
    setForceBorder,
    selectedStyle,
    setSelectedStyle,
    handleAICommand,
    saveSectionToLocalStorage,
    loadSectionFromLocalStorage,
    findElementById,
    generateUniqueId,
    copiedElement,
    copyElement,
    pasteElement,
    styleEditingMode,
    setStyleEditingMode,
    updateStateStyles,
    activeBreakpoint,
    setActiveBreakpoint,
  }), [
    elements,
    selectedElement,
    forceBorder,
    selectedStyle,
    recordElementsUpdate,
    selectElement,
    addNewElement,
    updateContent,
    updateStyles,
    updateElementProperties,
    updateConfiguration,
    handleRemoveElement,
    moveElement,
    undo,
    redo,
    handleAICommand,
    saveSectionToLocalStorage,
    loadSectionFromLocalStorage,
    findElementById,
    copiedElement,
    copyElement,
    pasteElement,
    styleEditingMode,
    updateStateStyles,
    activeBreakpoint,
  ]);

  // Set elements version on mount
  useEffect(() => {
    localStorage.setItem('elementsVersion', ELEMENTS_VERSION);
  }, []);

  return (
    <EditableContext.Provider value={contextValue}>
      {children}
    </EditableContext.Provider>
  );
};
