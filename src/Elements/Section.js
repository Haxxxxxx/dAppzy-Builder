// src/Texts/Section.js
import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const Section = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const { content, styles } = elements[id] || {};
  const sectionRef = useRef(null);

  const handleSelect = () => {
    setSelectedElement({ id, type: 'section' });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && sectionRef.current) {
      sectionRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <section
      ref={sectionRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={styles}
    >
        {content || 'New Section'}
        </section>
  );
};

export default Section;
