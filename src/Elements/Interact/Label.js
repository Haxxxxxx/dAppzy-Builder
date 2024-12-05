// src/Elements/Interact/Label.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Label = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Label' } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'label' });
  };

  const handleBlur = (e) => {
    if (isSelected) updateContent(id, e.target.innerText);
  };

  return (
    <label
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{ padding: '4px' }}
    >
      {content}
    </label>
  );
};

export default Label;
