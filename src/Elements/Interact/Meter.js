// src/Elements/Interact/Meter.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Meter = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { value = 0.5, min = 0, max = 1 } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'meter' });
  };

  return (
    <meter
      value={value}
      min={min}
      max={max}
      onClick={handleSelect}
      style={{ display: 'block', margin: '10px 0' }}
    >
      {value}
    </meter>
  );
};

export default Meter;
