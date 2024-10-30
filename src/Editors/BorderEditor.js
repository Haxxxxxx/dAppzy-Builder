// src/components/BorderEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const BorderEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Default border settings or pull existing border styles from the selected element
  const [borderWidth, setBorderWidth] = useState('');
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderColor, setBorderColor] = useState('#000000');

  // Sync border properties when a new element is selected
  useEffect(() => {
    if (selectedElement) {
      const { borderWidth = '', borderStyle = 'solid', borderColor = '#000000' } =
        elements[selectedElement.id]?.styles || {};
      setBorderWidth(borderWidth ? parseInt(borderWidth, 10) : '');
      setBorderStyle(borderStyle);
      setBorderColor(borderColor);
    }
  }, [selectedElement, elements]);

  if (!selectedElement) return null;

  const { id } = selectedElement;

  // Handle updates to the border styles
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
          <option value="solid">Solid</option>
          <option value="dotted">Dotted</option>
          <option value="dashed">Dashed</option>
          <option value="double">Double</option>
          <option value="groove">Groove</option>
          <option value="ridge">Ridge</option>
          <option value="inset">Inset</option>
          <option value="outset">Outset</option>
          <option value="none">None</option>
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
