import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

const RemovableWrapper = ({ id, children, styles = {} }) => {
  const { handleRemoveElement } = useContext(EditableContext);

  return (
    <div style={{ position: 'relative', ...styles }}>
      {children}
      <button
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          border: 'none',
          background: 'red',
          color: 'white',
          borderRadius: '50%',
          cursor: 'pointer',
        }}
        onClick={() => handleRemoveElement(id)}
      >
        ✕
      </button>
    </div>
  );
};

export default RemovableWrapper;
