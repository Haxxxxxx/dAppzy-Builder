// src/Texts/Div.js
import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const Div = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const { content, styles } = elements[id] || {};
  const divRef = useRef(null);

  const handleSelect = () => {
    setSelectedElement({ id, type: 'div' });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && divRef.current) {
      divRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <div
      ref={divRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={styles}
    >
        {content || 'New Div'}
        </div>
  );
};

export default Div;
