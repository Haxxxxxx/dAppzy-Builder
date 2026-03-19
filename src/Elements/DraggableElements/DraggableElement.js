import React, { useState } from 'react';
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
    type,
    item: { type, label, configuration, styles, content, children },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, label, configuration, styles, content, children]);

  const [iconError, setIconError] = useState(false);
  const iconPath = icon || `/img/icon-${type}.svg`;

  return (
    <div className="bento-extract-display">
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
          gap: '8px',
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          {!iconError ? (
            <img
              src={iconPath}
              alt={type}
              onError={() => setIconError(true)}
            />
          ) : (
            <div style={{
              width: '67px',
              height: '67px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #838389',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#838389',
              textTransform: 'uppercase',
            }}>
              {type.slice(0, 3)}
            </div>
          )}
        </div>
      </div>
      <strong className="element-name">{label}</strong>
    </div>
  );
};

export default DraggableElement;
