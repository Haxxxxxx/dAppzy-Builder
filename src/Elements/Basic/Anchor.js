// src/Elements/Interact/Anchor.js
import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Anchor = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const anchorRef = useRef(null);

  // Dynamically fetch full element data (which may include settings/configuration)
  const elementData = findElementById(id, elements) || {};
  let { content = initialContent || 'Click here', href = '#', styles = {} } = elementData;

  // Ensure content is a string
  if (typeof content !== 'string') {
    console.warn(`Invalid content type for anchor with ID ${id}. Converting to string.`);
    content = String(content);
  }

  // When selecting, pass along the full element data
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(elementData);
  };

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || 'Click here');
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && anchorRef.current) {
      anchorRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <a
      id={id}
      ref={anchorRef}
      href={href}
      contentEditable={selectedElement?.id === id}
      onClick={handleSelect}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...styles,
        ...customStyles,
        cursor: 'text',
        border: 'none',     // Remove any border
        outline: 'none',     // Remove focus outline
        textDecoration: 'underline',
        color: '#007BFF',
      }}
    >
      {content}
    </a>
  );
};

export default Anchor;
