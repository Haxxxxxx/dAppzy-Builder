import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Toggle = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Toggle label', styles = {} } = element || {};
  const isSelected = selectedElement?.id === id;
  const isOn = styles.checked || false;

  const trackWidth = parseInt(styles.trackWidth) || 44;
  const trackHeight = parseInt(styles.trackHeight) || 24;
  const knobSize = trackHeight - 4;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'toggle' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      updateContent(id, e.target.innerText.trim() || 'Toggle label');
    }
  };

  return (
    <label
      id={id}
      onClick={handleSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: styles.gap || '10px',
        cursor: 'pointer',
        fontSize: styles.fontSize || '14px',
        fontFamily: styles.fontFamily || 'inherit',
        color: styles.color || '#333',
        padding: styles.padding || '4px 0',
        ...styles,
      }}
    >
      <div
        style={{
          width: `${trackWidth}px`,
          height: `${trackHeight}px`,
          borderRadius: `${trackHeight}px`,
          backgroundColor: isOn
            ? (styles.activeColor || '#5c4efa')
            : (styles.inactiveColor || '#ccc'),
          position: 'relative',
          transition: 'background-color 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${knobSize}px`,
            height: `${knobSize}px`,
            borderRadius: '50%',
            backgroundColor: styles.knobColor || '#fff',
            position: 'absolute',
            top: '2px',
            left: isOn ? `${trackWidth - knobSize - 2}px` : '2px',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </div>
      <span
        contentEditable={isSelected}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        style={{ outline: 'none' }}
      >
        {content}
      </span>
    </label>
  );
};

export default Toggle;
