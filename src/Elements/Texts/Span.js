import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Span = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } = useContext(EditableContext);
  const spanRef = useRef(null);

  // Fetch the latest element data from elements
  const elementData = findElementById(id, elements);
  const { content = '', styles = {} } = elementData || {};

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent the click event from propagating to parent elements
    setSelectedElement({ id, type: 'span', styles });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && spanRef.current) {
      spanRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <span
      id={id}
      ref={spanRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      style={{
        ...styles,
        border: selectedElement?.id === id ? '1px dashed blue' : 'none', // Add visual cue for selected span
        cursor: 'text',
        padding: '2px',
      }}
    >
      {content || 'Editable Span'}
    </span>
  );
};

export default Span;
