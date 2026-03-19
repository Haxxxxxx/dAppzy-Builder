import React from 'react';

const HANDLE_SIZE = 8;

const handlePositions = {
  n:  { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
  ne: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'ne-resize' },
  e:  { top: '50%', right: -HANDLE_SIZE / 2, transform: 'translateY(-50%)', cursor: 'e-resize' },
  se: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'se-resize' },
  s:  { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
  sw: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'sw-resize' },
  w:  { top: '50%', left: -HANDLE_SIZE / 2, transform: 'translateY(-50%)', cursor: 'w-resize' },
  nw: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nw-resize' },
};

const ResizeHandles = ({ onMouseDown }) => {
  return (
    <>
      {Object.entries(handlePositions).map(([pos, style]) => (
        <div
          key={pos}
          onMouseDown={(e) => onMouseDown(pos, e)}
          style={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            backgroundColor: 'var(--purple, #5C4EFA)',
            border: '1px solid #fff',
            borderRadius: 2,
            zIndex: 11,
            pointerEvents: 'auto',
            ...style,
          }}
        />
      ))}
    </>
  );
};

export default ResizeHandles;
