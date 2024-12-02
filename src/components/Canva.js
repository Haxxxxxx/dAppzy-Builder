import React, { useContext, useState, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import SectionStructureModal from '../utils/SectionQuickAdd/ModalQuickAdd/SectionStructureModal';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';
import TableFormatModal from '../utils/SectionQuickAdd/TableFormatModal';

const ContentList = ({ contentListWidth, isSideBarVisible, leftBarWidth = 40, sideBarWidth = 300, handlePanelToggle }) => {
  const { elements, addNewElement, setSelectedElement, setElements, ELEMENTS_VERSION, saveToLocalStorage, buildHierarchy, findElementById, selectedElement } = useContext(EditableContext);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [dropZoneIndex, setDropZoneIndex] = useState(null);
  const [showTableFormatModal, setShowTableFormatModal] = useState(false);
  const [scale, setScale] = useState(1);

  const contentRef = useRef(null);

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

  const handleContentClick = (e) => {
    if (e.target === contentRef.current) {
      setSelectedElement(null);
    }
  };

  
  const handleDrop = (item, index, parentId = null) => {
    const safeIndex = index !== null && index !== undefined ? index : 0;
  
    if (item.type === 'table') {
      setShowTableFormatModal(true);
      setDropZoneIndex(safeIndex);
    } else if (item.type === 'hero' || item.type === 'navbar' || item.type === 'mintingSection') {
      // Handle structured elements like hero, navbar, mintingSection
      const newElementId = addNewElement(item.type, 1, safeIndex, null, item.structure);
      setSelectedElement({ id: newElementId, type: item.type, structure: item.structure });
    } else if (item.type === 'div' || item.type === 'section' || item.type === 'form') {
      const newElementId = addNewElement(item.type, 1, safeIndex, parentId);
      setSelectedElement({ id: newElementId, type: item.type });
    } else {
      // Generic handling for other types
      const divId = addNewElement('div', 1, safeIndex, parentId);
      const newElementId = addNewElement(item.type, 1, null, divId);
  
      setElements((prevElements) => {
        return prevElements.map((el) =>
          el.id === divId
            ? { ...el, children: [...(el.children || []), newElementId] }
            : el
        );
      });
  
      setSelectedElement({ id: newElementId, type: item.type });
    }
  };
  

  useEffect(() => {
    saveToLocalStorage('editableElements', elements);
    saveToLocalStorage('elementsVersion', ELEMENTS_VERSION);
  }, [elements]);

  const saveSectionToLocalStorage = (sectionId) => {
    const section = findElementById(sectionId, elements);
    if (section) {
      const hierarchy = buildHierarchy(elements);
      saveToLocalStorage(`section-${sectionId}`, hierarchy);
    }
  };

  return (
    <div
      ref={contentRef}
      className="content-list"
      onClick={handleContentClick}
      style={{
        width: `${contentListWidth}px`,
        transformOrigin: 'top left',
        transition: 'width 0.3s ease, transform 0.3s ease',
        margin: scale < 1 ? '0 auto' : '0',
        overflow: 'auto',
      }}
    >
      {elements.length === 0 && (
        <DropZone
          index={0}
          onDrop={(item) => handleDrop(item, 0)}
          text="Click or Drop items here to start creating"
          onClick={(e) => {
            e.stopPropagation();
            handlePanelToggle('sidebar'); // Open the sidebar on click
          }} />
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
              handlePanelToggle // Pass this down
            )}
          </React.Fragment>
        ))}
      {elements.length > 0 && (
        <DropZone
          index={elements.length}
          onDrop={(item) => handleDrop(item, null)}
          text="Click or Drop items here to add to the page"
          onClick={(e) => {
            e.stopPropagation();
            handlePanelToggle('sidebar'); // Open the sidebar on click
          }} />
      )}


    </div>
  );
};

export default ContentList;
