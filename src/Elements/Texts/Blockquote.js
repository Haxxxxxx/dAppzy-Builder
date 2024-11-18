// src/Elements/Texts/Blockquote.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Blockquote = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Blockquote text...' } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'blockquote' });
  };

  const handleBlur = (e) => {
    if (isSelected) updateContent(id, e.target.innerText);
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
        border: isSelected ? '1px dashed blue' : 'none',
      }}
    >
      {content}
    </blockquote>
  );
};

export default Blockquote;
