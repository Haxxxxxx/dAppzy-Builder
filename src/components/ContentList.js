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

    const handleDrop = (item, index) => {
      if (!item) return;

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
          item.type === 'hero' ||
          item.type === 'navbar' ||
          item.type === 'cta' ||
          item.type === 'mintingSection' ||
          item.type === 'ContentSection' ||
          item.type === 'footer'
        ) {
          const config = item.configuration || item.structure;
          newId = addNewElement(item.type, 1, index, null, config);
          // No defaultContent logic here; footer children and styles are handled by DraggableFooter.js
        } else {
          newId = addNewElement(item.type, 1, index);
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
