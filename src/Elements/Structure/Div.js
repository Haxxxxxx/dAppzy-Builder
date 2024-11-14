import React, { useContext, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';
import { renderElement } from '../../utils/RenderUtils';
import StructureAndElementsModal from '../../utils/StructureAndElementsModal';

const Div = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = divElement || {};
  const divRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    const element = elements.find((el) => el.id === id);
    if (element) {
      setSelectedElement({
        id: element.id,
        type: element.type,
        styles: element.styles,
      });
      setIsModalOpen(true); // Open the modal when div is selected
    }
  };

  const handleDrop = (item, parentId) => {
    if (!item || !parentId) return;
    console.log(`Dropping item of type ${item.type} into div with id ${parentId}`);
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
  };

  const handleAddElement = (type) => {
    addNewElement(type, 1, null, id);
    setIsModalOpen(false); // Close the modal after adding
  };

  return (
    <>
      <div
        id={id}
        ref={divRef}
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
        {children.map((childId) => {
          const childElement = elements.find((el) => el.id === childId);
          return childElement ? renderElement(childElement, elements, selectedElement, handleDrop) : null;
        })}
      </div>
      {(isHovered || selectedElement?.id === id) && (
        <DropZone
          onDrop={(item) => handleDrop(item, id)}
          text="Click on the div or Drop items here to add to this div"
          style={{ width: '100%' }}
        />
      )}
      <StructureAndElementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectStructure={(structure) => {
          console.log('Selected structure:', structure);
          setIsModalOpen(false);
        }}
        onAddElement={handleAddElement}
      />
    </>
  );
};

export default Div;
