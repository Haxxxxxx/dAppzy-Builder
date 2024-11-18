// src/Elements/Media/Audio.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Audio = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { src = 'https://www.w3schools.com/html/horse.ogg', controls = true } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'audio' });
  };

  return (
    <audio
      src={src}
      controls={controls}
      onClick={handleSelect}
      style={{ border: isSelected ? '1px dashed blue' : 'none' }}
    />
  );
};

export default Audio;
