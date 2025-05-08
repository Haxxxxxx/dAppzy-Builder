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
  accept = ['ELEMENT', 'IMAGE', 'SPAN', 'BUTTON', 'CONNECT_WALLET_BUTTON', 'LINK', 'PARAGRAPH', 'HEADING', 'LIST', 'LIST_ITEM', 'BLOCKQUOTE', 'CODE', 'PRE', 'CAPTION', 'LEGEND', 'LINK_BLOCK', 'SECTION']
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

  const handleLibraryClick = (e) => {
    e.stopPropagation();
    if (onPanelToggle) {
      onPanelToggle('sidebar');
    }
  };

  const handleConfigureClick = (e) => {
    e.stopPropagation();
    if (onPanelToggle) {
      onPanelToggle('settings');
    }
  };

  const [{ isOver, draggedItem }, drop] = useDrop({
    accept,
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
      
      // Don't show dropzone if:
      // 1. Dragging a section or configured div
      // 2. Dragging a section into another section's content area
      const isDraggingSection = item.type === 'SECTION';
      const isDraggingConfiguredDiv = item.type === 'DIV' && item.configuration;
      const isContentSection = parentId && parentId.includes('-content');
      
      if (isDraggingSection || isDraggingConfiguredDiv || (isDraggingSection && isContentSection)) {
        setIsVisible(false);
        return;
      }
      
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
      draggedItem: monitor.getItem()
    }),
  });

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  // Don't render if:
  // 1. Dragging a section or configured div
  // 2. Dragging a section into another section's content area
  const isDraggingSection = draggedItem?.type === 'SECTION';
  const isDraggingConfiguredDiv = draggedItem?.type === 'DIV' && draggedItem?.configuration;
  const isContentSection = parentId && parentId.includes('-content');

  if (draggedItem && (isDraggingSection || isDraggingConfiguredDiv || (isDraggingSection && isContentSection))) {
    return null;
  }

  const isFirstDropzone = className === 'first-dropzone';
  const isDefaultDropzone = className === 'default-dropzone';

  return (
    <div
      ref={dropRef}
      className={`unified-dropzone ${className} ${isOver ? 'dropzone-hover' : ''} ${isDragging ? 'dropzone-active' : ''}`}
      onClick={handleInteraction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        height: isFirstDropzone ? '100%' : (isDefaultDropzone ? 'auto' : '20px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: isFirstDropzone || isDefaultDropzone ? '0' : '0',
      }}
    >
      <div className="dropzone-content">
        {(isDefaultDropzone || isFirstDropzone) ? (
          <div className="dropzone-buttons">
            <button 
              className="dropzone-button library-button"
              onClick={handleLibraryClick}
            >
              <span className="button-icon">📚</span>
              <span className="button-text">Select from Library</span>
            </button>
            <button 
              className="dropzone-button configure-button"
              onClick={handleConfigureClick}
            >
              <span className="button-icon">⚙️</span>
              <span className="button-text">Configure Layout</span>
            </button>
          </div>
        ) : (
          <div className="dropzone-text">
            {isOver ? 'Drop here to add an element' : text || 'Drop here !'}
          </div>
        )}
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