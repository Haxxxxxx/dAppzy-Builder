import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Paragraph = ({ id, content: initialContent }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { content = initialContent, styles = {} } = element;
  const paragraphRef = useRef(null);

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent the event from bubbling up to parent Div
    if (element) {
      setSelectedElement({
        id: element.id,
        type: element.type,
        styles: element.styles,
      });
    }
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
    <p
      id={id}
      ref={paragraphRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...styles,
        border: selectedElement?.id === id ? '1px dashed blue' : 'none',
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
