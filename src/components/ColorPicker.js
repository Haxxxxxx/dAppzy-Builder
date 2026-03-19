import React, { useState, useEffect } from 'react';
import { uiStorage, STORAGE_KEYS } from '../utils/storageManager';

const MAX_SWATCHES = 12;

// Convert any CSS color string to #rrggbb for <input type="color">
const toHex = (color) => {
  if (!color) return '#000000';
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return '#' + color[1]+color[1] + color[2]+color[2] + color[3]+color[3];
  }
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match;
    return '#' + [r, g, b].map(c => Number(c).toString(16).padStart(2, '0')).join('');
  }
  return '#000000';
};

const loadSwatches = () => uiStorage.getColorSwatches();

const saveSwatches = (swatches) => {
  uiStorage.setColorSwatches(swatches);
};

const ColorPicker = ({ value, onChange }) => {
  const [swatches, setSwatches] = useState(loadSwatches);
  const [hexInput, setHexInput] = useState(value || '');

  // Keep local input in sync when value changes externally (e.g. color picker wheel)
  useEffect(() => {
    setHexInput(value || '');
  }, [value]);

  const handleHexInputChange = (e) => {
    const raw = e.target.value;
    setHexInput(raw);

    // Normalise: prepend # if missing
    const normalised = raw.startsWith('#') ? raw : `#${raw}`;

    // Validate: 3, 4, 6, or 8 hex digits after #
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(normalised)) {
      onChange(normalised);
    }
  };

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
          value={toHex(value)}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          className="color-hex"
          spellCheck={false}
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
