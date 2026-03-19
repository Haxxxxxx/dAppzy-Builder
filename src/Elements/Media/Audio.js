import React, { useContext, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Audio = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { styles = {} } = element;
  const audioRef = useRef(null);

  const defaultSrc = 'https://www.w3schools.com/html/horse.mp3';

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'audio' });
  };

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-block',
        width: styles.width || '100%',
        ...styles,
      }}
    >
      <audio
        ref={audioRef}
        src={styles.src || defaultSrc}
        controls={styles.controls ?? true}
        loop={styles.loop || false}
        autoPlay={styles.autoplay || false}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default Audio;
