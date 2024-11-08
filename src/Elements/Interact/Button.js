import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Button = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id); // Find element by ID
  const { content = 'Click Me!', styles = {} } = element || {}; // Default content and styles
  const buttonRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedElement({ id, type: 'button', styles }); // Pass current styles
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
        ...styles,
        border: selectedElement?.id === id ? '1px dashed blue' : 'none', // Add visual cue for selected button
        cursor: 'pointer',
        padding: '8px',
      }}
    >
      {content}
    </button>
  );
};

export default Button;
