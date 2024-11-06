// src/Elements/Span.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const Span = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = '', styles = {} } = element || {};
  const spanRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
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
      style={{ ...styles, cursor: 'text', padding: '2px' }}
    >
      {content || 'Editable Span'}
    </span>
  );
};

export default Span;
