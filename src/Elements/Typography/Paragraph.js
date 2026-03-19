import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { EditableContext } from '../../context/EditableContext';
import RichTextToolbar from '../../components/RichTextToolbar';

const Paragraph = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  const { content = initialContent, styles } = element || {};
  const paragraphRef = useRef(null);
  const [hasFocus, setHasFocus] = useState(false);
  const isFocusedRef = useRef(false);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'paragraph', content, styles });
  };

  const handleBlur = useCallback((e) => {
    isFocusedRef.current = false;
    setHasFocus(false);
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerHTML);
    }
  }, [selectedElement, id, updateContent]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    setHasFocus(true);
  }, []);

  // Sync content from props into the DOM only when NOT actively editing
  useEffect(() => {
    if (paragraphRef.current && !isFocusedRef.current) {
      const incoming = content || 'New Paragraph';
      if (paragraphRef.current.innerHTML !== incoming) {
        paragraphRef.current.innerHTML = incoming;
      }
    }
  }, [content]);

  useEffect(() => {
    if (selectedElement?.id === id && paragraphRef.current) {
      paragraphRef.current.focus();
    }
  }, [selectedElement, id]);

  const isSelected = selectedElement?.id === id;
  const showToolbar = isSelected && hasFocus;

  return (
    <div style={{ position: 'relative' }}>
      {showToolbar && <RichTextToolbar containerRef={paragraphRef} />}
      <p
        id={id}
        ref={paragraphRef}
        onClick={handleSelect}
        contentEditable={isSelected}
        onBlur={handleBlur}
        onFocus={handleFocus}
        suppressContentEditableWarning={true}
        style={{
          ...customStyles,
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          cursor: 'text',
          border: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
};

export default Paragraph;
