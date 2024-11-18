// src/Elements/Media/Iframe.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Iframe = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { src = 'https://www.example.com', width = '100%', height = '300px' } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'iframe' });
  };

  return (
    <iframe
      src={src}
      width={width}
      height={height}
      onClick={handleSelect}
      style={{ border: isSelected ? '1px dashed blue' : 'none' }}
    />
  );
};

export default Iframe;
