// src/Elements/Media/Video.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Video = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { src = 'https://www.w3schools.com/html/mov_bbb.mp4', controls = true } = element || {};
  const isSelected = selectedElement?.id === id;
  const videoRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'video' });
  };

  useEffect(() => {
    if (isSelected && videoRef.current) videoRef.current.focus();
  }, [isSelected]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls={controls}
      onClick={handleSelect}
      style={{ width: '100%', border: isSelected ? '1px dashed blue' : 'none' }}
    />
  );
};

export default Video;
