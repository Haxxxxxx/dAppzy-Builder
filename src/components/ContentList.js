import React, { useContext, useEffect, forwardRef, useCallback, useState } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../context/EditableContext';
import { AutoSaveContext } from '../context/AutoSaveContext';
import UnifiedDropZone from '../utils/UnifiedDropZone';
import DropZoneErrorBoundary from '../utils/DropZoneErrorBoundary';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';
import LayoutReplacementBoundary from './LayoutReplacementBoundary';
import debounce from 'lodash/debounce';

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
      saveToLocalStorage,
      selectedStyle,
      selectedElement,
      generateUniqueId,
    } = useContext(EditableContext);

    const { saveContent, markPendingChanges } = useContext(AutoSaveContext);

    // Load elements from chunked localStorage on mount
    useEffect(() => {
      const loadChunkedElements = () => {
        try {
          // Get the number of chunks
          const numChunks = parseInt(localStorage.getItem('editableElements_chunks') || '0');
          if (numChunks === 0) {
            // Try to load from the old single-item storage
            const oldElements = localStorage.getItem('editableElements');
            if (oldElements) {
              const parsedElements = JSON.parse(oldElements);
              if (Array.isArray(parsedElements) && parsedElements.length > 0) {
                setElements(parsedElements);
              }
            }
            return;
          }

          // Load and combine all chunks
          let allElements = [];
          for (let i = 0; i < numChunks * 50; i += 50) {
            const chunkData = localStorage.getItem(`editableElements_chunk_${i}`);
            if (chunkData) {
              const chunk = JSON.parse(chunkData);
              allElements = [...allElements, ...chunk];
            }
          }

          // Only update if we have elements and they're different from current
          if (allElements.length > 0 && JSON.stringify(allElements) !== JSON.stringify(elements)) {
            console.log('Loading chunked elements:', allElements.length);
            setElements(allElements);
          }
        } catch (error) {
          console.error('Error loading chunked elements:', error);
        }
      };

      loadChunkedElements();
    }, []); // Only run on mount

    // Create a debounced save function with memoization
    const debouncedSave = useCallback(
      debounce((elements, settings) => {
        // Only save if we have actual elements to save
        if (elements && elements.length > 0) {
          saveContent(elements, settings);
        }
      }, 3000), // Increased debounce time to 3 seconds
      [saveContent]
    );

    // Batch multiple changes together
    const [pendingChanges, setPendingChanges] = useState(false);
    
    // Watch for changes in elements and trigger auto-save
    useEffect(() => {
      if (elements.length > 0) {
        // Mark changes as pending immediately
        if (!pendingChanges) {
          setPendingChanges(true);
          markPendingChanges();
        }
        
        // Schedule the save
        debouncedSave(elements, websiteSettings);
      }
    }, [elements, websiteSettings, markPendingChanges, debouncedSave, pendingChanges]);

    // Reset pending changes when save is complete
    useEffect(() => {
      return () => {
        setPendingChanges(false);
        debouncedSave.cancel();
      };
    }, [debouncedSave]);

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
            createFlexElement({ ...child, parentType: child.type, direction: child.type === 'vflex' ? 'column' : 'row' }, addNewElement, id);
          } else {
            addNewElement(child.type, 1, 0, id, {
              styles: { flex: 1, gap: '8px', padding: '8px', display: 'flex', flexDirection: child.type === 'vflex' ? 'column' : 'row' }
            });
          }
        });
      }
      return id;
    }

    // Get root-level elements only
    const getRootElements = useCallback(() => {
      return elements.filter(el => !el.parentId);
    }, [elements]);

    // Simplified replaceLayout function that just reorders elements
    const replaceLayout = (oldLayoutId, newLayoutConfig, position) => {
      // Find the old layout
      const oldLayout = elements.find(el => el.id === oldLayoutId);
      if (!oldLayout) {
        console.warn('Could not find layout with id:', oldLayoutId);
        return null;
      }

      // Get root elements and their indices
      const rootElements = getRootElements();
      const rootElementIds = rootElements.map(el => el.id);
      
      // Get source and target indices in the root elements array
      const sourceIndex = rootElementIds.indexOf(oldLayoutId);
      
      // Find the target element by ID instead of index
      const targetId = newLayoutConfig.targetId || elements[newLayoutConfig.targetIndex]?.id;
      const targetIndex = rootElementIds.indexOf(targetId);

      console.log('Root element indices:', {
        source: sourceIndex,
        target: targetIndex,
        targetId,
        edge: position?.edge,
        rootElementsCount: rootElements.length,
        totalElementsCount: elements.length,
        rootElementIds
      });

      if (sourceIndex === -1 || targetIndex === -1) {
        console.warn('Could not find source or target in root elements:', {
          sourceId: oldLayoutId,
          targetId,
          rootElementIds
        });
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

      console.log('Moving root element:', {
        from: sourceIndex,
        to: finalIndex,
        edge: position?.edge
      });

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

        console.log('Element reordering details:', {
          totalElementsBefore: prevElements.length,
          totalElementsAfter: updatedElements.length,
          rootElements: reorderedRootElements.map((el, idx) => ({
            id: el.id,
            type: el.type,
            index: idx,
            childCount: (childrenMap.get(el.id) || []).length
          })),
          childrenMap: Array.from(childrenMap.entries()).map(([parentId, children]) => ({
            parentId,
            childCount: children.length
          }))
        });

        return updatedElements;
      });

      return oldLayoutId;
    };

    // Enhanced layout replacement handler
    const handleLayoutReplace = useCallback(({ oldLayoutId, sourceIndex, targetIndex, newLayout, position }) => {
      console.log('Handling layout replace:', {
        oldLayoutId,
        sourceIndex,
        targetIndex,
        targetId: newLayout.id,
        position
      });
      
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

    // Prepare layout data for dragging
    const getLayoutData = useCallback((element) => {
      return {
        type: element.type,
        configuration: element.configuration,
        structure: element.structure,
        styles: element.styles,
        settings: element.settings,
        label: element.label
      };
    }, []);

    // Enhanced wrapWithBoundary function
    const wrapWithBoundary = (element, renderedElement, index) => {
      const isLayout = [
        'navbar',
        'hero',
        'cta',
        'mintingSection',
        'ContentSection',
        'defiSection',
        'footer',
        'section'
      ].includes(element.type);

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
    const handleDrop = (item, index) => {
      if (!item) return;

      // Handle layout replacement from drag and drop
      if (item.type && ['navbar', 'hero', 'cta', 'mintingSection', 'ContentSection', 'defiSection', 'footer', 'section'].includes(item.type)) {
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
            console.error('Error setting layout data:', err);
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

      if (item.id) {
        // If the item has an id, it's an existing element being moved
        moveElement(item.id, index);
        setSelectedElement({ id: item.id, type: item.type });
      } else if (item.type) {
        // If it's a new element being added
        let newId;
        if (item.type === 'button' || item.type === 'image') {
          newId = addNewElement(item.type, 1, index);
        } else if (
          item.type === 'navbar' ||
          item.type === 'hero' ||
          item.type === 'cta' ||
          item.type === 'mintingSection' ||
          item.type === 'ContentSection' ||
          item.type === 'defiSection' ||
          item.type === 'footer' ||
          item.type === 'section'
        ) {
          // Handle all section types with their full configuration
          console.log('Adding section with data:', item);
          
          // For all section types, process children normally
          const processedChildren = item.children?.map(child => ({
            ...child,
            id: generateUniqueId(child.type || 'element')
          })) || [];

          // Map section type to ContentSection for content sections
          const elementType = item.configuration?.startsWith('section') ? 'ContentSection' : item.type;

          newId = addNewElement(elementType, 1, index, null, {
            type: elementType,
            configuration: item.configuration || item.type,
            structure: item.structure || item.type,
            styles: item.styles || {},
            settings: item.settings || {},
            label: item.label,
            children: processedChildren
          });
        } else if (
          item.type === 'defiModule' ||
          item.type === 'mintingModule' ||
          item.type === 'container' ||
          item.type === 'gridLayout' ||
          item.type === 'hflexLayout' ||
          item.type === 'vflexLayout' ||
          item.type === 'hflex' ||
          item.type === 'vflex' ||
          item.type === 'line' ||
          item.type === 'linkBlock' ||
          item.type === 'youtubeVideo' ||
          item.type === 'icon' ||
          item.type === 'dateComponent' ||
          item.type === 'bgVideo' ||
          item.type === 'connectWalletButton'
        ) {
          // Handle unique elements
          newId = addNewElement(item.type, 1, index, null, {
            type: item.type,
            content: item.content || '',
            styles: {
              ...item.styles,
              display: item.type === 'gridLayout' ? 'grid' : item.styles?.display,
              gridTemplateColumns: item.type === 'gridLayout' ? 'repeat(4, 1fr)' : item.styles?.gridTemplateColumns,
              gap: item.styles?.gap || '1.5rem',
              width: '100%',
              padding: '10px'
            },
            configuration: item.configuration || {},
            settings: item.settings || {},
            children: item.children || []
          });
        } else {
          // For individual elements, check if we're dropping onto a layout element
          const targetElement = elements[index];
          if (targetElement && (
            targetElement.type === 'navbar' ||
            targetElement.type === 'hero' ||
            targetElement.type === 'cta' ||
            targetElement.type === 'ContentSection' ||
            targetElement.type === 'footer' ||
            targetElement.type === 'defiSection'
          )) {
            // Add the element as a child of the layout element
            newId = addNewElement(item.type, 1, null, targetElement.id, {
              type: item.type,
              content: item.content || '',
              styles: item.styles || {}
            });
          } else {
            // Add as a regular element
            newId = addNewElement(item.type, 1, index);
          }
        }
        setSelectedElement({ id: newId, type: item.type, structure: item.structure });
      }
    };

    return (
      <div
        ref={ref}
        className="content-list"
        style={{
          width: `${contentListWidth}px`,
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          transition: 'transform 0.3s ease',
          margin: scale < 1 ? '0 auto' : '0',
          marginBottom: '30px',
          position: 'relative',
          minHeight: '100vh',
        }}
        onClick={(e) => {
          if (e.target === ref.current) {
            setSelectedElement(null);
          }
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
              onClick={(e) => {
                e.stopPropagation();
              }}
              onPanelToggle={handlePanelToggle}
            />
          </DropZoneErrorBoundary>
        ) : (
          <>
            {getRootElements()
              .map((element, index) => (
                <React.Fragment key={element.id}>
                  {!isPreviewMode && (
                    <DropZoneErrorBoundary>
                      <UnifiedDropZone
                        index={index}
                        onDrop={(item) => handleDrop(item, index)}
                        text=""
                        className="between-dropzone"
                        isDragging={isDragging}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </DropZoneErrorBoundary>
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
                      selectedStyle,
                      isPreviewMode,
                      handleOpenMediaPanel
                    ),
                    index
                  )}
                </React.Fragment>
              ))}

            {!isPreviewMode && (
              <DropZoneErrorBoundary>
                <UnifiedDropZone
                  index={elements.length}
                  onDrop={(item) => handleDrop(item, elements.length)}
                  text="Click or Drop items here to add to the page"
                  className="default-dropzone"
                  isDragging={isDragging}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement('');
                  }}
                />
              </DropZoneErrorBoundary>
            )}
          </>
        )}
      </div>
    );
  }
);

export default ContentList;
