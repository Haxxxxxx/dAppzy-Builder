import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import '../../components/css/LeftBar.css';

const DraggableElement = ({
  type,
  label,
  description,
  icon,
  configuration,
  styles,
  content,
  children
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: () => {
      document.body.style.cursor = 'grabbing';
      return {
        type,
        label,
        configuration,
        styles,
        content,
        children
      };
    },
    end: () => {
      document.body.style.cursor = 'default';
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    })
  }), [type, label, configuration, styles, content, children]);

  // Clean up cursor style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  // Build the icon path based on the element type
  // e.g., type = 'paragraph' => "/icons/icon-paragraph.svg"
  const iconPath = `./img/icon-${type}.svg`;
  return (
    <div className='bento-extract-display'>
      <div
        ref={drag}
        style={{
          cursor: 'grab',
          opacity: isDragging ? 0.5 : 1,
          padding: '8px',
          margin: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
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
