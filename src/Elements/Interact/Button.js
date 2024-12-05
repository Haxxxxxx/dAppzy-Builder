import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Button = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const buttonRef = useRef(null);

  // Get element data dynamically
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;


  // Handle selection
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'button', styles });
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
        ...styles, // Apply dynamic styles first
        ...customStyles, // Override with custom styles
        cursor: 'text',
      }}
    >
      {content || 'Editable Button'}
    </button>
  );
};

export default Button;
