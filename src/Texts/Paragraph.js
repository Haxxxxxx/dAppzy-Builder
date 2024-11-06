import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../context/EditableContext';

const Paragraph = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = '', styles = {} } = element || {};
  const paragraphRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent the event from bubbling up to parent Div
    setSelectedElement({ id, type: 'paragraph', styles });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && paragraphRef.current) {
      console.log('Focusing on paragraph:', id, selectedElement);
      paragraphRef.current.focus();
    }
    console.log('Rendering Paragraph with id:', id, 'Content:', content); // Debug log
  }, [selectedElement, id]);
  
  return (
    <p
      id={id}
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
  );
};

export default Paragraph;
