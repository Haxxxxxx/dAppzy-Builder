import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrop } from 'react-dnd';

const Image = ({ id, styles: customStyles, src, handleOpenMediaPanel = () => {} }) => {
  const { elements, setSelectedElement, updateContent } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = imageElement;
  const [newSrc, setNewSrc] = useState(content || src || '');
  const defaultSrc = 'https://via.placeholder.com/150';

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'image' });
    handleOpenMediaPanel();
  };

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        ...customStyles,
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-block',
      }}
      aria-label="Editable image"
    >
      <img
        src={newSrc || defaultSrc}
        alt="Editable element"
        style={{
          width: customStyles.width || 'auto',
          height: customStyles.height || 'auto',
          objectFit: customStyles.objectFit || 'cover',
          borderRadius: customStyles.borderRadius || '0', // Round effect
        }}
      />
    </div>
  );
};

export default Image;