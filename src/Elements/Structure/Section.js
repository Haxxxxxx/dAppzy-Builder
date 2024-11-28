import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/RenderUtils';
import StructureAndElementsModal from '../../utils/StructureAndElementsModal';
import useElementDrop from '../../utils/useElementDrop';

const Section = ({ id, isTemplate, structure }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const sectionElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = sectionElement || {};
  const sectionRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id,
    elementRef: sectionRef,
    onDropItem: (item, parentId) => {
      const newId = addNewElement(item.type, item.level || 1, null, parentId);
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? { ...el, children: [...new Set([...el.children, newId])] }
            : el
        )
      );
    },
  });

  React.useEffect(() => {
    if (isTemplate && structure) {
      handleSelectStructure(structure);
    }
  }, [isTemplate, structure]);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'section', styles });
    setIsModalOpen(true);
  };

  return (
    <section
      id={id}
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      style={{
        ...styles,
        padding: '10px',
        border: selectedElement?.id === id ? '2px solid blue' : '1px solid #ccc',
        borderRadius: '4px',
        margin: '10px 0',
        backgroundColor: isOverCurrent ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
      }}
    >
      {children.map((childId) => {
        const childElement = elements.find((el) => el.id === childId);
        return childElement ? renderElement(childElement, elements, selectedElement) : null;
      })}
      {isOverCurrent && canDrop && <div className="drop-indicator">Drop here</div>}
      <StructureAndElementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectStructure={handleSelectStructure}
        onAddElement={(type) => {
          const newId = addNewElement(type, 1, null, id);
          setElements((prevElements) =>
            prevElements.map((el) =>
              el.id === id ? { ...el, children: [...new Set([...el.children, newId])] } : el
            )
          );
          setIsModalOpen(false);
        }}
      />
    </section>
  );
};

export default Section;
