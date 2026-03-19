import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const DatePicker = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { styles = {} } = element || {};
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'datePicker' });
  };

  return (
    <div id={id} onClick={handleSelect} style={{ display: 'inline-block', ...styles }}>
      <input
        type="date"
        readOnly
        style={{
          padding: styles.padding || '10px 14px',
          border: `1px solid ${styles.borderColor || '#d0d0d0'}`,
          borderRadius: styles.borderRadius || '6px',
          fontSize: styles.fontSize || '14px',
          fontFamily: styles.fontFamily || 'inherit',
          color: styles.color || '#333',
          backgroundColor: styles.backgroundColor || '#fff',
          cursor: 'pointer',
          outline: 'none',
          width: styles.width || '200px',
        }}
      />
    </div>
  );
};

export default DatePicker;
