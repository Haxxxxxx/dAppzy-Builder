// src/Elements/Interact/Select.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Select = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { options = ['Option 1', 'Option 2', 'Option 3'], selected = '' } = element || {};
  const isSelected = selectedElement?.id === id;
  const selectRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'select' });
  };

  const handleChange = (e) => {
    if (isSelected) updateContent(id, e.target.value);
  };

  useEffect(() => {
    if (isSelected && selectRef.current) selectRef.current.focus();
  }, [isSelected]);

  return (
    <select
      ref={selectRef}
      value={selected}
      onClick={handleSelect}
      onChange={handleChange}
      style={{
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default Select;
