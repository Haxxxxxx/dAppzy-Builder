import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

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
          top: parseFloat(computedStyles.marginTop) || '',
          right: parseFloat(computedStyles.marginRight) || '',
          bottom: parseFloat(computedStyles.marginBottom) || '',
          left: parseFloat(computedStyles.marginLeft) || '',
        });
        setPadding({
          top: parseFloat(computedStyles.paddingTop) || '',
          right: parseFloat(computedStyles.paddingRight) || '',
          bottom: parseFloat(computedStyles.paddingBottom) || '',
          left: parseFloat(computedStyles.paddingLeft) || '',
        });
      }
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleSpacingChange = (type, direction, value) => {
    if (type === 'margin') {
      setMargin({ ...margin, [direction]: value });
      updateStyles(selectedElement.id, { [`margin${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: `${value}px` });
    } else {
      setPadding({ ...padding, [direction]: value });
      updateStyles(selectedElement.id, { [`padding${direction.charAt(0).toUpperCase() + direction.slice(1)}`]: `${value}px` });
    }
  };

  return (
    <div className="editor-section">
      <h4 className="editor-title">Spacing Settings</h4>
      <div className="spacing-group">
        <div className="editor-group">
          <label>Margin Top</label>
          <input
            type="number"
            value={margin.top}
            onChange={(e) => handleSpacingChange('margin', 'top', e.target.value)}
            className="editor-input"
          />
        </div>
        <div className="editor-group">
          <label>Margin Right</label>
          <input
            type="number"
            value={margin.right}
            onChange={(e) => handleSpacingChange('margin', 'right', e.target.value)}
            className="editor-input"
          />
        </div>
        <div className="editor-group">
          <label>Margin Bottom</label>
          <input
            type="number"
            value={margin.bottom}
            onChange={(e) => handleSpacingChange('margin', 'bottom', e.target.value)}
            className="editor-input"
          />
        </div>
        <div className="editor-group">
          <label>Margin Left</label>
          <input
            type="number"
            value={margin.left}
            onChange={(e) => handleSpacingChange('margin', 'left', e.target.value)}
            className="editor-input"
          />
        </div>
      </div>
      <div className="spacing-group">
        <div className="editor-group">
          <label>Padding Top</label>
          <input
            type="number"
            value={padding.top}
            onChange={(e) => handleSpacingChange('padding', 'top', e.target.value)}
            className="editor-input"
          />
        </div>
        <div className="editor-group">
          <label>Padding Right</label>
          <input
            type="number"
            value={padding.right}
            onChange={(e) => handleSpacingChange('padding', 'right', e.target.value)}
            className="editor-input"
          />
        </div>
        <div className="editor-group">
          <label>Padding Bottom</label>
          <input
            type="number"
            value={padding.bottom}
            onChange={(e) => handleSpacingChange('padding', 'bottom', e.target.value)}
            className="editor-input"
          />
        </div>
        <div className="editor-group">
          <label>Padding Left</label>
          <input
            type="number"
            value={padding.left}
            onChange={(e) => handleSpacingChange('padding', 'left', e.target.value)}
            className="editor-input"
          />
        </div>
      </div>
    </div>
  );
};

export default SpacingEditor;
