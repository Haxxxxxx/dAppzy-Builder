import React from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/Sidebar.css';

const DropZone = ({ onDrop, parentId, onClick, text }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'ELEMENT',
    drop: (item) => {
      if (onDrop) {
        onDrop(item, parentId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Force custom cursor for drop zone
  React.useEffect(() => {
    if (isOver) {
      document.body.style.cursor = 'pointer'; // Custom pointer cursor on hover
    } else {
      document.body.style.cursor = 'default'; // Reset cursor
    }
    return () => {
      document.body.style.cursor = 'default'; // Clean up on unmount
    };
  }, [isOver]);

  return (
    <div
      ref={drop}
      className="dropzone"
      style={{
        minHeight: '40px',
        backgroundColor: isOver ? 'lightgray' : 'transparent',
        border: isOver ? '2px solid #007bff' : '1px dashed #ccc',
        marginBottom: '20px',
        transition: 'background-color 0.3s, border 0.3s',
      }}
      onClick={onClick}
    >
      {isOver ? 'Release to drop here' : text || 'Click to add a section'}
    </div>
  );
};

export default DropZone;
