// src/components/Paragraph.js
import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const Paragraph = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id); // Find element by ID
  const { content = '', styles = {} } = element || {}; // Provide defaults to avoid undefined errors
  const paragraphRef = useRef(null);

  const handleSelect = () => {
    setSelectedElement({ id, type: 'paragraph', styles }); // Pass current styles
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && paragraphRef.current) {
      paragraphRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <div className="container">
      <p
        ref={paragraphRef}
        onClick={handleSelect}
        contentEditable={selectedElement?.id === id}
        onBlur={handleBlur}
        suppressContentEditableWarning={true}
        style={{
          ...styles,
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
        }}
      >
        {content || 'New Paragraph'}
      </p>
    </div>
  );
};

export default Paragraph;
