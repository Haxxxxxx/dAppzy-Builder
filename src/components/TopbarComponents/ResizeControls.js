// src/components/ResizeControls.js
import React, { useState } from 'react';

const ResizeControls = ({ scale, onResize }) => {
  const [customSize, setCustomSize] = useState('');

  const handleResize = (size) => {
    if (onResize) onResize(size);
  };

  const handleCustomResize = (e) => {
    if (e.key === 'Enter') {
      const parsedSize = parseInt(customSize, 10);
      if (!isNaN(parsedSize)) {
        handleResize(parsedSize);
      }
    }
  };

  return (
    <div className="resize-controls">
      <button className="resize-button" onClick={() => handleResize(1440)}>
        <span className="material-symbols-outlined">computer</span>
      </button>
      <button className="resize-button" onClick={() => handleResize(1200)}>
        <span className="material-symbols-outlined">laptop_mac</span>
      </button>
      <button className="resize-button" onClick={() => handleResize(768)}>
        <span className="material-symbols-outlined">tablet_mac</span>
      </button>
      <button className="resize-button" onClick={() => handleResize(375)}>
        <span className="material-symbols-outlined">smartphone</span>
      </button>
      <input
        type="text"
        className="input"
        placeholder="Custom size (px)"
        value={customSize}
        onChange={(e) => setCustomSize(e.target.value)}
        onKeyDown={handleCustomResize}
      />
      <span className="scale-percentage">Scale: {Math.round(scale * 100)}%</span>
    </div>
  );
};

export default ResizeControls;
