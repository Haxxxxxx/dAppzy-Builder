import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Pre = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  let { content = 'Preformatted text...' } = element || {};
  const isSelected = selectedElement?.id === id;

  // Ensure content is a string
  if (typeof content !== 'string') {
    console.warn(`Invalid content type for pre with ID ${id}. Converting to string.`);
    content = String(content); // Convert to string
  }

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'pre' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      const newContent = e.target.innerText.trim();
      updateContent(id, newContent || 'Preformatted text...'); // Provide fallback if empty
    }
  };

  return (
    <pre
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '3px',
        overflow: 'auto',
        border: isSelected ? '1px dashed blue' : 'none',
      }}
    >
      {content}
    </pre>
  );
};

export default Pre;
