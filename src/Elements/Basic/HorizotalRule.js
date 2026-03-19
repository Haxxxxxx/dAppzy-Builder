// src/Elements/Structure/Hr.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Hr = ({ id }) => {
  const { setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'hr' });
  };

  return (
    <hr
      onClick={handleSelect}
      style={{
        border: '1px solid #ccc',
        margin: '10px 0',
      }}
    />
  );
};

export default Hr;
