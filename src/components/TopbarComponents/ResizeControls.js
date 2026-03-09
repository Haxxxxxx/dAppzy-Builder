// src/components/ResizeControls.js
import React, { useState, useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';
import '../css/Topbar.css';

const ResizeControls = ({ scale, onResize, onScaleChange }) => {
  const [customSize, setCustomSize] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const { setActiveBreakpoint } = useContext(EditableContext);

  const sizeToBreakpoint = (size) => {
    if (size <= 480) return 'mobile';
    if (size <= 768) return 'tablet';
    return 'desktop';
  };

  const handleResize = (size) => {
    if (onResize) onResize(size);
    setSelectedSize(size);
    setCustomSize(size);
    setActiveBreakpoint(sizeToBreakpoint(size));
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
        <button className="zoom-btn" onClick={() => onScaleChange(Math.round(Math.max(0.25, scale - 0.1) * 10) / 10)} title="Zoom out">
          <span className="material-symbols-outlined">remove</span>
        </button>
        <span className="scale-percentage">{Math.round(scale * 100)}%</span>
        <button className="zoom-btn" onClick={() => onScaleChange(Math.round(Math.min(2, scale + 0.1) * 10) / 10)} title="Zoom in">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="zoom-btn" onClick={() => onScaleChange(1)} title="Reset zoom">
          <span className="material-symbols-outlined">fit_screen</span>
        </button>
      </div>
    </div>
  );
};

export default ResizeControls;
