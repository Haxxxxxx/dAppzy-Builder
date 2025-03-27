import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Input = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const inputElement = elements.find((el) => el.id === id);
  const { content = '', styles = {} } = inputElement || {};
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'input', styles });
  };

  const handleChange = (e) => {
    e.stopPropagation();
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
      placeholder="Enter text..."
      onClick={handleSelect}
      onChange={handleChange}
      style={{
        ...styles,
        border: '1px solid #ccc',
        padding: '5px',
        margin: '5px', fontFamily:'Montserrat'
      }}
    />
  );
};

export default Input;
