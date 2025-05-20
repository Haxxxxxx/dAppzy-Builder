import React, { useContext, useEffect, forwardRef } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../context/EditableContext';
import UnifiedDropZone from '../utils/UnifiedDropZone';
import DropZoneErrorBoundary from '../utils/DropZoneErrorBoundary';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';

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

    const handleDrop = (item, index) => {
      if (!item) return;

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
            {elements
              .filter((element) => !element.parentId)
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
                  {renderElement(
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
