import React, { useContext, useState, useEffect, forwardRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import SectionStructureModal from '../utils/SectionQuickAdd/ModalQuickAdd/SectionStructureModal';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';
import TableFormatModal from '../utils/SectionQuickAdd/TableFormatModal';

const ContentList = forwardRef(({ contentListWidth, isSideBarVisible, leftBarWidth = 40, sideBarWidth = 300, handlePanelToggle }, ref) => {
  const { elements, addNewElement, setSelectedElement, setElements, ELEMENTS_VERSION, saveToLocalStorage, buildHierarchy, findElementById } = useContext(EditableContext);
  const [scale, setScale] = useState(1);

  const calculateScale = () => {
    const viewportWidth = window.innerWidth;
    const activeSidebarWidth = isSideBarVisible ? sideBarWidth : 0;
    const availableWidth = viewportWidth - leftBarWidth - activeSidebarWidth;

    const newScale = availableWidth / contentListWidth;
    setScale(newScale < 1 ? newScale : 1);
  };

  useEffect(() => {
    calculateScale();
    window.addEventListener('resize', calculateScale);

    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, [contentListWidth, isSideBarVisible, leftBarWidth, sideBarWidth]);

  const handleDrop = (item, index, parentId = null) => {
    const safeIndex = index !== null && index !== undefined ? index : 0;

    if (item.type === 'table') {
      // Table-specific logic
    } else if (item.type === 'hero' || item.type === 'navbar' || item.type === 'mintingSection') {
      const newElementId = addNewElement(item.type, 1, safeIndex, null, item.structure);
      setSelectedElement({ id: newElementId, type: item.type, structure: item.structure });
    } else {
      const divId = addNewElement('div', 1, safeIndex, parentId);
      const newElementId = addNewElement(item.type, 1, null, divId);
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === divId
            ? { ...el, children: [...(el.children || []), newElementId] }
            : el
        )
      );
      setSelectedElement({ id: newElementId, type: item.type });
    }
  };

  useEffect(() => {
    saveToLocalStorage('editableElements', elements);
    saveToLocalStorage('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);

  return (
    <div
      ref={ref}
      className="content-list"
      style={{
        width: `${contentListWidth}px`,
        transformOrigin: 'top left',
        transition: 'width 0.3s ease, transform 0.3s ease',
        margin: scale < 1 ? '0 auto' : '0',
        position: 'relative',
      }}
    >
      {elements.length === 0 && (
        <DropZone
          index={0}
          onDrop={(item) => handleDrop(item, 0)}
          text="Click here to open the elements / Layout menu and drop items here to see them being created!"
          className="first-dropzone"
          onClick={(e) => {
            e.stopPropagation();
            handlePanelToggle('sidebar');
          }}
        />
      )}

      {elements
        .filter((element) => !element.parentId)
        .map((element) => (
          <React.Fragment key={element.id}>
            {renderElement(
              element,
              elements,
              contentListWidth,
              setSelectedElement,
              setElements,
              handlePanelToggle
            )}
          </React.Fragment>
        ))}
      {elements.length > 0 && (
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
});

export default ContentList;
