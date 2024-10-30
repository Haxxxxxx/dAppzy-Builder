// src/components/SizeEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const SizeEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Default size values or pull existing sizes from the selected element
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  // Sync size properties when a new element is selected
  useEffect(() => {
    if (selectedElement) {
      const { width = '', height = '' } = elements[selectedElement.id]?.styles || {};
      setWidth(width ? parseInt(width, 10) : '');
      setHeight(height ? parseInt(height, 10) : '');
    }
  }, [selectedElement, elements]);

  if (!selectedElement) return null;

  const { id } = selectedElement;

  // Handle updates to width and height
  const handleWidthChange = (e) => {
    const newWidth = e.target.value;
    setWidth(newWidth);
    updateStyles(id, { width: `${newWidth}px` });
  };

  const handleHeightChange = (e) => {
    const newHeight = e.target.value;
    setHeight(newHeight);
    updateStyles(id, { height: `${newHeight}px` });
  };

  return (
    <div className="size-editor editor">
      <h3>Edit Size</h3>

      {/* Width */}
      <label>
        Width:
        <input
          type="number"
          value={width}
          onChange={handleWidthChange}
          min="0"
        />
      </label>

      {/* Height */}
      <label>
        Height:
        <input
          type="number"
          value={height}
          onChange={handleHeightChange}
          min="0"
        />
      </label>
    </div>
  );
};

export default SizeEditor;
