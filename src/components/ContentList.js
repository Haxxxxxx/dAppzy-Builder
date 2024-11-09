import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import SectionStructureModal from '../utils/SectionStructureModal';
import HeadingLevelSelector from '../utils/HeadingLevelSelector';
import { renderElement } from '../utils/RenderUtils';

const ContentList = () => {
  const { elements, addNewElement, setSelectedElement, setElements } = useContext(EditableContext);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [dropZoneIndex, setDropZoneIndex] = useState(null);

  const handleDrop = (item, index, parentId = null) => {
    if (item.type === 'heading') {
      setShowLevelSelector(true);
    } else if (item.type === 'section') {
      setShowStructureModal(true);
    } else {
      const newId = addNewElement(item.type, 1, index, parentId);
      setSelectedElement({ id: newId, type: item.type });
    }
  };

  const handleDropZoneClick = (index) => {
    setDropZoneIndex(index);
    setShowStructureModal(true);
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

  useEffect(() => {
    console.log('Current elements state:', elements); // Add logging
  }, [elements]);
  

  return (
    <div className="content-list">
      {elements
        .filter(
          (element) =>
            !element.parentId && // Only render top-level elements
            (element.type !== 'navbar' || element.configuration) // Filter out empty navbar elements
        )
        .map((element) => renderElement(element, elements))}

      <DropZone
        index={elements.length}
        onDrop={(item) => handleDrop(item, null)}
        text="Click or Drop items here to add to the page"
        onClick={() => handleDropZoneClick(elements.length)}
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
    </div>
  );
};

export default ContentList;
