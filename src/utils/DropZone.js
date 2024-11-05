import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'ELEMENT',
    drop: (item) => onDrop(item), // Call onDrop with the item data
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        minHeight: '20px',
        backgroundColor: isOver ? 'lightgray' : 'transparent',
        border: '1px dashed #ccc',
        margin: '5px 0',
      }}
    >
      {isOver ? 'Release to drop' : ''}
    </div>
  );
};

export default DropZone;
