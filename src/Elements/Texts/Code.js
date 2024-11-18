// src/Elements/Texts/Code.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Code = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Code snippet...' } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'code' });
  };

  const handleBlur = (e) => {
    if (isSelected) updateContent(id, e.target.innerText);
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
      }}
    >
      {content}
    </code>
  );
};

export default Code;
