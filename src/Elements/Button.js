// src/Texts/Button.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const Button = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const { content, styles } = elements[id] || {};

  const handleSelect = () => {
    setSelectedElement({ id, type: 'button' });
  };

  return (
    <button
      onClick={handleSelect}
      style={styles}
    >
        {content || 'Click Me!'}
        </button>
  );
};

export default Button;
