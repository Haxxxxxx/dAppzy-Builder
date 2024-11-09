// DefaultFooter.js
import React from 'react';

const DefaultFooter = ({ id }) => {
  return (
    <div
      id={id}
      style={{
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#e0e0e0',
        border: '2px solid #333',
        borderRadius: '8px',
      }}
    >
      <p>Default Footer Content</p>
    </div>
  );
};

export default DefaultFooter;
