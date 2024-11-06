// src/Elements/Input.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const Input = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const inputElement = elements.find((el) => el.id === id);
  const { content, styles } = inputElement || {};

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'input' });
  };

  const handleChange = (e) => {
    updateContent(id, e.target.value);
  };

  return (
    <input
      id={id}
      value={content || ''}
      onClick={handleSelect}
      onChange={handleChange}
      style={{ ...styles, padding: '5px', margin: '5px', border: '1px solid #ccc' }}
    />
  );
};

export default Input;
