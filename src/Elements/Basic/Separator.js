import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Separator = ({ id }) => {
  const { selectedElement, setSelectedElement, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { styles = {} } = element;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'separator' });
  };

  const variant = styles.variant || 'solid'; // solid, dashed, dotted, gradient, double
  const color = styles.color || '#e0e0e0';
  const thickness = styles.thickness || '1px';
  const width = styles.width || '100%';

  const getBorderStyle = () => {
    if (variant === 'gradient') {
      return {
        height: thickness,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        border: 'none',
      };
    }
    if (variant === 'double') {
      return {
        height: 0,
        borderTop: `${thickness} double ${color}`,
      };
    }
    return {
      height: 0,
      borderTop: `${thickness} ${variant} ${color}`,
    };
  };

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        width,
        margin: styles.margin || '16px auto',
        cursor: 'pointer',
        ...getBorderStyle(),
      }}
    />
  );
};

export default Separator;
