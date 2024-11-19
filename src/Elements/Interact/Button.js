import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Button = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { content = initialContent, styles = {} } = element;
  const buttonRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'button', styles });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <button
      ref={buttonRef}
      id={id}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        fontFamily: 'Roboto, sans-serif', // Default font style for Button
        ...styles, // styles from EditableContext (if any)
        ...customStyles, // styles passed from DraggableNavbar, will override defaults if provided
      }}
    >
      {content}
    </button>
  );
};

export default Button;
