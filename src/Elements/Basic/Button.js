import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Button = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const buttonRef = useRef(null);

  // Retrieve the full element data (which includes settings, configuration, etc.)
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;

  // Handle selection by setting the entire element data
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(elementData);
  };

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || 'Editable Button'); // Default text if empty
    }
  };

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <button
      id={id}
      ref={buttonRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...customStyles, // Override with custom styles
        cursor: 'text',
        border: 'none',     // Remove any border
        outline: 'none'     // Remove focus outline

      }}
    >
      {content || 'Editable Button'}
    </button>
  );
};

export default Button;
