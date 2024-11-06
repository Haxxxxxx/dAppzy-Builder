// DropZone.js
import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ onDrop, parentId, onClick }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'ELEMENT',
    drop: (item) => onDrop(item, parentId),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        minHeight: '40px',
        backgroundColor: isOver ? 'lightgray' : 'transparent',
        border: '1px dashed #ccc',
        margin: '10px 0',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {isOver ? 'Release to drop here' : 'Click to add a section'}
    </div>
  );
};

export default DropZone;
