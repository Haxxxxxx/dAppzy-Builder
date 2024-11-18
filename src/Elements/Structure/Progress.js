// src/Elements/Interact/Progress.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Progress = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { value = 50, max = 100 } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'progress' });
  };

  return (
    <progress
      value={value}
      max={max}
      onClick={handleSelect}
      style={{ display: 'block', margin: '10px 0' }}
    >
      {value}%
    </progress>
  );
};

export default Progress;
