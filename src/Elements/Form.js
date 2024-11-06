// src/Elements/Form.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import DropZone from '../utils/DropZone';

const Form = ({ id }) => {
  const { elements, addNewElement, setSelectedElement } = useContext(EditableContext);
  const formElement = elements.find((el) => el.id === id);
  const { children = [] } = formElement || {};

  const handleDrop = (item, parentId) => {
    addNewElement(item.type, 1, null, parentId);
  };

  return (
    <form id={id} style={{ padding: '10px', border: '1px solid #ccc', margin: '10px 0' }}>
      {children && children.map((childId) => {
        const childElement = elements.find((el) => el.id === childId);
        return childElement ? <div key={childId}>{childElement.content}</div> : null;
      })}
      <DropZone onDrop={(item) => handleDrop(item, id)} parentId={id} />
    </form>
  );
};

export default Form;
