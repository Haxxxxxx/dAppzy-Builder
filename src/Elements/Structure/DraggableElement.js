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

  return (
    <div
      ref={drag}
      className={`draggable-element ${isDragging ? 'dragging' : ''}`}
      style={{
        cursor: isDragging ? 'grab' : 'grab', // Consistent cursor during drag
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '8px',
      }}
    >
      <div>
        <strong>{label}</strong>
      </div>
      {description && (
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          {description}
        </div>
      )}
    </div>
  );
};

export default DraggableElement;
