import React, { useContext, useEffect, useRef, forwardRef, useCallback, useState, useMemo } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../context/EditableContext';
import { AutoSaveContext } from '../context/AutoSaveContext';
import UnifiedDropZone from '../utils/UnifiedDropZone';
import DropZoneErrorBoundary from '../utils/DropZoneErrorBoundary';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';
import LayoutReplacementBoundary from './LayoutReplacementBoundary';
import { SECTION_TYPES } from '../core/elementRegistry';
import { buildSectionTree } from '../utils/sectionFactory';
import { BUTTON, IMAGE, VFLEX, GRID_LAYOUT } from '../constants/elementTypes';
import AlignmentGuides from './AlignmentGuides';

const DEVICE_LABELS = {
  375: 'Phone (375px)',
  768: 'Tablet (768px)',
  1200: 'Laptop (1200px)',
  1440: 'Desktop (1440px)',
};

function getDeviceClass(width) {
  if (width === 375) return 'device-frame-phone';
  if (width === 768) return 'device-frame-tablet';
  return '';
}

/** Small "+" button rendered between root elements.
 *  Appears on hover and opens the sidebar element panel when clicked. */
const QuickAddButton = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="quick-add-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '20px',
        position: 'relative',
        zIndex: 10,
        cursor: 'pointer',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Horizontal line */}
      <div
        style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          height: '1px',
          background: hovered ? 'var(--purple, #5C4EFA)' : 'transparent',
          transition: 'background 0.2s ease',
        }}
      />
      {/* Plus icon */}
      <div
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: hovered ? 'var(--purple, #5C4EFA)' : 'transparent',
          color: hovered ? '#fff' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 1,
          transition: 'all 0.2s ease',
          position: 'relative',
          zIndex: 1,
          userSelect: 'none',
        }}
      >
        +
      </div>
    </div>
  );
};

const ContentList = forwardRef(
  (
    {
      contentListWidth,
      canvasWidth,
      scale,
      setScale,
      isPreviewMode,
      handleOpenMediaPanel = () => { },
      isSideBarVisible,
      handlePanelToggle,
      websiteSettings,
    },
    ref
  ) => {
    const {
      elements,
      addNewElement,
      moveElement,
      setSelectedElement,
      setElements,
      selectedElement,
      activeBreakpoint,
      pages,
    } = useContext(EditableContext);

    const { saveContent, markPendingChanges } = useContext(AutoSaveContext);

    // Skip auto-save for the initial load from Firestore
    const isInitialLoadRef = useRef(true);

    // Watch for changes in elements and trigger auto-save
    // AutoSaveContext handles its own debouncing — no need for a second debounce here
    useEffect(() => {
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        return;
      }
      if (elements.length > 0) {
        markPendingChanges();
        saveContent(elements, websiteSettings, pages);
      }
    }, [elements, websiteSettings, pages, markPendingChanges, saveContent]);

    // Use useDragLayer to determine if any drag is active.
    const { isDragging } = useDragLayer((monitor) => ({
      isDragging: monitor.getItem() !== null,
    }));

    // Calculate scaling based on canvas and content list widths.
    const calculateScale = () => {
      if (canvasWidth && contentListWidth) {
        const newScale = canvasWidth / contentListWidth;
        setScale(newScale < 1 ? newScale : 1);
      }
    };

    useEffect(() => {
      calculateScale();
    }, [contentListWidth, canvasWidth]);

    // Helper function to recursively create flex elements
    function createFlexElement(config, addNewElement, parentId = null) {
      const id = addNewElement(config.parentType || config.type, 1, 0, parentId, {
        styles: { gap: '12px', padding: '12px', display: 'flex', flexDirection: config.direction }
      });
      if (config.children && config.children.length > 0) {
        config.children.forEach(child => {
          if (child.children) {
            createFlexElement({ ...child, parentType: child.type, direction: child.type === VFLEX ? 'column' : 'row' }, addNewElement, id);
          } else {
            addNewElement(child.type, 1, 0, id, {
              styles: { flex: 1, gap: '8px', padding: '8px', display: 'flex', flexDirection: child.type === VFLEX ? 'column' : 'row' }
            });
          }
        });
      }
      return id;
    }

    // Get root-level elements only — useMemo so the filtered array is computed
    // once per elements change, not on every render or every call site.
    const rootElements = useMemo(() => elements.filter(el => !el.parentId), [elements]);
    // Keep callback form for places that expect a function (replaceLayout dep)
    const getRootElements = useCallback(() => rootElements, [rootElements]);

    // Simplified replaceLayout function that just reorders elements
    const replaceLayout = useCallback((oldLayoutId, newLayoutConfig, position) => {
      // Find the old layout
      const oldLayout = elements.find(el => el.id === oldLayoutId);
      if (!oldLayout) {
        return null;
      }

      // Get root elements and their indices
      const rootElements = getRootElements();
      const rootElementIds = rootElements.map(el => el.id);
      
      // Get source and target indices in the root elements array
      const sourceIndex = rootElementIds.indexOf(oldLayoutId);
      
      // Find the target element by ID instead of index (use root elements for index fallback)
      const targetId = newLayoutConfig.targetId || rootElements[newLayoutConfig.targetIndex]?.id;
      const targetIndex = rootElementIds.indexOf(targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return null;
      }

      // Calculate the final position based on the drop edge
      let finalIndex = targetIndex;
      switch (position?.edge) {
        case 'top':
          finalIndex = targetIndex;
          break;
        case 'bottom':
          finalIndex = targetIndex + 1;
          break;
        case 'left':
          finalIndex = targetIndex;
          break;
        case 'right':
          finalIndex = targetIndex + 1;
          break;
        default:
          finalIndex = targetIndex;
      }

      // Ensure the index is within bounds
      finalIndex = Math.max(0, Math.min(finalIndex, rootElements.length));

      // Reorder elements
      setElements(prevElements => {
        // Create a map of parent IDs to their children
        const childrenMap = new Map();
        prevElements.forEach(el => {
          if (el.parentId) {
            if (!childrenMap.has(el.parentId)) {
              childrenMap.set(el.parentId, []);
            }
            childrenMap.get(el.parentId).push({...el});
          }
        });

        // Get root elements in their current order
        const currentRootElements = prevElements.filter(el => !el.parentId);
        
        // Create a copy of root elements and perform the move
        const reorderedRootElements = [...currentRootElements];
        const [movedElement] = reorderedRootElements.splice(sourceIndex, 1);
        const adjustedFinalIndex = finalIndex > sourceIndex ? finalIndex - 1 : finalIndex;
        reorderedRootElements.splice(adjustedFinalIndex, 0, movedElement);

        // Build the final array preserving all elements
        const updatedElements = [];
        
        // Add root elements in their new order with updated indices
        reorderedRootElements.forEach((root, index) => {
          // Add the root element with its updated index
          const rootElement = {
            ...root,
            index
          };
          updatedElements.push(rootElement);

          // Add all children of this root element (if any)
          const children = childrenMap.get(root.id) || [];
          children.forEach(child => {
            // Preserve all child properties while ensuring parentId is maintained
            updatedElements.push({
              ...child,
              parentId: root.id
            });
          });
        });

        // Add any remaining elements that might not be directly under reordered roots
        prevElements.forEach(el => {
          if (el.parentId && !updatedElements.find(updated => updated.id === el.id)) {
            updatedElements.push({...el});
          }
        });

        return updatedElements;
      });

      return oldLayoutId;
    }, [elements, getRootElements, setElements]);

    // Enhanced layout replacement handler
    const handleLayoutReplace = useCallback(({ oldLayoutId, sourceIndex, targetIndex, newLayout, position }) => {
      const resultId = replaceLayout(oldLayoutId, {
        ...newLayout,
        sourceIndex,
        targetIndex,
        targetId: newLayout.id
      }, position);

      if (resultId) {
        setSelectedElement({ id: resultId, type: newLayout.type });
      }
    }, [replaceLayout, setSelectedElement]);

    // Enhanced wrapWithBoundary function
    const wrapWithBoundary = (element, renderedElement, index) => {
      const isLayout = SECTION_TYPES.has(element.type);

      if (!isLayout) return renderedElement;

      const layoutData = {
        type: element.type,
        configuration: element.configuration,
        structure: element.structure,
        styles: element.styles,
        settings: element.settings,
        label: element.label,
        children: element.children
      };

      return (
        <LayoutReplacementBoundary
          key={element.id}
          layoutId={element.id}
          layoutType={element.type}
          layoutData={layoutData}
          elementIndex={index}
          onReplace={handleLayoutReplace}
          isPreviewMode={isPreviewMode}
        >
          {renderedElement}
        </LayoutReplacementBoundary>
      );
    };

    // Enhanced handleDrop function
    const handleDrop = useCallback((item, index) => {
      if (!item) return;

      // Handle layout replacement from drag and drop
      if (item.type && SECTION_TYPES.has(item.type)) {
        const layoutData = {
          type: item.type,
          configuration: item.configuration,
          structure: item.structure,
          styles: item.styles,
          settings: item.settings,
          label: item.label
        };

        // Set the layout data in dataTransfer
        if (item.dataTransfer) {
          try {
            item.dataTransfer.setData('application/layout-data', JSON.stringify(layoutData));
          } catch (err) {
            if (import.meta.env.DEV) console.error('[ContentList] Failed to set layout drag data:', err);
          }
        }
      }

      // Handle layout replacement
      if (item.isLayoutReplacement && item.targetLayoutId) {
        const newId = replaceLayout(item.targetLayoutId, item, item.position);
        if (newId) {
          setSelectedElement({ id: newId, type: item.type });
        }
        return;
      }

      // Handle flex config drop
      if (item.isFlexConfig && item.flexConfig) {
        createFlexElement(item.flexConfig, addNewElement, item.parentId || null);
        return;
      }

      // Handle saved block drop — recreate element tree with new IDs
      if (item.type === 'savedBlock' && item.blockElements) {
        const blockEls = item.blockElements;
        const rootEl = blockEls.find(el => !el.parentId || !blockEls.some(b => b.id === el.parentId));
        if (!rootEl) return;

        // Build a nested config tree from the flat block array (strips IDs)
        const buildBlockConfig = (el, depth = 0) => {
          if (depth > 20) return { type: el.type, styles: el.styles || {}, content: el.content || '', children: [] };
          const config = { ...el };
          delete config.id;
          delete config.parentId;
          if (el.children && el.children.length > 0) {
            config.children = el.children
              .map(childId => blockEls.find(b => b.id === childId))
              .filter(Boolean)
              .map(child => buildBlockConfig(child, depth + 1));
          } else {
            config.children = [];
          }
          return config;
        };

        const config = buildBlockConfig(rootEl);
        const newId = addNewElement(config.type, 1, index, null, config);
        if (newId) {
          setSelectedElement({ id: newId, type: config.type });
        }
        return;
      }

      if (item.id) {
        // If the item has an id, it's an existing element being moved
        moveElement(item.id, index);
        setSelectedElement({ id: item.id, type: item.type });
      } else if (item.type) {
        // If it's a new element being added
        let newId;
        if (item.type === BUTTON || item.type === IMAGE) {
          newId = addNewElement(item.type, 1, index);
        } else if (SECTION_TYPES.has(item.type)) {
          // Unified section creation — all section types (hero, CTA, navbar,
          // footer, ContentSection, defi, minting) flow through buildSectionTree.
          // Configs define nested children trees with optional idSuffix for
          // deterministic container IDs that match what section components expect.
          const { elements: sectionElements, rootId } = buildSectionTree(item);
          setElements(prev => {
            const newIds = new Set(sectionElements.map(el => el.id));
            const filtered = prev.filter(el => !newIds.has(el.id));
            return [...filtered, ...sectionElements];
          });
          newId = rootId;
        } else {
          // Handle all non-section elements (basic, layout, media, form, web3 modules, etc.)
          // Check if we're dropping onto a section container
          const targetElement = elements[index];
          if (targetElement && SECTION_TYPES.has(targetElement.type)) {
            // Add the element as a child of the section
            newId = addNewElement(item.type, 1, null, targetElement.id, {
              type: item.type,
              content: item.content || '',
              styles: item.styles || {},
              configuration: item.configuration || null,
              isConfigured: true
            });
          } else {
            // Add as a standalone element with full config preservation
            newId = addNewElement(item.type, 1, index, null, {
              type: item.type,
              content: item.content || '',
              styles: {
                ...item.styles,
                display: item.type === GRID_LAYOUT ? 'grid' : item.styles?.display,
                gridTemplateColumns: item.type === GRID_LAYOUT ? 'repeat(4, 1fr)' : item.styles?.gridTemplateColumns,
                gap: item.styles?.gap,
              },
              configuration: item.configuration || null,
              settings: item.settings || null,
              children: item.children || [],
            });
          }
        }
        if (newId) {
          setSelectedElement({ id: newId, type: item.type, structure: item.structure });
        }
      }
    }, [elements, addNewElement, moveElement, setSelectedElement, setElements, replaceLayout, getRootElements]);

    const deviceClass = getDeviceClass(contentListWidth);
    const deviceLabel = DEVICE_LABELS[contentListWidth];

    return (
      <div className={`device-frame-wrapper ${deviceClass}`}>
        {deviceLabel && (
          <div className="device-label">{deviceLabel}</div>
        )}
      <div
        ref={ref}
        className="content-list"
        style={{
          width: `${contentListWidth}px`,
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          transition: 'transform 0.15s ease',
          willChange: 'transform',
          margin: scale < 1 ? '0 auto' : '0',
          marginBottom: '30px',
          position: 'relative',
          minHeight: elements.length === 0 ? '500px' : '100vh',
        }}
        onClick={(e) => {
          if (e.target === ref.current) {
            setSelectedElement(null);
          }
        }}
        onDragOver={(e) => {
          // Accept native drags (element reordering from useReorderDrop) at the canvas root.
          // Only react when the drop target is the content-list itself, not a child.
          if (e.target === ref.current || e.currentTarget === ref.current) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
        }}
        onDrop={(e) => {
          // Handle elements dragged out of a section onto the canvas root.
          // useReorderDrop stores the element ID as text/plain.
          const elementId = e.dataTransfer.getData('text/plain');
          if (!elementId) return;

          // Don't handle section-level drags (those have application/json)
          if (e.dataTransfer.types.includes('application/json')) return;

          e.preventDefault();
          e.stopPropagation();

          // Find the element and its parent
          const draggedElement = elements.find(el => el.id === elementId);
          if (!draggedElement) return;

          const sourceContainer = elements.find(el =>
            Array.isArray(el.children) && el.children.includes(elementId)
          );
          if (!sourceContainer) return;

          // Remove from source container and promote to root level
          setElements(prev => prev.map(el => {
            if (el.id === sourceContainer.id) {
              return { ...el, children: el.children.filter(c => c !== elementId) };
            }
            if (el.id === elementId) {
              return { ...el, parentId: null };
            }
            return el;
          }));
        }}
      >
        {!isPreviewMode && elements.length === 0 ? (
          <DropZoneErrorBoundary>
            <UnifiedDropZone
              index={0}
              onDrop={(item) => handleDrop(item, 0)}
              text="Add layout"
              className="first-dropzone"
              scale={scale}
              isDragging={isDragging}
              elements={elements}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onPanelToggle={handlePanelToggle}
            />
          </DropZoneErrorBoundary>
        ) : (
          <>
            {rootElements
              .map((element, index) => (
                <React.Fragment key={element.id}>
                  {!isPreviewMode && (
                    <>
                      <DropZoneErrorBoundary>
                        <UnifiedDropZone
                          index={index}
                          onDrop={(item) => handleDrop(item, index)}
                          text=""
                          className="between-dropzone"
                          isDragging={isDragging}
                          elements={elements}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </DropZoneErrorBoundary>
                      {!isDragging && (
                        <QuickAddButton
                          onClick={() => handlePanelToggle('sidebar')}
                        />
                      )}
                    </>
                  )}
                  {wrapWithBoundary(
                    element,
                    renderElement(
                      element,
                      elements,
                      contentListWidth,
                      setSelectedElement,
                      setElements,
                      handlePanelToggle,
                      selectedElement,
                      null, // selectedStyle (unused, kept for signature compat)
                      isPreviewMode,
                      handleOpenMediaPanel,
                      null,
                      activeBreakpoint
                    ),
                    index
                  )}
                </React.Fragment>
              ))}

            {!isPreviewMode && (
              <>
                {!isDragging && getRootElements().length > 0 && (
                  <QuickAddButton
                    onClick={() => handlePanelToggle('sidebar')}
                  />
                )}
                <DropZoneErrorBoundary>
                  <UnifiedDropZone
                    index={rootElements.length}
                    onDrop={(item) => handleDrop(item, rootElements.length)}
                    text="Click or Drop items here to add to the page"
                    className="default-dropzone"
                    isDragging={isDragging}
                    elements={elements}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(null);
                    }}
                  />
                </DropZoneErrorBoundary>
              </>
            )}
          </>
        )}
        {!isPreviewMode && <AlignmentGuides />}
      </div>
      </div>
    );
  }
);

export default ContentList;
