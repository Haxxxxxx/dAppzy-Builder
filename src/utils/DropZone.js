import React from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/Sidebar.css';
import '../components/css/dropzone.css'


const DropZone = ({ onDrop, parentId, onClick, text, className }) => {
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

  React.useEffect(() => {
    if (isOver) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isOver]);

  return (
    <div
      ref={drop}
      className={`dropzone ${className} ${isOver ? 'dropzone-hover' : ''}`}
      onClick={onClick}
    >
      <div className="dropzone-text">
        {isOver ? 'Drop here to add an element' : text || 'Click to add a section'}
      </div>
    </div>
  );
};

export default DropZone;
