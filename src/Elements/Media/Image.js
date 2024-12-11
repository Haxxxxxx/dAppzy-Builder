import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrop } from 'react-dnd';

const Image = ({ id, styles: customStyles, src, handleOpenMediaPanel = () => {}, handleDrop }) => {
  const { elements, setSelectedElement } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { content = '' } = imageElement;
  const [newSrc, setNewSrc] = useState(content || src || '');
  const defaultSrc = 'https://via.placeholder.com/150';

  // Drag-and-Drop Logic
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'mediaItem',
    drop: (item) => {
      handleDrop(item, id);
      setNewSrc(item.src);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'image' });
    handleOpenMediaPanel();
  };
  console.log(customStyles);
  return (
    <div
      id={id}
      ref={drop}
      onClick={handleSelect}
      style={{
        ...customStyles,
        border: isOver ? '2px dashed green' : 'none',
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
          borderRadius: customStyles.borderRadius || '0',
        }}
      />
    </div>
  );
};

export default Image;
