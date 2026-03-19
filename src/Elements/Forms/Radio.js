import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Radio = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = 'Radio option', styles = {} } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'radio' });
  };

  const handleBlur = (e) => {
    if (isSelected) {
      updateContent(id, e.target.innerText.trim() || 'Radio option');
    }
  };

  return (
    <label
      id={id}
      onClick={handleSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: styles.gap || '8px',
        cursor: 'pointer',
        fontSize: styles.fontSize || '14px',
        fontFamily: styles.fontFamily || 'inherit',
        color: styles.color || '#333',
        padding: styles.padding || '4px 0',
        ...styles,
      }}
    >
      <input
        type="radio"
        checked={styles.checked || false}
        readOnly
        style={{
          width: styles.radioSize || '18px',
          height: styles.radioSize || '18px',
          accentColor: styles.accentColor || '#5c4efa',
          cursor: 'pointer',
          margin: 0,
          flexShrink: 0,
        }}
      />
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

export default Radio;
