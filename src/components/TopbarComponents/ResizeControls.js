// src/components/ResizeControls.js
import React, { useState } from 'react';
import '../css/Topbar.css';

const ResizeControls = ({ scale, onResize, onScaleChange }) => {
  const [customSize, setCustomSize] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);

  const handleResize = (size) => {
    if (onResize) onResize(size);
    setSelectedSize(size);
    setCustomSize(size);
  };

  const handleCustomResize = (e) => {
    if (e.key === 'Enter') {
      const parsedSize = parseInt(customSize, 10);
      if (!isNaN(parsedSize)) {
        handleResize(parsedSize);
      }
    }
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    if (onScaleChange) onScaleChange(newScale);
  };

  return (
    <div className="resize-controls">
      <button
        className={`resize-button ${selectedSize === 1440 ? 'selected' : ''}`}
        onClick={() => handleResize(1440)}
      >
        <span className="material-symbols-outlined">computer</span>
      </button>
      <button
        className={`resize-button ${selectedSize === 1200 ? 'selected' : ''}`}
        onClick={() => handleResize(1200)}
      >
        <span className="material-symbols-outlined">laptop_mac</span>
      </button>
      <button
        className={`resize-button ${selectedSize === 768 ? 'selected' : ''}`}
        onClick={() => handleResize(768)}
      >
        <span className="material-symbols-outlined">tablet_mac</span>
      </button>
      <button
        className={`resize-button ${selectedSize === 375 ? 'selected' : ''}`}
        onClick={() => handleResize(375)}
      >
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
      <div className="scale-control">
      <span className="scale-percentage">Scale: {Math.round(scale * 100)}%</span>
        
      </div>
    </div>
  );
};

export default ResizeControls;
