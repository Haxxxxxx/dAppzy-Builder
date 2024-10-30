// src/components/BorderEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

// Helper function to convert RGB color to hex
const rgbToHex = (rgb) => {
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  return result
    ? `#${((1 << 24) + (parseInt(result[1]) << 16) + (parseInt(result[2]) << 8) + parseInt(result[3]))
        .toString(16)
        .slice(1)
        .toUpperCase()}`
    : rgb;
};

const BorderEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  const [borderWidth, setBorderWidth] = useState('');
  const [borderStyle, setBorderStyle] = useState('');
  const [borderColor, setBorderColor] = useState('');

  useEffect(() => {
    if (selectedElement) {
      // Get the element's stored styles directly from elements array
      const element = elements.find(el => el.id === selectedElement.id);

      if (element) {
        const { borderWidth = '0', borderStyle = 'none', borderColor = '#000000' } = element.styles || {};

        setBorderWidth(borderWidth.replace('px', ''));
        setBorderStyle(borderStyle);
        setBorderColor(rgbToHex(borderColor));
      }
    }
  }, [selectedElement, elements]);

  if (!selectedElement) return null;

  const { id } = selectedElement;

  const handleBorderWidthChange = (e) => {
    const newWidth = e.target.value;
    setBorderWidth(newWidth);
    updateStyles(id, { borderWidth: `${newWidth}px` });
  };

  const handleBorderStyleChange = (e) => {
    const newStyle = e.target.value;
    setBorderStyle(newStyle);
    updateStyles(id, { borderStyle: newStyle });
  };

  const handleBorderColorChange = (e) => {
    const newColor = e.target.value;
    setBorderColor(newColor);
    updateStyles(id, { borderColor: newColor });
  };

  return (
    <div className="border-editor editor">
      <h3>Edit Border Styles</h3>

      {/* Border Width */}
      <label>
        Border Width:
        <input
          type="number"
          value={borderWidth}
          onChange={handleBorderWidthChange}
          min="0"
        />
      </label>

      {/* Border Style */}
      <label>
        Border Style:
        <select value={borderStyle} onChange={handleBorderStyleChange}>
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dotted">Dotted</option>
          <option value="dashed">Dashed</option>
          <option value="double">Double</option>
          <option value="groove">Groove</option>
          <option value="ridge">Ridge</option>
          <option value="inset">Inset</option>
          <option value="outset">Outset</option>
        </select>
      </label>

      {/* Border Color */}
      <label>
        Border Color:
        <input
          type="color"
          value={borderColor}
          onChange={handleBorderColorChange}
        />
      </label>
    </div>
  );
};

export default BorderEditor;
