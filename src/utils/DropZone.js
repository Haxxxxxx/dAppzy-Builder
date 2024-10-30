// DropZone.js
import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ index, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    drop: (item) => onDrop(item, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        height: '20px',
        backgroundColor: isOver ? '#ddd' : 'transparent',
        margin: '4px 0',
      }}
    />
  );
};

// Export directly without wrapping in an object
export default DropZone;
