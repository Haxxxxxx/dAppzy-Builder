import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Line = ({ id, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, elements, findElementById } = useContext(EditableContext);
  const lineRef = useRef(null);

  // Get element data dynamically
  const elementData = findElementById(id, elements) || {};
  const { styles = {} } = elementData;

  // Handle selection
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'line', styles });
  };

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && lineRef.current) {
      lineRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <hr
      id={id}
      ref={lineRef}
      onClick={handleSelect}
      style={{
        ...customStyles,
        ...styles,
        border: styles.border || '1px solid #000',
        margin: styles.margin || '10px 0',
        width:'100%',
      }}
    />
  );
};

export default Line;
