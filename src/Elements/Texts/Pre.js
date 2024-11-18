// src/Elements/Texts/Pre.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Pre = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Preformatted text...' } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'pre' });
  };

  const handleBlur = (e) => {
    if (isSelected) updateContent(id, e.target.innerText);
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
