import React, { useContext, useRef, useEffect, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrop } from 'react-dnd';

const Video = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateStyles } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { styles = {} } = element;
  const videoRef = useRef(null);

  const defaultSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'mediaItem',
    drop: (item) => {
      if (item.mediaType === 'video') {
        updateStyles(id, { src: item.src });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'video' });
  };

  return (
    <div
      id={id}
      ref={drop}
      onClick={handleSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        border: isOver ? '2px dashed blue' : 'none',
        display: 'inline-block',
        ...styles,
      }}
    >
      <video
        ref={videoRef}
        src={styles.src || defaultSrc}
        controls
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default Video;
