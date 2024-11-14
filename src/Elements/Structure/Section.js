import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import { renderElement } from '../../utils/RenderUtils';
import StructureAndElementsModal from '../../utils/StructureAndElementsModal';

const Section = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const sectionElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = sectionElement || {};
  const sectionRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'section', styles });
    setIsModalOpen(true);
  };

  const handleDrop = (item, parentId) => {
    if (!item || !parentId) return;
    console.log(`Dropping item of type ${item.type} into section with id ${parentId}`);
    const newId = addNewElement(item.type, item.level || 1, null, parentId);
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === parentId
          ? { ...el, children: [...new Set([...el.children, newId])] }
          : el
      )
    );
  };

  const handleAddElement = (type) => {
    const newId = addNewElement(type, 1, null, id);
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, children: [...new Set([...el.children, newId])] } : el
      )
    );
    setIsModalOpen(false);
  };

  const handleSelectStructure = (structure) => {
    console.log('Selected structure:', structure);
    let elementsToAdd = [];
    if (structure === 'title-text') {
      const headingId = addNewElement('heading', 1, null, id);
      const paragraphId = addNewElement('paragraph', 1, null, id);
      elementsToAdd = [headingId, paragraphId];
    } else if (structure === 'title-image') {
      const headingId = addNewElement('heading', 1, null, id);
      const imageId = addNewElement('image', 1, null, id);
      elementsToAdd = [headingId, imageId];
    } else if (structure === 'two-columns') {
      const column1Id = addNewElement('div', 1, null, id);
      const column2Id = addNewElement('div', 1, null, id);
      elementsToAdd = [column1Id, column2Id];
    }
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id
          ? {
              ...el,
              children: [...new Set([...el.children, ...elementsToAdd])],
            }
          : el
      )
    );
    setIsModalOpen(false);
  };

  return (
    <>
      <section
        id={id}
        ref={sectionRef}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...styles,
          padding: '10px',
          border: selectedElement?.id === id ? '2px solid blue' : '1px solid #ccc',
          borderRadius: '4px',
          margin: '10px 0',
        }}
      >
        New Section
        {children.map((childId) => {
          const childElement = elements.find((el) => el.id === childId);
          return childElement ? renderElement(childElement, elements, selectedElement, handleDrop) : null;
        })}
      </section>
      {(isHovered || selectedElement?.id === id) && (
        <DropZone
          onDrop={(item) => handleDrop(item, id)}
          text="Click on the section or Drop items here to add to this section"
          style={{ width: '100%' }}
        />
      )}
      <StructureAndElementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectStructure={handleSelectStructure}
        onAddElement={handleAddElement}
      />
    </>
  );
};

export default Section;
