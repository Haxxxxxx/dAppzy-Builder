import React, { useContext, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import { renderElement } from '../utils/RenderUtils';

const Section = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const sectionElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = sectionElement || {};
  const sectionRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'section' });
  };

  const handleDrop = (item, parentId) => {
    if (!item || !parentId) return;

    console.log(`Dropping item of type ${item.type} into Section with id ${parentId}`);

    // Create and add the new element
    const newId = addNewElement(item.type, item.level || 1, null, parentId);

    // Update the parent's children list, preventing duplication
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === parentId
          ? { ...el, children: el.children.includes(newId) ? el.children : [...el.children, newId] }
          : el
      )
    );
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      suppressContentEditableWarning={true}
      style={{ ...styles, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}
    >
      New Section
      {children.map((childId) => {
        const childElement = elements.find((el) => el.id === childId);
        return childElement ? renderElement(childElement, elements) : null;
      })}
      <DropZone onDrop={(item) => handleDrop(item, id)} />
    </section>
  );
};

export default Section;
