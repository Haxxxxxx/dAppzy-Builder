import React from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/Sidebar.css';
import '../components/css/dropzone.css'


const DropZone = ({ onDrop, parentId, onClick, text, className, scale }) => {
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

  // Dynamically adjust the size based on scale
  const dropzoneStyle =
    className === 'first-dropzone'
      ? {
          width: `${10 * scale}%`,
          position: 'absolute',
          top: '40%',
          left: '45%',
        }
      : {};

  return (
    <div
      ref={drop}
      className={`${className} ${isOver ? 'dropzone-hover' : ''}`}
      style={dropzoneStyle}
      onClick={onClick}
    >
      <div className="dropzone-text">
        {isOver ? 'Drop here to add an element' : text || 'Click to add a section'}
      </div>
    </div>
  );
};

export default DropZone;
