import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Input = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const inputElement = elements.find((el) => el.id === id);
  const { content = '', styles = {} } = inputElement || {};
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent propagation to parent elements
    setSelectedElement({ id, type: 'input', styles });
  };

  const handleChange = (e) => {
    e.stopPropagation(); // Prevent propagation during input change
    updateContent(id, e.target.value);
  };

  useEffect(() => {
    if (selectedElement?.id === id && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <input
      id={id}
      ref={inputRef}
      value={content}
      onClick={handleSelect}
      onChange={handleChange}
      style={{
        ...styles,
        border: selectedElement?.id === id ? '1px dashed blue' : '1px solid #ccc', // Add visual cue for selected input
        padding: '5px',
        margin: '5px',
      }}
    />
  );
};

export default Input;
