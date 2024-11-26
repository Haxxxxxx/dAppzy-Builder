import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Span = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } = useContext(EditableContext);
  const spanRef = useRef(null);
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent from being selected
    setSelectedElement({ id, type: 'span', styles });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || 'Editable Span'); // Fallback to default if empty
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
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...styles,
        ...customStyles,
        border: selectedElement?.id === id ? '1px dashed blue' : 'none',
        cursor: 'text',
      }}
    >
      {content || 'Editable Span'}
    </span>
  );
};

export default Span;
