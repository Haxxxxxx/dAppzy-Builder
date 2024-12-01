import React, { useContext, useState, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import SectionStructureModal from '../utils/SectionStructureModal';
import HeadingLevelSelector from '../utils/HeadingLevelSelector';
import { renderElement } from '../utils/RenderUtils';
import TableFormatModal from '../utils/TableFormatModal';

const ContentList = ({ contentListWidth, isSideBarVisible, leftBarWidth = 40, sideBarWidth = 300 }) => {
  const { elements, addNewElement, setSelectedElement, setElements, ELEMENTS_VERSION, saveToLocalStorage, buildHierarchy, findElementById } = useContext(EditableContext);
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
  
    if (item.type === 'hero') {
      // Create hero at the root level
      const heroId = addNewElement(item.type, 1, safeIndex, null, item.structure);
      setSelectedElement({ id: heroId, type: item.type, structure: item.structure });
    } else if (item.type === 'navbar') {
      // Create navbar at the root level
      const navbarId = addNewElement(item.type, 1, safeIndex, null, item.structure);
      setSelectedElement({ id: navbarId, type: item.type, structure: item.structure });
    } else {
      // Handle other types
      const newId = addNewElement(item.type, 1, safeIndex, parentId);
      setSelectedElement({ id: newId, type: item.type });
    }
  };
  


  const handleLevelSelect = (level) => {
    const newId = addNewElement('heading', level);
    setSelectedElement({ id: newId, type: 'heading', level });
    setShowLevelSelector(false);
  };

  const handleStructureSelect = (structure) => {
    const sectionId = addNewElement('section', 1, dropZoneIndex, null, structure);
    setSelectedElement({ id: sectionId, type: 'section', structure });

    const childrenToAdd = [];

    if (structure === 'title-text') {
      const headingId = addNewElement('heading', 1, null, sectionId);
      const paragraphId = addNewElement('paragraph', 1, null, sectionId);
      childrenToAdd.push(headingId, paragraphId);
    } else if (structure === 'title-image') {
      const headingId = addNewElement('heading', 1, null, sectionId);
      const imageId = addNewElement('image', 1, null, sectionId);
      childrenToAdd.push(headingId, imageId);
    } else if (structure === 'two-columns') {
      const column1Id = addNewElement('div', 1, null, sectionId);
      const column2Id = addNewElement('div', 1, null, sectionId);
      childrenToAdd.push(column1Id, column2Id);
    }

    setElements((prevElements) => {
      return prevElements.map((el) =>
        el.id === sectionId ? { ...el, children: [...new Set([...el.children, ...childrenToAdd])] } : el
      );
    });

    setShowStructureModal(false);
  };

  const handleTableFormatSubmit = (rows, columns) => {
    const newTableId = addNewElement('table', 1, dropZoneIndex, null);
    const newRows = [];

    for (let i = 0; i < rows; i++) {
      const rowId = addNewElement('table-row', 1, null, newTableId);
      const newCells = [];
      for (let j = 0; j < columns; j++) {
        const cellId = addNewElement('table-cell', 1, null, rowId);
        newCells.push(cellId);
      }
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === rowId ? { ...el, children: newCells } : el
        )
      );
      newRows.push(rowId);
    }

    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === newTableId ? { ...el, children: newRows } : el
      )
    );

    setSelectedElement({ id: newTableId, type: 'table' });
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
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {elements
        .filter((element) => !element.parentId)
        .map((element) => (
          <React.Fragment key={element.id}>
            {renderElement(element, elements, contentListWidth, setSelectedElement)}
          </React.Fragment>
        ))}

      <DropZone
        index={elements.length}
        onDrop={(item) => handleDrop(item, null)}
        text="Click or Drop items here to add to the page"
        onClick={(e) => e.stopPropagation()}
      />

      {showLevelSelector && (
        <HeadingLevelSelector onSelectLevel={(level) => handleLevelSelect(level)} />
      )}
      {showStructureModal && (
        <SectionStructureModal
          onClose={() => setShowStructureModal(false)}
          onSelectStructure={handleStructureSelect}
        />
      )}
      {showTableFormatModal && (
        <TableFormatModal
          isOpen={showTableFormatModal}
          onClose={() => setShowTableFormatModal(false)}
          onSubmit={handleTableFormatSubmit}
        />
      )}
    </div>
  );
};

export default ContentList;
