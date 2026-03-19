import React from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const BackToTop = ({ id }) => {
  const { element, styles, handleSelect } = useInteractiveElement(id, 'backToTop');

  const activeColor = styles.activeColor || '#5C4EFA';
  const size = styles.buttonSize || '48px';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: styles.borderRadius || '50%',
        backgroundColor: activeColor,
        color: styles.color || '#fff',
        cursor: 'pointer',
        boxShadow: styles.boxShadow || '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '20px',
        transition: 'all 0.2s ease',
        ...styles,
      }}
    >
      ↑
    </div>
  );
};

export default BackToTop;
