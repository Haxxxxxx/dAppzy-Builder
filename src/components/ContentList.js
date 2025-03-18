import React, { useContext, useEffect, forwardRef } from 'react';
import { useDragLayer } from 'react-dnd';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';

const ContentList = forwardRef(
  (
    {
      contentListWidth,
      canvasWidth,
      scale,
      setScale,
      isPreviewMode,
      handleOpenMediaPanel = () => {},
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

    const handleDrop = (item, index, parentId = null) => {
      const safeIndex = index ?? 0;

      // If the dropped item has an id, it is an existing element to be moved.
      if (item && item.id) {
        moveElement(item.id, safeIndex);
        setSelectedElement({ id: item.id, type: item.type });
        return;
      }

      // Otherwise, add a new element.
      if (item.type === 'button' || item.type === 'image') {
        const newElementId = addNewElement(item.type, 1, safeIndex, parentId);
        setSelectedElement({ id: newElementId, type: item.type });
      } else if (
        item.type === 'hero' ||
        item.type === 'navbar' ||
        item.type === 'cta' ||
        item.type === 'mintingSection' ||
        item.type === 'footer'
      ) {
        const newElementId = addNewElement(item.type, 1, safeIndex, null, item.structure);
        setSelectedElement({ id: newElementId, type: item.type, structure: item.structure });
      } else {
        const newElementId = addNewElement(item.type, 1, safeIndex, parentId);
        setSelectedElement({ id: newElementId, type: item.type });
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
        }}
        onClick={(e) => {
          if (e.target === ref.current) {
            setSelectedElement(null);
          }
        }}
      >
        {/* Render drop zone only when dragging and no elements exist */}
        {!isPreviewMode && elements.length === 0 && isDragging && (
          <DropZone
            index={0}
            onDrop={(item) => handleDrop(item, 0)}
            text="Add layout"
            className="first-dropzone"
            scale={scale}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        )}

        {elements
          .filter((element) => !element.parentId)
          .map((element, index) => (
            <React.Fragment key={element.id}>
              {/* Render drop zone before each element only during dragging */}
              {isDragging && (
                <DropZone
                  index={index}
                  onDrop={(item) => handleDrop(item, index)}
                  text=""
                  className="section-dropzone"
                />
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

        {/* Render drop zone after the last element only during dragging */}
        {!isPreviewMode && elements.length > 0 && isDragging && (
          <DropZone
            index={elements.length}
            onDrop={(item) => handleDrop(item, elements.length)}
            text="Click or Drop items here to add to the page"
            className="default-dropzone"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement('');
            }}
          />
        )}
      </div>
    );
  }
);

export default ContentList;
