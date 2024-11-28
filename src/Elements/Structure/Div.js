import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { renderElement } from '../../utils/RenderUtils';
import StructureAndElementsModal from '../../utils/StructureAndElementsModal';
import useElementDrop from '../../utils/useElementDrop';

const Div = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = divElement || {};
  const divRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { isOverCurrent, canDrop, drop } = useElementDrop({
    id,
    elementRef: divRef,
    onDropItem: (item, parentId) => {
      const newId = addNewElement(item.type, item.level || 1, null, parentId);
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === parentId
            ? {
                ...el,
                children: el.children.includes(newId) ? el.children : [...el.children, newId],
              }
            : el
        )
      );
    },
  });

  const handleSelect = (e) => {
    e.stopPropagation();
    const element = elements.find((el) => el.id === id);
    if (element) {
      setSelectedElement({
        id: element.id,
        type: element.type,
        styles: element.styles,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div
      id={id}
      ref={(node) => {
        divRef.current = node;
        drop(node);
      }}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      <StructureAndElementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectStructure={(structure) => {
          console.log('Selected structure:', structure);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Div;
