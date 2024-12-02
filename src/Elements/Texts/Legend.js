// src/Elements/Structure/Legend.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Legend = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Legend' } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'legend' });
  };

  const handleBlur = (e) => {
    if (isSelected) updateContent(id, e.target.innerText);
  };

  return (
    <legend
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{ padding: '2px', border: isSelected ? '1px dashed blue' : 'none' }}
    >
      {content}
    </legend>
  );
};

export default Legend;
