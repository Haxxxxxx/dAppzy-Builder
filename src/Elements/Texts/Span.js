import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Span = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const spanRef = useRef(null);

  // Get element data dynamically
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;

  // Debug styles

  // Handle selection
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent from being selected
    setSelectedElement({ id, type: 'span', styles });
  };

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || 'Editable Span'); // Default text if empty
    }
  };

  // Autofocus when selected
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
        ...styles, // Apply dynamic styles first
        ...customStyles, // Override with custom styles
        border: selectedElement?.id === id ? '1px dashed blue' : 'none',
        cursor: 'text',
      }}
    >
      {content || 'Editable Span'}
    </span>
  );
};

export default Span;
