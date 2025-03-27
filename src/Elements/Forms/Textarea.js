import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Textarea = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  // Default content is empty string; placeholder will show if content is empty.
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
      placeholder="Enter text here..."
      onClick={handleSelect}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '8px',
        border: 'none',
        outline: 'none',
        resize: 'vertical',
        cursor: 'text', fontFamily:'Montserrat'
        
      }}
    />
  );
};

export default Textarea;
