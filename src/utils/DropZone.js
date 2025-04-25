import React, { useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/Sidebar.css';
import '../components/css/dropzone.css';

const DropZone = ({ onDrop, parentId, onClick, text, className, scale, isDragging, index, onPanelToggle }) => {
  const dropRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const [{ isOver }, drop] = useDrop({
    accept: 'ELEMENT',
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if (onDrop) {
        onDrop(item, parentId);
      }
    },
    hover: (item, monitor) => {
      if (!dropRef.current) return;
      
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;

      // Calculate the mouse position relative to the drop zone
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only update position if we're not already showing the drop zone
      if (!isVisible) {
        setPosition({
          x: clientOffset.x,
          y: clientOffset.y
        });
        setIsVisible(true);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  useEffect(() => {
    if (isOver) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
      // Only hide the dropzone if it's not a default dropzone
      if (className !== 'default-dropzone' && className !== 'first-dropzone') {
        setIsVisible(false);
      }
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isOver, className]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
    // Only toggle panel if it's the first dropzone
    if (className === 'first-dropzone' && onPanelToggle) {
      onPanelToggle('sidebar');
    }
  };

  const isFirstDropzone = className === 'first-dropzone';
  const isDefaultDropzone = className === 'default-dropzone';

  return (
    <div
      ref={dropRef}
      className={`${className} ${isOver ? 'dropzone-hover' : ''} ${isDragging ? 'dropzone-active' : ''}`}
      onClick={handleClick}
      style={{
        position: isFirstDropzone ? 'absolute' : (isDefaultDropzone ? 'static' : 'absolute'),
        left: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.x),
        top: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.y),
        right: isFirstDropzone ? '0' : 'auto',
        bottom: isFirstDropzone ? '0' : 'auto',
        opacity: isFirstDropzone || isDefaultDropzone ? 1 : (isVisible ? 1 : 0),
        transition: 'all 0.3s ease',
        pointerEvents: isDragging ? 'auto' : 'none',
        transform: isFirstDropzone ? 'none' : (isDefaultDropzone ? 'none' : 'translate(-50%, -50%)'),
        zIndex: 1000,
        width: isFirstDropzone ? '100%' : (isDefaultDropzone ? '100%' : '200px'),
        height: isFirstDropzone ? '100%' : (isDefaultDropzone ? 'auto' : '20px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: isFirstDropzone || isDefaultDropzone ? '0' : '0',
      }}
    >
      <div className="dropzone-text">
        {isOver ? 'Drop here to add an element' : text || 'Drop here !'}
      </div>
    </div>
  );
};

export default DropZone;
