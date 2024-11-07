import React, { useContext, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';
import { renderElement } from '../utils/RenderUtils';

const Div = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, addNewElement, setElements } = useContext(EditableContext);
  const divElement = elements.find((el) => el.id === id);
  const { styles, children = [] } = divElement || {};
  const divRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    const element = elements.find((el) => el.id === id);
    if (element) {
      setSelectedElement({
        id: element.id,
        type: element.type,
        styles: element.styles, // Pass the styles of the selected element
      });
    }
  };
  
  const handleDrop = (item, parentId) => {
    if (!item || !parentId) return;
  
    console.log(`Dropping item of type ${item.type} into Div with id ${parentId}`);
  
    // Create and add the new element
    const newId = addNewElement(item.type, item.level || 1, null, parentId);
  
    // Update the parent's children list, ensuring IDs are being handled correctly
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
  

  return (
    <div
      id={id}
      ref={divRef}
      onClick={handleSelect}
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
        return childElement ? renderElement(childElement, elements) : null;
      })}
      <DropZone onDrop={(item) => handleDrop(item, id)} />
    </div>
  );
};

export default Div;
