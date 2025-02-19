import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Span = ({ id, content: initialContent, styles: customStyles, label }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const spanRef = useRef(null);

  // Get full element data (including settings, configuration, etc.)
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;

  // When selecting, pass along the full element data
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent from being selected
    setSelectedElement(elementData);
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

  if (label) {
    // Render label and content with flex layout
    return (
      <>
        <span
          style={{
            fontSize: '1rem',
            color: '#aaa', // Label styling
            marginRight: '1rem',
          }}
        >
          {label}
        </span>
        <span
          id={id}
          ref={spanRef}
          onClick={handleSelect}
          contentEditable={selectedElement?.id === id}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
          style={{
            ...styles, // Apply dynamic styles first
            fontSize: '1rem',
            color: '#fff', // Content styling
            border: 'none',
            cursor: 'text',
            wordWrap: 'break-word',
          }}
        >
          {content || 'Editable Span'}
        </span>
      </>
    );
  }

  // Render content only
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
        cursor: 'text',
      }}
    >
      {content || 'Editable Span'}
    </span>
  );
};

export default Span;
