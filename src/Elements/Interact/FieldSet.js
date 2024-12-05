// src/Elements/Structure/Fieldset.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Fieldset = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'fieldset' });
  };

  return (
    <fieldset
      onClick={handleSelect}
      style={{
        padding: '10px',
        margin: '10px 0',
      }}
    >
      {element?.content || 'Fieldset Content'}
    </fieldset>
  );
};

export default Fieldset;
