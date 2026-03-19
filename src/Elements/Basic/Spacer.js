import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Spacer = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { styles = {} } = element;
  const isSelected = selectedElement?.id === id;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'spacer' });
  };

  const height = styles.height || '40px';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        width: '100%',
        height,
        minHeight: '8px',
        cursor: 'pointer',
        position: 'relative',
        background: isSelected ? 'rgba(92, 78, 250, 0.05)' : 'transparent',
        borderTop: isSelected ? '1px dashed rgba(92, 78, 250, 0.3)' : 'none',
        borderBottom: isSelected ? '1px dashed rgba(92, 78, 250, 0.3)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isSelected && (
        <span style={{
          fontSize: '11px',
          color: 'rgba(92, 78, 250, 0.5)',
          fontFamily: 'Montserrat',
          userSelect: 'none',
        }}>
          {height}
        </span>
      )}
    </div>
  );
};

export default Spacer;
