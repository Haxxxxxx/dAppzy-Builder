import React, { useContext, useEffect, forwardRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';
import { loadFromLocalStorage } from '../utils/LeftBarUtils/storageUtils';

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
      setSelectedElement,
      setElements,
      ELEMENTS_VERSION,
      saveToLocalStorage,
      selectedStyle,
      selectedElement,
    } = useContext(EditableContext);

    const calculateScale = () => {
      const newScale = canvasWidth / contentListWidth;
      setScale(newScale < 1 ? newScale : 1);
    };

    
    useEffect(() => {
      calculateScale();
    }, [contentListWidth, canvasWidth]);

    const handleDrop = (item, index, parentId = null) => {
      const safeIndex = index !== null && index !== undefined ? index : 0;

      if (item.type === 'button' || item.type === 'image') {
        const newElementId = addNewElement(item.type, 1, safeIndex, parentId);
        setSelectedElement({ id: newElementId, type: item.type });
      } else if (
        item.type === 'hero' ||
        item.type === 'navbar' ||
        item.type === 'cta' ||
        item.type === 'mintingSection'
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
          position: 'relative',
        }}
        onClick={(e) => {
          if (e.target === ref.current) {
            setSelectedElement(null);
          }
        }}
      >
        {!isPreviewMode && elements.length === 0 && (
          <DropZone
            index={0}
            onDrop={(item) => handleDrop(item, 0)}
            text="Add layout"
            className="first-dropzone"
            scale={scale} // Pass scale to DropZone
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        )}

        {elements
          .filter((element) => !element.parentId)
          .map((element) =>
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
            )
          )}

        {!isPreviewMode && elements.length > 0 && (
          <DropZone
            index={elements.length}
            onDrop={(item) => handleDrop(item, null)}
            text="Click or Drop items here to add to the page"
            className="default-dropzone"
            onClick={(e) => {
              e.stopPropagation();
              handlePanelToggle('sidebar');
            }}
          />
        )}
      </div>
    );

  }
);

export default ContentList;
