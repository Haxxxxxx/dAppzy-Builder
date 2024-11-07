// src/components/SpacingEditor.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { EditableContext } from '../context/EditableContext';
import { debounce } from '../utils/debounce';

const SpacingEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Initialize margin and padding states
  const [marginTop, setMarginTop] = useState('');
  const [marginRight, setMarginRight] = useState('');
  const [marginBottom, setMarginBottom] = useState('');
  const [marginLeft, setMarginLeft] = useState('');
  const [paddingTop, setPaddingTop] = useState('');
  const [paddingRight, setPaddingRight] = useState('');
  const [paddingBottom, setPaddingBottom] = useState('');
  const [paddingLeft, setPaddingLeft] = useState('');

  // Debounced handler for updating styles
  const debouncedUpdateStyle = useCallback(
    debounce((id, styleKey, value) => {
      updateStyles(id, { [styleKey]: value });
    }, 200),
    [updateStyles]
  );

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id); // Get the DOM element by ID
      if (element) {
        const computedStyles = getComputedStyle(element);
  
        // Extract values from computed styles
        const marginTopValue = computedStyles.marginTop.split(',')[0].trim();
        const marginRightValue = computedStyles.marginRight.split(',')[0].trim();
        const marginBottomValue = computedStyles.marginBottom.split(',')[0].trim();
        const marginLeftValue = computedStyles.marginLeft.split(',')[0].trim();
        const paddingTopValue = computedStyles.paddingTop.split(',')[0].trim();
        const paddingRightValue = computedStyles.paddingRight.split(',')[0].trim();
        const paddingBottomValue = computedStyles.paddingBottom.split(',')[0].trim();
        const paddingLeftValue = computedStyles.paddingLeft.split(',')[0].trim();
  
        setMarginTop(marginTopValue.replace('px', ''));
        setMarginRight(marginRightValue.replace('px', ''));
        setMarginBottom(marginBottomValue.replace('px', ''));
        setMarginLeft(marginLeftValue.replace('px', ''));
        setPaddingTop(paddingTopValue.replace('px', ''));
        setPaddingRight(paddingRightValue.replace('px', ''));
        setPaddingBottom(paddingBottomValue.replace('px', ''));
        setPaddingLeft(paddingLeftValue.replace('px', ''));
      }
    }
  }, [selectedElement, elements]);
  
  if (!selectedElement) return null;

  const { id } = selectedElement;

  // Update functions for each margin and padding property with debouncing
  const handleSpacingChange = (type, value) => {
    debouncedUpdateStyle(id, type, `${value}px`);
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
