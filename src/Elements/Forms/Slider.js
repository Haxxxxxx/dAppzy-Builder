import React, { useContext, useState, useCallback } from 'react';
import { EditableContext } from '../../context/EditableContext';

const DEFAULT_CONTENT = {
  label: 'Volume',
  min: 0,
  max: 100,
  step: 1,
  value: 50,
  showValue: true,
};

const Slider = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content, styles = {} } = element || {};

  let data;
  try {
    data = typeof content === 'string' ? JSON.parse(content) : (content || DEFAULT_CONTENT);
  } catch {
    data = DEFAULT_CONTENT;
  }

  const { label, min, max, step, value, showValue } = { ...DEFAULT_CONTENT, ...data };
  const isSelected = selectedElement?.id === id;

  // Local preview value while dragging
  const [previewValue, setPreviewValue] = useState(value);

  // Sync preview when content changes externally
  React.useEffect(() => {
    setPreviewValue(value);
  }, [value]);

  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'slider' });
  }, [element, id, setSelectedElement]);

  const handleChange = (e) => {
    const newVal = Number(e.target.value);
    setPreviewValue(newVal);
    if (isSelected) {
      updateContent(id, JSON.stringify({ ...data, value: newVal }));
    }
  };

  const accentColor = styles.accentColor || '#5c4efa';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        width: styles.width || '100%',
        padding: styles.padding || '8px 0',
        cursor: 'pointer',
        ...styles,
      }}
    >
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
          fontSize: styles.fontSize || '14px',
          fontFamily: styles.fontFamily || 'Montserrat',
          color: styles.color || '#333',
        }}>
          <span>{label}</span>
          {showValue && <span style={{ fontWeight: 600 }}>{previewValue}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={previewValue}
        onChange={handleChange}
        style={{
          width: '100%',
          accentColor,
          cursor: isSelected ? 'grab' : 'pointer',
        }}
      />
    </div>
  );
};

export default Slider;
