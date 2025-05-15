import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Button = ({ id, content: initialContent, styles: customStyles }) => {
  const { 
    selectedElement, 
    setSelectedElement, 
    updateContent, 
    elements, 
    findElementById,
    updateStyles 
  } = useContext(EditableContext);
  
  const buttonRef = useRef(null);

  // Retrieve the full element data (which includes settings, configuration, etc.)
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {}, parentId, navbarId } = elementData;

  // Handle selection by setting the entire element data
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({
      ...elementData,
      parentId,
      navbarId
    });
  };

  // Handle keydown events to allow spaces
  const handleKeyDown = (e) => {
    if (e.key === ' ' && selectedElement?.id === id) {
      e.preventDefault();
      document.execCommand('insertText', false, ' ');
    }
  };

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      // Only trim leading and trailing whitespace, preserve spaces between words
      const newContent = e.target.innerText.replace(/^\s+|\s+$/g, '') || 'Editable Button';
      updateContent(id, newContent);
    }
  };

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [selectedElement, id]);

  // Ensure styles are properly merged
  const mergedStyles = {
    ...styles,
    ...customStyles,
    cursor: 'text',
    border: 'none',
    outline: 'none'
  };

  return (
    <button
      id={id}
      ref={buttonRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning={true}
      style={mergedStyles}
    >
      {content || 'Editable Button'}
    </button>
  );
};

export default Button;
