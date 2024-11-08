import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';
import DropZone from '../../utils/DropZone';

const Form = ({ id }) => {
  const { selectedElement, elements, addNewElement, setSelectedElement } = useContext(EditableContext);
  const formElement = elements.find((el) => el.id === id);
  const { children = [], styles = {} } = formElement || {};

  const handleDrop = (item, parentId) => {
    addNewElement(item.type, 1, null, parentId);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'form', styles });
  };

  return (
    <form
      id={id}
      onClick={handleSelect}
      style={{
        ...styles,
        padding: '10px',
        border: '1px solid #ccc',
        margin: '10px 0',
        border: selectedElement?.id === id ? '1px dashed blue' : '1px solid #ccc', // Add visual cue for selected form
      }}
    >
      {children.map((childId) => {
        const childElement = elements.find((el) => el.id === childId);
        return childElement ? <div key={childId}>{childElement.content}</div> : null;
      })}
      <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
    </form>
  );
};

export default Form;
