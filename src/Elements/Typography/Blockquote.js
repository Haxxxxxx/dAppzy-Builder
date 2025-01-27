import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Blockquote = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  let { content = 'Blockquote text...' } = element || {};
  const isSelected = selectedElement?.id === id;

  // Ensure content is a string
  if (typeof content !== 'string') {
    console.warn(`Invalid content type for blockquote with ID ${id}. Converting to string.`);
    content = String(content); // Convert to string
  }

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'blockquote' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      const newContent = e.target.innerText.trim();
      updateContent(id, newContent || 'Blockquote text...'); // Provide fallback if empty
    }
  };

  return (
    <blockquote
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{
        borderLeft: '4px solid #ccc',
        paddingLeft: '10px',
        margin: '10px 0',
        fontStyle: 'italic',
      }}
    >
      {content}
    </blockquote>
  );
};

export default Blockquote;
