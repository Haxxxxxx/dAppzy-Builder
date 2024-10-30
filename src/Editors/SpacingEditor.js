// src/components/SpacingEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const SpacingEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Initialize margin and padding states or pull from the selected element’s styles
  const [marginTop, setMarginTop] = useState('');
  const [marginRight, setMarginRight] = useState('');
  const [marginBottom, setMarginBottom] = useState('');
  const [marginLeft, setMarginLeft] = useState('');
  const [paddingTop, setPaddingTop] = useState('');
  const [paddingRight, setPaddingRight] = useState('');
  const [paddingBottom, setPaddingBottom] = useState('');
  const [paddingLeft, setPaddingLeft] = useState('');

  // Sync margin and padding properties when a new element is selected
  useEffect(() => {
    if (selectedElement) {
      const {
        marginTop = '', marginRight = '', marginBottom = '', marginLeft = '',
        paddingTop = '', paddingRight = '', paddingBottom = '', paddingLeft = '',
      } = elements[selectedElement.id]?.styles || {};

      setMarginTop(marginTop ? parseInt(marginTop, 10) : '');
      setMarginRight(marginRight ? parseInt(marginRight, 10) : '');
      setMarginBottom(marginBottom ? parseInt(marginBottom, 10) : '');
      setMarginLeft(marginLeft ? parseInt(marginLeft, 10) : '');
      setPaddingTop(paddingTop ? parseInt(paddingTop, 10) : '');
      setPaddingRight(paddingRight ? parseInt(paddingRight, 10) : '');
      setPaddingBottom(paddingBottom ? parseInt(paddingBottom, 10) : '');
      setPaddingLeft(paddingLeft ? parseInt(paddingLeft, 10) : '');
    }
  }, [selectedElement, elements]);

  if (!selectedElement) return null;

  const { id } = selectedElement;

  // Update functions for each margin and padding property
  const handleSpacingChange = (type, value) => {
    updateStyles(id, { [type]: `${value}px` });
  };

  return (
    <div className="spacing-editor editor">
      <h3>Edit Spacing</h3>

      {/* Margin Controls */}
      <div className="margin-controls controls">
        <label>
          Margin Top:
          <input
            type="number"
            value={marginTop}
            onChange={(e) => { setMarginTop(e.target.value); handleSpacingChange('marginTop', e.target.value); }}
          />
        </label>
        <label>
          Margin Right:
          <input
            type="number"
            value={marginRight}
            onChange={(e) => { setMarginRight(e.target.value); handleSpacingChange('marginRight', e.target.value); }}
          />
        </label>
        <label>
          Margin Bottom:
          <input
            type="number"
            value={marginBottom}
            onChange={(e) => { setMarginBottom(e.target.value); handleSpacingChange('marginBottom', e.target.value); }}
          />
        </label>
        <label>
          Margin Left:
          <input
            type="number"
            value={marginLeft}
            onChange={(e) => { setMarginLeft(e.target.value); handleSpacingChange('marginLeft', e.target.value); }}
          />
        </label>
      </div>

      {/* Padding Controls */}
      <div className="padding-controls controls">
        <label>
          Padding Top:
          <input
            type="number"
            value={paddingTop}
            onChange={(e) => { setPaddingTop(e.target.value); handleSpacingChange('paddingTop', e.target.value); }}
          />
        </label>
        <label>
          Padding Right:
          <input
            type="number"
            value={paddingRight}
            onChange={(e) => { setPaddingRight(e.target.value); handleSpacingChange('paddingRight', e.target.value); }}
          />
        </label>
        <label>
          Padding Bottom:
          <input
            type="number"
            value={paddingBottom}
            onChange={(e) => { setPaddingBottom(e.target.value); handleSpacingChange('paddingBottom', e.target.value); }}
          />
        </label>
        <label>
          Padding Left:
          <input
            type="number"
            value={paddingLeft}
            onChange={(e) => { setPaddingLeft(e.target.value); handleSpacingChange('paddingLeft', e.target.value); }}
          />
        </label>
      </div>
    </div>
  );
};

export default SpacingEditor;
