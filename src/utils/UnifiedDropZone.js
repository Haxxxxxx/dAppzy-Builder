import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import '../components/css/dropzone.css';

const UnifiedDropZone = React.memo(({ 
  onDrop, 
  parentId, 
  onClick, 
  text, 
  className, 
  scale, 
  isDragging, 
  index, 
  onPanelToggle,
  accept = ['ELEMENT', 'IMAGE', 'SPAN', 'BUTTON', 'CONNECT_WALLET_BUTTON', 'LINK', 'PARAGRAPH', 'HEADING', 'LIST', 'LIST_ITEM', 'BLOCKQUOTE', 'CODE', 'PRE', 'CAPTION', 'LEGEND', 'LINK_BLOCK']
}) => {
  const dropRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleInteraction = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'click' && onClick) {
      onClick(e);
    }
    
    if (className === 'first-dropzone' && onPanelToggle) {
      onPanelToggle('sidebar');
    }
  }, [onClick, className, onPanelToggle]);

  const [{ isOver }, drop] = useDrop({
    accept,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if (onDrop) {
        onDrop(item, parentId);
      }
      // Reset hover state after drop
      setIsHovered(false);
      setIsVisible(false);
    },
    hover: (item, monitor) => {
      if (!dropRef.current) return;
      
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;

      // Account for scroll position
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Calculate position relative to viewport
      const position = {
        x: clientOffset.x - scrollX,
        y: clientOffset.y - scrollY
      };
      
      setPosition(position);
      setIsHovered(true);
      setIsVisible(true);
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
      setIsHovered(true);
      setIsVisible(true);
    } else {
      document.body.style.cursor = 'default';
      setIsHovered(false);
      if (className !== 'default-dropzone' && className !== 'first-dropzone') {
        setIsVisible(false);
      }
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isOver, className]);

  // Reset visibility when dragging stops
  useEffect(() => {
    if (!isDragging) {
      setIsHovered(false);
      if (className !== 'default-dropzone' && className !== 'first-dropzone') {
        setIsVisible(false);
      }
    }
  }, [isDragging, className]);

  const isFirstDropzone = className === 'first-dropzone';
  const isDefaultDropzone = className === 'default-dropzone';

  return (
    <div
      ref={dropRef}
      className={`unified-dropzone ${className} ${isHovered ? 'dropzone-hover' : ''} ${isDragging ? 'dropzone-active' : ''}`}
      onClick={handleInteraction}
      style={{
        position: isFirstDropzone ? 'absolute' : (isDefaultDropzone ? 'static' : 'absolute'),
        left: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.x),
        top: isFirstDropzone ? '0' : (isDefaultDropzone ? 'auto' : position.y),
        right: isFirstDropzone ? '0' : 'auto',
        bottom: isFirstDropzone ? '0' : 'auto',
        opacity: isFirstDropzone || isDefaultDropzone ? 1 : (isVisible ? 1 : 0),
        transition: 'all 0.2s ease',
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
        {isHovered ? 'Drop here to add an element' : text || 'Drop here !'}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isOver === nextProps.isOver &&
    prevProps.scale === nextProps.scale &&
    prevProps.className === nextProps.className
  );
});

export default UnifiedDropZone; 