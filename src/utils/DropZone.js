import React from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/Sidebar.css';
import '../components/css/dropzone.css';

const DropZone = ({ onDrop, parentId, onClick, text, className, scale }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'ELEMENT',
    drop: (item, monitor) => {
      // Only trigger the drop if this is the shallow (most specific) drop target.
      if (monitor.didDrop()) {
        return;
      }
      if (onDrop) {
        onDrop(item, parentId);
      }
    },
    collect: (monitor) => ({
      // Use shallow so that only the topmost drop zone that is hovered is considered.
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  React.useEffect(() => {
    document.body.style.cursor = isOver ? 'grab' : 'default';
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isOver]);


  return (
    <div
      ref={drop}
      className={`${className} ${isOver ? 'dropzone-hover' : ''}`}
      onClick={onClick}
    >
      <div className="dropzone-text">
        {isOver ? 'Drop here to add an element' : text || 'Drop here !'}
      </div>
    </div>
  );
};

export default DropZone;
