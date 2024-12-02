import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Code = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  let { content = 'Code snippet...' } = element || {};
  const isSelected = selectedElement?.id === id;

  // Ensure content is a string
  if (typeof content !== 'string') {
    console.warn(`Invalid content type for code with ID ${id}. Converting to string.`);
    content = String(content); // Convert to string
  }

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'code' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      const newContent = e.target.innerText.trim();
      updateContent(id, newContent || 'Code snippet...'); // Provide fallback if empty
    }
  };

  return (
    <code
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{
        padding: '4px',
        backgroundColor: '#f5f5f5',
        borderRadius: '3px',
        border: isSelected ? '1px dashed blue' : 'none',
        fontFamily: 'monospace',
      }}
    >
      {content}
    </code>
  );
};

export default Code;
