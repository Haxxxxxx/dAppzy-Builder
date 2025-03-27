import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import '../../components/css/LeftBar.css';

const DraggableElement = ({ type, label, level = null, description = '' }) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type, level },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Disable default browser drag image
  useEffect(() => {
    preview(null); // Disable default drag preview
  }, [preview]);

  // Force custom cursor globally
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grab'; // Custom grab cursor
    } else {
      document.body.style.cursor = 'default'; // Reset cursor
    }

    return () => {
      document.body.style.cursor = 'default'; // Clean up on unmount
    };
  }, [isDragging]);

  // Build the icon path based on the element type
  // e.g., type = 'paragraph' => "/icons/icon-paragraph.svg"
  const iconPath = `./img/icon-${type}.svg`;
  return (
    <div className='bento-extract-display'>
      <div
        ref={drag}
        className={`draggable-element ${isDragging ? 'dragging' : ''}`}
        style={{
          cursor: isDragging ? 'grab' : 'grab', // Consistent cursor
          opacity: isDragging ? 0.5 : 1,
          padding: '8px',
          margin: '8px 0',
          borderRadius: '4px',
          color: '#686868',
          position:'relative',
        }}
      >
        {/* Icon display */}
        <div style={{ marginBottom: '4px'}}>
          <img
            src={iconPath}
            alt={type}
            onError={(e) => {
              // Optional: fallback if the icon is missing
              e.target.src = '/icons/icon-default.svg';
            }}
          />
        </div>
       
      </div>
      {/* Label under the draggable container */}
      <strong className='element-name'>{label}</strong>
    </div>
  );
};

export default DraggableElement;
