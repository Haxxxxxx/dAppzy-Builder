// src/components/SpacingEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/SpacingEditor.css';

const SpacingEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [margin, setMargin] = useState({ top: '', right: '', bottom: '', left: '' });
  const [padding, setPadding] = useState({ top: '', right: '', bottom: '', left: '' });

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);

        setMargin({
          top: parseFloat(computedStyles.marginTop) || 0,
          right: parseFloat(computedStyles.marginRight) || 0,
          bottom: parseFloat(computedStyles.marginBottom) || 0,
          left: parseFloat(computedStyles.marginLeft) || 0,
        });

        setPadding({
          top: parseFloat(computedStyles.paddingTop) || 0,
          right: parseFloat(computedStyles.paddingRight) || 0,
          bottom: parseFloat(computedStyles.paddingBottom) || 0,
          left: parseFloat(computedStyles.paddingLeft) || 0,
        });
      }
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleSpacingChange = (type, direction, value) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (type === 'margin') {
      setMargin(prev => ({ ...prev, [direction]: numericValue }));
      updateStyles(selectedElement.id, {
        [`margin${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: `${numericValue}px`
      });
    } else {
      setPadding(prev => ({ ...prev, [direction]: numericValue }));
      updateStyles(selectedElement.id, {
        [`padding${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: `${numericValue}px`
      });
    }
  };

  return (
    <div className="spacing-editor">
      {/* Outer container for margin */}
      <div className="margin-box">
        {/* Margin label in the corners or center (optional) */}
        <div className="margin-label">MARGIN</div>

        {/* Each side's input for margin */}
        <div className="margin-top">
          <input
            type="number"
            value={margin.top}
            onChange={(e) => handleSpacingChange('margin', 'top', e.target.value)}
          />
        </div>
        <div className="margin-right">
          <input
            type="number"
            value={margin.right}
            onChange={(e) => handleSpacingChange('margin', 'right', e.target.value)}
          />
        </div>
        <div className="margin-bottom">
          <input
            type="number"
            value={margin.bottom}
            onChange={(e) => handleSpacingChange('margin', 'bottom', e.target.value)}
          />
        </div>
        <div className="margin-left">
          <input
            type="number"
            value={margin.left}
            onChange={(e) => handleSpacingChange('margin', 'left', e.target.value)}
          />
        </div>

        {/* Inner container for padding */}
        <div className="padding-box">
          <div className="padding-label">PADDING</div>

          {/* Each side's input for padding */}
          <div className="padding-top">
            <input
              type="number"
              value={padding.top}
              onChange={(e) => handleSpacingChange('padding', 'top', e.target.value)}
            />
          </div>
          <div className="padding-right">
            <input
              type="number"
              value={padding.right}
              onChange={(e) => handleSpacingChange('padding', 'right', e.target.value)}
            />
          </div>
          <div className="padding-bottom">
            <input
              type="number"
              value={padding.bottom}
              onChange={(e) => handleSpacingChange('padding', 'bottom', e.target.value)}
            />
          </div>
          <div className="padding-left">
            <input
              type="number"
              value={padding.left}
              onChange={(e) => handleSpacingChange('padding', 'left', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacingEditor;
