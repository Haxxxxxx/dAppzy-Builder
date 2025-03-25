// src/Elements/Interact/Textarea.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Textarea = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = '' } = element || {};
  const isSelected = selectedElement?.id === id;
  const textareaRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'textarea' });
  };

  const handleChange = (e) => {
    if (isSelected) updateContent(id, e.target.value);
  };

  useEffect(() => {
    if (isSelected && textareaRef.current) textareaRef.current.focus();
  }, [isSelected]);

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onClick={handleSelect}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        resize: 'vertical',
        cursor: 'text',
        border: 'none',     // Remove any border
        outline: 'none'     // Remove focus outline

      }}
    />
  );
};

export default Textarea;
