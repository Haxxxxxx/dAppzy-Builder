import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const BorderEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  const [borderWidth, setBorderWidth] = useState('');
  const [borderStyle, setBorderStyle] = useState('');
  const [borderColor, setBorderColor] = useState('');

  useEffect(() => {
    if (selectedElement) {
      const element = elements.find((el) => el.id === selectedElement.id);

      if (element) {
        const { borderWidth = '0', borderStyle = 'none', borderColor = '#000000' } = element.styles || {};

        setBorderWidth(borderWidth.replace('px', ''));
        setBorderStyle(borderStyle);
        setBorderColor(borderColor);
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
    <div className="editor-section">
      <h4 className="editor-title">Border Settings</h4>
      <div className="editor-group">
        <label>Border Width</label>
        <input
          type="number"
          value={borderWidth}
          onChange={handleBorderWidthChange}
          min="0"
          className="editor-input"
        />
      </div>
      <div className="editor-group">
        <label>Border Style</label>
        <select value={borderStyle} onChange={handleBorderStyleChange} className="editor-select">
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
      </div>
      <div className="editor-group">
        <label>Border Color</label>
        <div className="color-group">
          <input
            type="color"
            value={borderColor}
            onChange={handleBorderColorChange}
            className="editor-color"
          />
          <input
            type="text"
            value={borderColor}
            readOnly
            className="color-hex"
          />
        </div>
      </div>
    </div>
  );
};

export default BorderEditor;
