import React from 'react';
import { useDrop } from 'react-dnd';

const DropZone = ({ onDrop, parentId }) => {
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
      }}
    >
      {isOver ? 'Release to drop here' : ''}
    </div>
  );
};

export default DropZone;
