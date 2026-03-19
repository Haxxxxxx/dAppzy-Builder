// src/context/EditableContext.js

import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import {
  generateUniqueId,
  removeElementRecursively,
} from '../utils/LeftBarUtils/elementUtils';
import { structureConfigurations } from '../configs/structureConfigurations';
import { mergeStyles as sharedMergeStyles } from '../core/configs/elementConfigs';
import { useToast } from './ToastContext';

export const EditableContext = createContext();

export const EditableProvider = ({ children, userId }) => {
  const { showToast } = useToast();

  // Initialize state first
  const [elements, setElements] = useState([]); // Start with empty array instead of loading from localStorage

  // ── Multi-page state ──
  const [pages, setPages] = useState([
    { id: 'page-home', name: 'Home', slug: '/', elements: [] }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const activePageIndexRef = useRef(activePageIndex);
  activePageIndexRef.current = activePageIndex;

  const [_selectedRef, _setSelectedRef] = useState(null);
  const [history, setHistory] = useState([{ elements: [], selectedElement: null }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedElement, setCopiedElement] = useState(null);
  const [copiedStyles, setCopiedStyles] = useState(null);
  const [styleEditingMode, setStyleEditingMode] = useState('normal'); // 'normal' | 'hover' | 'focus'
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [selectedElementIds, setSelectedElementIds] = useState([]); // Multi-select foundation
  const [previewMode, setPreviewMode] = useState(false);

  // ── Multi-page operations ──
  // Sync current elements into the active page's slot whenever elements change.
  // This keeps pages[activePageIndex].elements always in sync without requiring
  // every element mutation to be aware of pages.
  const syncElementsToActivePage = useCallback((currentElements) => {
    setPages(prev => {
      const idx = activePageIndexRef.current;
      if (prev[idx] && prev[idx].elements !== currentElements) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], elements: currentElements };
        return updated;
      }
      return prev;
    });
  }, []);

  // Add a new page with the given name and slug
  const addPage = useCallback((name, slug) => {
    const pageId = `page-${Date.now()}`;
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    setPages(prev => [
      ...prev,
      { id: pageId, name, slug: normalizedSlug, elements: [] }
    ]);
    return pageId;
  }, []);

  // Remove a page by its ID (cannot remove the last page)
  const removePage = useCallback((pageId) => {
    setPages(prevPages => {
      if (prevPages.length <= 1) return prevPages; // can't remove last page
      const removeIndex = prevPages.findIndex(p => p.id === pageId);
      if (removeIndex === -1) return prevPages;
      const updated = prevPages.filter(p => p.id !== pageId);
      // If we removed the active page, switch to the previous page (or first)
      if (removeIndex === activePageIndexRef.current) {
        const newIndex = Math.min(removeIndex, updated.length - 1);
        setActivePageIndex(newIndex);
        setElements(updated[newIndex].elements);
        // Clear selection when switching pages
        _setSelectedRef(null);
        setSelectedElementIds([]);
        // Reset history for the new page
        setHistory([{ elements: updated[newIndex].elements }]);
        setCurrentIndex(0);
      } else if (removeIndex < activePageIndexRef.current) {
        // Shift active index down since a page before it was removed
        setActivePageIndex(idx => idx - 1);
      }
      return updated;
    });
  }, []);

  // Rename a page (update name and/or slug)
  const renamePage = useCallback((pageId, name, slug) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (slug !== undefined) updates.slug = slug.startsWith('/') ? slug : `/${slug}`;
      return { ...p, ...updates };
    }));
  }, []);

  // Switch to a different page by index.
  // Saves current elements into current page, loads the new page's elements.
  const switchPage = useCallback((newIndex) => {
    if (newIndex === activePageIndexRef.current) return;
    setPages(prevPages => {
      if (newIndex < 0 || newIndex >= prevPages.length) return prevPages;
      const currentIdx = activePageIndexRef.current;
      const updated = [...prevPages];
      // Save current elements into the current page
      updated[currentIdx] = { ...updated[currentIdx], elements: elementsRef.current };
      // Load elements from the target page
      const targetPage = updated[newIndex];
      setElements(targetPage.elements || []);
      setActivePageIndex(newIndex);
      // Clear selection and reset history for the new page
      _setSelectedRef(null);
      setSelectedElementIds([]);
      setHistory([{ elements: targetPage.elements || [] }]);
      setCurrentIndex(0);
      return updated;
    });
  }, []);

  // Wrap _setSelectedRef to reset style editing mode and clear multi-select
  const selectElement = useCallback((el) => {
    _setSelectedRef(el);
    setSelectedElementIds(el ? [el.id] : []);
    setStyleEditingMode('normal');
  }, []);

  // Toggle an element in the multi-selection set (for Shift+Click)
  const toggleElementSelection = useCallback((id) => {
    setSelectedElementIds(prev => {
      if (prev.includes(id)) {
        const updated = prev.filter(eid => eid !== id);
        // If we deselected the current selectedElement, update it
        if (updated.length > 0) {
          const lastId = updated[updated.length - 1];
          const el = elementsRef.current.find(e => e.id === lastId);
          if (el) _setSelectedRef({ id: el.id, type: el.type });
        } else {
          _setSelectedRef(null);
        }
        return updated;
      }
      const updated = [...prev, id];
      const el = elementsRef.current.find(e => e.id === id);
      if (el) _setSelectedRef({ id: el.id, type: el.type });
      return updated;
    });
  }, []);

  // Clear all selection
  const clearSelection = useCallback(() => {
    _setSelectedRef(null);
    setSelectedElementIds([]);
    setStyleEditingMode('normal');
  }, []);

  // Keep a ref to elements for use in handlers that need fresh state mid-execution
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  // O(1) lookup map — avoids O(n) .find() calls in render paths and callbacks
  const elementsMap = useMemo(() => new Map(elements.map(el => [el.id, el])), [elements]);

  // Derive a live selectedElement that always has fresh styles/content from the elements array.
  // Editors read selectedElement.styles — this ensures they see the latest values.
  // Dep on the specific element reference (not entire map) so we only re-derive when
  // the selected element itself changes, not on every unrelated element update.
  const _liveElement = _selectedRef?.id ? elementsMap.get(_selectedRef.id) : undefined;
  const selectedElement = useMemo(() => {
    if (!_selectedRef?.id) return null;
    if (!_liveElement) return _selectedRef; // element was deleted — keep ref until cleared
    let merged = { ..._selectedRef, ..._liveElement };

    // When viewing a non-desktop breakpoint, layer breakpoint overrides on top
    // of base styles so editors see (and populate their fields from) the
    // effective values for the active breakpoint.
    if (activeBreakpoint !== 'desktop' && merged.breakpointStyles?.[activeBreakpoint]) {
      merged = { ...merged, styles: { ...(merged.styles || {}), ...merged.breakpointStyles[activeBreakpoint] } };
    }

    // When editing hover/focus state, expose those styles as .styles so editors
    // read/write the correct values without needing individual changes.
    if (styleEditingMode === 'hover' && merged.hoverStyles) {
      return { ...merged, styles: { ...(merged.styles || {}), ...merged.hoverStyles } };
    }
    if (styleEditingMode === 'focus' && merged.focusStyles) {
      return { ...merged, styles: { ...(merged.styles || {}), ...merged.focusStyles } };
    }
    return merged;
  }, [_selectedRef, _liveElement, styleEditingMode, activeBreakpoint]);

  // Define findElementById function — uses Map for O(1) when searching current elements.
  // Uses elementsRef instead of closing over `elements` so this callback doesn't get
  // recreated on every elements change (which would cascade to updateStyles, handleAICommand,
  // and the entire contextValue).
  const findElementById = useCallback((id, elementsList) => {
    if (!elementsList || elementsList === elementsRef.current) return elementsMap.get(id) || null;
    return elementsList.find(el => el.id === id) || null;
  }, [elementsMap]);

  const MAX_HISTORY = 50;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Uses functional setHistory to avoid stale closure over history/currentIndex.
  // Only creates a new history entry if elements actually changed (prevents bloat
  // from selection-only changes eating into the 50-entry undo depth).
  const pushToHistory = useCallback((newElements) => {
    setHistory((prev) => {
      const currentEntry = prev[currentIndexRef.current];
      // Skip if elements haven't changed (same reference = no mutation)
      if (currentEntry && currentEntry.elements === newElements) {
        return prev;
      }
      const truncated = prev.slice(0, currentIndexRef.current + 1);
      const updated = [...truncated, { elements: newElements }];
      // Cap history to prevent unbounded growth
      if (updated.length > MAX_HISTORY) {
        const trimmed = updated.slice(updated.length - MAX_HISTORY);
        setCurrentIndex(trimmed.length - 1);
        return trimmed;
      }
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }, []);

  // Reset history to contain only the given elements snapshot.
  // Used after loading a project to avoid an empty undo snapshot.
  const resetHistory = useCallback((loadedElements) => {
    setHistory([{ elements: loadedElements }]);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
  }, []);

  const recordElementsUpdate = useCallback((updater) => {
    setElements((prev) => {
      const newElements = typeof updater === 'function' ? updater(prev) : updater;
      pushToHistory(newElements);
      // Keep the active page's elements in sync
      syncElementsToActivePage(newElements);
      return newElements;
    });
  }, [pushToHistory, syncElementsToActivePage]);

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

    const childConfigs = config?.children || [];

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
        newElements = [...prev, ...allElements].map(el => {
          if (el.id === parentId) {
            const updatedChildren = [...(el.children || [])];
            // Insert at the specified index instead of always appending
            const insertAt = Math.min(index || updatedChildren.length, updatedChildren.length);
            updatedChildren.splice(insertAt, 0, newId);
            return { ...el, children: updatedChildren };
          }
          return el;
        });
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
          // Add to new parent's children (dedupe to prevent duplicates)
          if (el.id === newParentId && el.children) {
            const filtered = el.children.filter(cid => cid !== id);
            return { ...el, children: [...filtered, id] };
          }
          return el;
        });
      }

      return newElements;
    });
  }, [recordElementsUpdate]);

  const handleRemoveElement = useCallback((id) => {
    _setSelectedRef(null);
    setSelectedElementIds(prev => prev.filter(eid => eid !== id));
    recordElementsUpdate((prevElements) => removeElementRecursively(id, prevElements));
  }, [recordElementsUpdate]);

  const updateContent = useCallback((id, content) => {
    recordElementsUpdate((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  }, [recordElementsUpdate]);

  const updateStyles = useCallback((id, newStyles) => {
    // When editing hover/focus state, route to the correct state key
    if (styleEditingMode !== 'normal') {
      const stateKey = styleEditingMode === 'hover' ? 'hoverStyles' : 'focusStyles';
      recordElementsUpdate(prev =>
        prev.map(el =>
          el.id === id
            ? { ...el, [stateKey]: { ...(el[stateKey] || {}), ...newStyles } }
            : el
        )
      );
      return;
    }

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

      // Merge styles: existing user styles + new overrides.
      const mergedStyles = {
        ...(element.styles || {}),
        ...newStyles,
      };

      return prev.map(el =>
        el.id === id
          ? { ...el, styles: mergedStyles }
          : el
      );
    });
  }, [findElementById, recordElementsUpdate, activeBreakpoint, styleEditingMode]);

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
      // Clear selection to prevent ghost references to deleted elements
      _setSelectedRef(null);
      setSelectedElementIds([]);
      showToast('Undo', 'info', 1500);
    }
  }, [currentIndex, history, showToast]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const snapshot = history[newIndex];
      const restoredElements = snapshot.elements || snapshot;
      setElements(restoredElements);
      // Clear selection to prevent ghost references to deleted elements
      _setSelectedRef(null);
      setSelectedElementIds([]);
      showToast('Redo', 'info', 1500);
    }
  }, [currentIndex, history, showToast]);

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

    const configTree = buildConfigTree(root);
    setCopiedElement(configTree);

    // Also write to system clipboard for cross-project paste
    if (navigator.clipboard?.writeText) {
      const payload = JSON.stringify({ __dappzyElement: true, ...configTree });
      navigator.clipboard.writeText(payload).catch(() => {
        // Clipboard write failed (permissions / insecure context) — in-memory copy still works
      });
    }
  }, []);

  const pasteElement = useCallback((parentId, index) => {
    // Helper to perform the actual paste from a config object
    const doPaste = (config) => {
      addNewElement(config.type, config.level || 0, index, parentId, config);
    };

    // Try reading from system clipboard first (enables cross-project paste)
    if (navigator.clipboard?.readText) {
      navigator.clipboard.readText().then((text) => {
        try {
          const parsed = JSON.parse(text);
          if (parsed && parsed.__dappzyElement && parsed.type) {
            // Valid dAppzy element from clipboard — strip the marker and paste
            const { __dappzyElement, ...config } = parsed;
            doPaste(config);
            return;
          }
        } catch {
          // Not valid JSON or not a dAppzy element — fall through
        }
        // Clipboard didn't contain a valid element — fall back to in-memory
        if (copiedElement) {
          doPaste(copiedElement);
        }
      }).catch(() => {
        // Clipboard read failed — fall back to in-memory
        if (copiedElement) {
          doPaste(copiedElement);
        }
      });
    } else {
      // Clipboard API unavailable — use in-memory
      if (copiedElement) {
        doPaste(copiedElement);
      }
    }
  }, [copiedElement, addNewElement]);

  const copyStyles = useCallback((elementId) => {
    const element = elementsRef.current.find(el => el.id === elementId);
    if (!element) return;
    setCopiedStyles({ ...(element.styles || {}) });
  }, []);

  const pasteStyles = useCallback((elementId) => {
    if (!copiedStyles) return;
    updateStyles(elementId, copiedStyles);
  }, [copiedStyles, updateStyles]);

  // Serialize an element and all its descendants into a portable config tree.
  // Each element in the returned array is self-contained (root + descendants)
  // with IDs stripped so new unique IDs are generated on re-insertion.
  const serializeElementTree = useCallback((rootId) => {
    const allElements = elementsRef.current;
    const root = allElements.find(el => el.id === rootId);
    if (!root) return null;

    const collectDescendants = (id, depth = 0) => {
      if (depth > 20) return [];
      const el = allElements.find(e => e.id === id);
      if (!el) return [];
      const result = [{ ...el }];
      if (el.children && el.children.length > 0) {
        for (const childId of el.children) {
          result.push(...collectDescendants(childId, depth + 1));
        }
      }
      return result;
    };

    return collectDescendants(rootId);
  }, []);

  // Atomic duplicate: builds config tree and pastes in one call, avoiding the
  // stale-closure race condition of calling copyElement + pasteElement sequentially.
  const duplicateElement = useCallback((elementId, parentId, index) => {
    const allElements = elementsRef.current;
    const root = allElements.find(el => el.id === elementId);
    if (!root) return;
    const buildConfigTree = (el, depth = 0) => {
      const { id, ...config } = el;
      if (depth > 20) { config.children = []; return config; }
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
    const config = buildConfigTree(root);
    setCopiedElement(config);
    addNewElement(config.type, config.level || 0, index, parentId, config);
  }, [addNewElement]);

  const handleAICommand = useCallback((command) => {
    if (!command || !command.action) {
      return null;
    }

    // Helper: build a config tree (for duplicate) from a flat element ID
    const buildConfigTreeFromId = (id, depth = 0) => {
      if (depth > 20) return [];
      const el = elementsRef.current.find(e => e.id === id);
      if (!el) return [];
      const { id: _id, ...config } = el;
      config.children = (el.children || [])
        .map(childId => {
          const child = elementsRef.current.find(c => c.id === childId);
          if (!child) return null;
          const { id: _cid, ...childConfig } = child;
          childConfig.children = buildConfigTreeFromId(childId, depth + 1);
          return childConfig;
        })
        .filter(Boolean);
      return config;
    };

    // Use shared mergeStyles from elementConfigs
    const mergeStyles = sharedMergeStyles;

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
        // Handle structured elements (any section type with a configuration)
        if (command.properties?.configuration && structureConfigurations[command.properties.configuration]) {
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

          // Handle child updates (matched by index position)
          if (childEdits && targetElement.children) {
            childEdits.forEach((childEdit, index) => {
              if (!childEdit || typeof childEdit !== 'object') return;
              const childId = targetElement.children[index];
              if (!childId) return;
              const child = prev.find(el => el.id === childId);
              if (!child) return;

              const mutations = {};
              if (childEdit.content !== undefined) {
                mutations.content = childEdit.content;
              }
              if (childEdit.label !== undefined) {
                mutations.label = childEdit.label;
              }
              if (childEdit.settings && typeof childEdit.settings === 'object') {
                mutations.settings = { ...(child.settings || {}), ...childEdit.settings };
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

        // Handle breakpoint-specific styles directly (bypass activeBreakpoint)
        if (command.breakpoint && command.breakpoint !== 'desktop') {
          const bpKey = command.breakpoint; // 'tablet' or 'mobile'
          const existingBp = targetElement.breakpointStyles || {};
          const existingBpStyles = existingBp[bpKey] || {};
          recordElementsUpdate(prev =>
            prev.map(el =>
              el.id === command.targetId
                ? {
                    ...el,
                    breakpointStyles: {
                      ...existingBp,
                      [bpKey]: { ...existingBpStyles, ...command.styles },
                    },
                  }
                : el
            )
          );
          return command.targetId;
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

      case 'updateStateStyles': {
        // Set hover or focus styles on an element
        const target = elementsRef.current.find(el => el.id === command.targetId);
        if (!target) return null;
        const state = command.state || 'hover'; // 'hover' or 'focus'
        updateStateStyles(command.targetId, state, command.styles);
        return command.targetId;
      }

      case 'addChild': {
        // Add a child element (with optional nested children) to an existing parent
        const parentElement = elementsRef.current.find(el => el.id === command.targetId);
        if (!parentElement) return null;

        const childId = addNewElement(
          command.elementType,
          (parentElement.level || 1) + 1,
          command.position?.index ?? (parentElement.children?.length || 0),
          command.targetId,
          command.properties
        );

        // Recursively create nested children if provided
        if (command.properties?.children && Array.isArray(command.properties.children)) {
          command.properties.children.forEach((childConfig, idx) => {
            addNewElement(
              childConfig.type || childConfig.elementType || 'div',
              (parentElement.level || 1) + 2,
              idx,
              childId,
              {
                content: childConfig.content || '',
                styles: childConfig.styles || {},
                ...(childConfig.properties || {}),
              }
            );
          });
        }

        return childId;
      }

      case 'updateSettings': {
        // Update element configuration/settings (e.g., Web3 module settings, form fields)
        const target = elementsRef.current.find(el => el.id === command.targetId);
        if (!target) return null;

        if (command.settings && typeof command.settings === 'object') {
          // Apply each setting individually via updateConfiguration
          // which updates both .configuration and .settings on the element
          Object.entries(command.settings).forEach(([key, value]) => {
            updateConfiguration(command.targetId, key, value);
          });
        }

        // Also support updating content alongside settings
        if (command.content !== undefined) {
          updateContent(command.targetId, command.content);
        }

        return command.targetId;
      }

      case 'delete':
        handleRemoveElement(command.targetId);
        return command.targetId;

      case 'move':
        moveElement(command.targetId, command.newIndex, command.newParentId);
        return command.targetId;

      case 'select': {
        const target = elementsRef.current.find(el => el.id === command.targetId);
        if (target) {
          selectElement(target);
        }
        return command.targetId;
      }

      case 'undo':
        undo();
        return 'undo';

      case 'redo':
        redo();
        return 'redo';

      case 'duplicate': {
        const source = elementsRef.current.find(el => el.id === command.targetId);
        if (!source) return null;

        // Build a deep config tree for duplication (strips IDs, preserves children)
        const configTree = buildConfigTreeFromId(command.targetId);
        const count = command.count || 1;
        let lastId = null;
        const parentId = source.parentId || null;

        for (let i = 0; i < count; i++) {
          const siblings = parentId
            ? (elementsRef.current.find(el => el.id === parentId)?.children || [])
            : elementsRef.current.filter(el => !el.parentId).map(el => el.id);
          const sourceIndex = siblings.indexOf(command.targetId);
          lastId = addNewElement(
            source.type,
            source.level || 1,
            sourceIndex + 1 + i,
            parentId,
            configTree
          );
        }
        return lastId;
      }

      case 'batchUpdateStyles': {
        const ids = command.targetIds;
        if (!Array.isArray(ids) || ids.length === 0) return null;

        recordElementsUpdate(prev => {
          let updated = [...prev];
          for (const id of ids) {
            const el = updated.find(e => e.id === id);
            if (!el) continue;

            if (command.breakpoint && command.breakpoint !== 'desktop') {
              const bpKey = command.breakpoint;
              const existingBp = el.breakpointStyles || {};
              const existingBpStyles = existingBp[bpKey] || {};
              updated = updated.map(e =>
                e.id === id
                  ? { ...e, breakpointStyles: { ...existingBp, [bpKey]: { ...existingBpStyles, ...command.styles } } }
                  : e
              );
            } else {
              updated = updated.map(e =>
                e.id === id
                  ? { ...e, styles: { ...(e.styles || {}), ...command.styles } }
                  : e
              );
            }
          }
          return updated;
        });
        return ids;
      }

      case 'find': {
        // Search elements by type, content, or styles — returns matching IDs
        const results = elementsRef.current.filter(el => {
          if (command.elementType && el.type !== command.elementType) return false;
          if (command.contentContains && typeof el.content === 'string') {
            if (!el.content.toLowerCase().includes(command.contentContains.toLowerCase())) return false;
          } else if (command.contentContains) {
            return false;
          }
          if (command.hasStyle) {
            const styleKey = Object.keys(command.hasStyle)[0];
            if (!styleKey || el.styles?.[styleKey] !== command.hasStyle[styleKey]) return false;
          }
          if (command.parentId && el.parentId !== command.parentId) return false;
          return true;
        });
        return results.map(el => ({ id: el.id, type: el.type, content: typeof el.content === 'string' ? el.content.slice(0, 50) : '' }));
      }

      default:
        return null;
    }
  }, [addNewElement, updateStyles, updateContent, updateElementProperties, updateConfiguration, updateStateStyles, recordElementsUpdate, handleRemoveElement, moveElement, selectElement, undo, redo, copyElement]);

  // Memoize context value after all state and functions are defined
  const contextValue = useMemo(() => ({
    elements,
    elementsMap,
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
    handleAICommand,
    findElementById,
    generateUniqueId,
    copiedElement,
    copyElement,
    pasteElement,
    duplicateElement,
    serializeElementTree,
    copiedStyles,
    copyStyles,
    pasteStyles,
    styleEditingMode,
    setStyleEditingMode,
    updateStateStyles,
    activeBreakpoint,
    setActiveBreakpoint,
    selectedElementIds,
    toggleElementSelection,
    clearSelection,
    previewMode,
    setPreviewMode,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    // ── Multi-page ──
    pages,
    setPages,
    activePageIndex,
    addPage,
    removePage,
    renamePage,
    switchPage,
    resetHistory,
  }), [
    elements,
    elementsMap,
    selectedElement,
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
    findElementById,
    copiedElement,
    copyElement,
    pasteElement,
    duplicateElement,
    serializeElementTree,
    copiedStyles,
    copyStyles,
    pasteStyles,
    styleEditingMode,
    updateStateStyles,
    activeBreakpoint,
    selectedElementIds,
    toggleElementSelection,
    clearSelection,
    previewMode,
    currentIndex,
    // ── Multi-page deps ──
    pages,
    activePageIndex,
    addPage,
    removePage,
    renamePage,
    switchPage,
    resetHistory,
    // Use history.length (not the full array) so context only re-renders when
    // the number of snapshots changes — not on every edit that pushes a snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    history.length,
  ]);

  return (
    <EditableContext.Provider value={contextValue}>
      {children}
    </EditableContext.Provider>
  );
};
