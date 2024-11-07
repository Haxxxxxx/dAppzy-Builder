import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import SectionStructureModal from '../utils/SectionStructureModal';
import HeadingLevelSelector from '../utils/HeadingLevelSelector';
import { renderElement } from '../utils/RenderUtils';

const ContentList = () => {
  const { elements, addNewElement, setSelectedElement } = useContext(EditableContext);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);

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

  const handleLevelSelect = (level) => {
    const newId = addNewElement('heading', level);
    setSelectedElement({ id: newId, type: 'heading', level });
    setShowLevelSelector(false);
  };

  const handleStructureSelect = (structure) => {
    console.log('Creating section with structure:', structure);
    const newId = addNewElement('section', 1, elements.length, null, structure);
    setSelectedElement({ id: newId, type: 'section', structure });
    setShowStructureModal(false);
  };

  useEffect(() => {
    console.log('Elements state:', elements);
  }, [elements]);

  return (
    <div className="content-list">
      {elements
        .filter((element) => !element.parentId) // Only render top-level elements
        .map((element) => renderElement(element, elements))}
      <DropZone index={elements.length} onDrop={(item) => handleDrop(item, null)} />

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
