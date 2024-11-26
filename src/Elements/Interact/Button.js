import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Button = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } = useContext(EditableContext);
  const buttonRef = useRef(null);
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;

  // Handle element selection
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'button', styles });
  };

  // Update content when editing is complete
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || 'Editable Button'); // Ensure non-empty content
    }
  };

  // Focus on the button when it is selected
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
      contentEditable={selectedElement?.id === id} // Enable editing only if selected
      onBlur={handleBlur}
      suppressContentEditableWarning={true} // Suppress React warnings for `contentEditable`
      style={{
        ...styles,
        ...customStyles,
        border: selectedElement?.id === id ? '1px dashed blue' : 'none',
        cursor: 'text',
      }}
    >
      {content || 'Editable Button'}
    </button>
  );
};

export default Button;
