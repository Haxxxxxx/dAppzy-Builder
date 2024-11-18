// src/components/ContentList.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import SectionStructureModal from '../utils/SectionStructureModal';
import HeadingLevelSelector from '../utils/HeadingLevelSelector';
import { renderElement } from '../utils/RenderUtils';
import TableFormatModal from '../utils/TableFormatModal'; // Import the TableFormatModal

const ContentList = () => {
  const { elements, addNewElement, setSelectedElement, selectedElement, setElements } = useContext(EditableContext);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [dropZoneIndex, setDropZoneIndex] = useState(null);
  const [showTableFormatModal, setShowTableFormatModal] = useState(false); // State for table modal
  const [hoveredElementIndex, setHoveredElementIndex] = useState(null);

  const handleDrop = (item, index, parentId = null) => {
    if (item.type === 'heading') {
      setShowLevelSelector(true);
    } else if (item.type === 'section') {
      setShowStructureModal(true);
    } else if (item.type === 'table') {
      setShowTableFormatModal(true); // Show the table format modal
      setDropZoneIndex(index);
    } else {
      const safeIndex = index !== null && index !== undefined ? index : 0;
      const newId = addNewElement(item.type, 1, safeIndex, parentId);
      setSelectedElement({ id: newId, type: item.type });
    }
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
  const handleLevelSelect = (level) => {
    const newId = addNewElement('heading', level);
    setSelectedElement({ id: newId, type: 'heading', level });
    setShowLevelSelector(false);
  };

  const handleStructureSelect = (structure) => {
    console.log('Creating section with structure:', structure);
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


  return (
    <div className="content-list">
      {/* Display a DropZone initially if no elements are present */}
      {elements.length === 0 && (
        <DropZone
          index={0}
          onDrop={(item) => handleDrop(item, 0)}
          text="Click or Drop items here to start creating"
          onClick={() => setDropZoneIndex(0)}
        />
      )}

{elements
    .filter((element) => !element.parentId)
    .map((element, index) => (
      <React.Fragment key={element.id}>
        {renderElement(element, elements)}
      </React.Fragment>
    ))}



      {/* Always render a DropZone at the end of the list */}
      <DropZone
        index={elements.length}
        onDrop={(item) => handleDrop(item, null)}
        text="Click or Drop items here to add to the page"
        onClick={() => setDropZoneIndex(elements.length)}
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
