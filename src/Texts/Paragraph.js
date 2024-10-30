// src/components/Paragraph.js
import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const Paragraph = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const { content, styles } = elements[id] || {};
  const paragraphRef = useRef(null);

  const handleSelect = () => {
    setSelectedElement({ id, type: 'paragraph' });
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
    <div className="container"> {/* Container with defined width */}
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
        {content}
      </p>
    </div>
  );
};

export default Paragraph;
