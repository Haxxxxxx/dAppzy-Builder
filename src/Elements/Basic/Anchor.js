// src/Elements/Interact/Anchor.js
import React, { useContext, useRef, useEffect, useMemo } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Anchor = React.memo(({ id, content: initialContent, styles: customStyles, href: customHref }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const anchorRef = useRef(null);

  // Only fetch element data if needed
  const elementData = useMemo(() => findElementById(id, elements) || {}, [id, elements, findElementById]);
  let { content = initialContent || 'Click here', href = customHref || '#', styles = {} } = elementData;

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

  // Memoize merged styles
  const mergedStyles = useMemo(() => ({
    ...styles,
    ...customStyles,
    cursor: 'text',
    border: 'none',     // Remove any border
    outline: 'none',     // Remove focus outline
    textDecoration: 'underline',
    color: '#007BFF',
  }), [styles, customStyles]);

  return (
    <a
      id={id}
      ref={anchorRef}
      href={href}
      contentEditable={selectedElement?.id === id}
      onClick={handleSelect}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={mergedStyles}
    >
      {content}
    </a>
  );
});

export default Anchor;
