import React, { useState, useEffect } from 'react';
import { uiStorage, STORAGE_KEYS } from '../utils/storageManager';

const MAX_SWATCHES = 12;

const loadSwatches = () => uiStorage.getColorSwatches();

const saveSwatches = (swatches) => {
  uiStorage.setColorSwatches(swatches);
};

const ColorPicker = ({ value, onChange }) => {
  const [swatches, setSwatches] = useState(loadSwatches);

  // Reload swatches from localStorage when another picker saves
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEYS.COLOR_SWATCHES) {
        setSwatches(loadSwatches());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleAddSwatch = () => {
    if (!value || swatches.includes(value)) return;
    const updated = [value, ...swatches].slice(0, MAX_SWATCHES);
    setSwatches(updated);
    saveSwatches(updated);
  };

  const handleRemoveSwatch = (e, color) => {
    e.preventDefault(); // prevent context menu
    const updated = swatches.filter(c => c !== color);
    setSwatches(updated);
    saveSwatches(updated);
  };

  return (
    <div className="color-picker-wrapper">
      <div className="color-group">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          value={value || ''}
          readOnly
          className="color-hex"
        />
        <button
          onClick={handleAddSwatch}
          aria-label="Save color"
          title="Save color"
          style={{
            background: 'none',
            border: '1px solid var(--border-color, #333)',
            borderRadius: '3px',
            color: 'var(--editor-text, #fff)',
            cursor: 'pointer',
            padding: '2px 4px',
            fontSize: '14px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bookmark_add</span>
        </button>
      </div>
      {swatches.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginTop: '6px',
        }}>
          {swatches.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              onContextMenu={(e) => handleRemoveSwatch(e, color)}
              aria-label={`Select color ${color}, right-click to remove`}
              title={`${color} — right-click to remove`}
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: color,
                border: color === value ? '2px solid var(--purple, #7c3aed)' : '1px solid var(--border-color, #333)',
                borderRadius: '3px',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
