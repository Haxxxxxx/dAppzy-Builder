// src/Elements/Structure/Hr.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Hr = ({ id }) => {
  const { selectedElement, setSelectedElement } = useContext(EditableContext);
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'hr' });
  };

  return (
    <hr
      onClick={handleSelect}
      style={{
        border: isSelected ? '2px dashed blue' : '1px solid #ccc',
        margin: '10px 0',
      }}
    />
  );
};

export default Hr;
