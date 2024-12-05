// src/Elements/Media/Image.js
import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrop } from 'react-dnd';

const Image = ({ id, styles: customStyles, src, isLogo, isPreviewMode }) => {
  const { elements, updateContent, setSelectedElement } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = imageElement;
  const [newSrc, setNewSrc] = useState(content || src || '');
  const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });

  const defaultSrc = `https://via.placeholder.com/150`;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'image' });

  };




  // Setup drop functionality
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'mediaItem',
    drop: (item) => {
      if (item.mediaType === 'image') {
        updateContent(id, item.src);
        setNewSrc(item.src);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Function to handle image load and get its natural dimensions
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  };

  return (
    <div
      id={id}
      onClick={handleSelect}
      ref={drop}
      style={{
        ...styles,
        ...customStyles,
        ...(isLogo && {
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          overflow: 'hidden',
        }),
        position: 'relative',
        cursor: 'pointer',
        border: isOver ? '2px dashed blue' : 'none',
        display: 'inline-block', // Ensure the div doesn't take full width
      }}
      aria-label="Editable image"
    >
      <img
        src={content || src || defaultSrc}
        alt="Editable element"
        onLoad={handleImageLoad}
        style={{
          objectFit: 'contain',
          ...(imageDimensions.width && imageDimensions.height
            ? {
                width: imageDimensions.width,
                height: imageDimensions.height,
              }
            : {}),
          ...(isLogo && {
            borderRadius: '50%',
          }),
        }}
      />
    </div>
  );
};

export default Image;
