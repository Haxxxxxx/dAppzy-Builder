// src/Texts/Heading.js
import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const Heading = ({ id, level }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const { content, styles } = elements[id] || {};
  const headingRef = useRef(null);

  const handleSelect = () => {
    setSelectedElement({ id, type: 'heading', level });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && headingRef.current) {
      headingRef.current.focus();
    }
  }, [selectedElement, id]);

  // Render the appropriate heading level
  const Tag = `h${level}`;

  return (
    <Tag
      ref={headingRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={styles} // Apply dynamic styles here
    >
      {content}
    </Tag>
  );
};

export default Heading;
