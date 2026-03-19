import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Progress = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { styles = {} } = element;

  const value = parseFloat(styles.value) || 60;
  const max = parseFloat(styles.max) || 100;
  const barColor = styles.backgroundColor || '#5c4efa';
  const trackColor = styles.trackColor || '#e0e0e0';
  const label = styles.label || '';

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'progress' });
  };

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        width: styles.width || '100%',
        cursor: 'pointer',
        padding: styles.padding || '4px 0',
      }}
    >
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: '14px',
          fontFamily: 'Montserrat',
          color: '#333',
        }}>
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: styles.height || '8px',
          backgroundColor: trackColor,
          borderRadius: styles.borderRadius || '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: styles.borderRadius || '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export default Progress;
