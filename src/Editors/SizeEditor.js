import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const SizeEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);
        setWidth(parseFloat(computedStyles.width) || '');
        setHeight(parseFloat(computedStyles.height) || '');
      }
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleWidthChange = (e) => {
    const newWidth = e.target.value;
    setWidth(newWidth);
    updateStyles(selectedElement.id, { width: `${newWidth}px` });
  };

  const handleHeightChange = (e) => {
    const newHeight = e.target.value;
    setHeight(newHeight);
    updateStyles(selectedElement.id, { height: `${newHeight}px` });
  };

  return (
    <div className="editor-section">
      <h4 className="editor-title">Size Settings</h4>
      <div className="editor-group">
        <label>Width</label>
        <input
          type="number"
          value={width}
          onChange={handleWidthChange}
          min="0"
          className="editor-input"
        />
      </div>
      <div className="editor-group">
        <label>Height</label>
        <input
          type="number"
          value={height}
          onChange={handleHeightChange}
          min="0"
          className="editor-input"
        />
      </div>
    </div>
  );
};

export default SizeEditor;
