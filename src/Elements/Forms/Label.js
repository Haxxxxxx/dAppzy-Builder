import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Label = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  // Use default text "Label" if no content exists (or if content is whitespace)
  const content = element?.content?.trim() || 'Label';
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'label' });
  };

  const handleBlur = (e) => {
    if (isSelected) updateContent(id, e.target.innerText || 'Label');
  };

  return (
    <label
      contentEditable={isSelected}
      suppressContentEditableWarning={true}
      onClick={handleSelect}
      onBlur={handleBlur}
      style={{ padding: '4px', cursor: 'text', fontFamily:'Montserrat' }}
    >
      {content}
    </label>
  );
};

export default Label;
