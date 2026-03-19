import React, { useContext, useRef, useState, useEffect, useCallback } from 'react';
import { EditableContext } from '../../context/EditableContext';
import RichTextToolbar from '../../components/RichTextToolbar';

const Blockquote = ({ id }) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id);
  let { content = 'Blockquote text...' } = element || {};
  const blockquoteRef = useRef(null);
  const [hasFocus, setHasFocus] = useState(false);
  const isFocusedRef = useRef(false);
  const isSelected = selectedElement?.id === id;

  // Ensure content is a string
  if (typeof content !== 'string') {
    content = String(content);
  }

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'blockquote' });
  };

  const handleBlur = useCallback((e) => {
    isFocusedRef.current = false;
    setHasFocus(false);
    if (isSelected) {
      const newContent = e.target.innerHTML.trim();
      updateContent(id, newContent || 'Blockquote text...');
    }
  }, [isSelected, id, updateContent]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    setHasFocus(true);
  }, []);

  // Sync content from props into the DOM only when NOT actively editing
  useEffect(() => {
    if (blockquoteRef.current && !isFocusedRef.current) {
      const incoming = content || 'Blockquote text...';
      if (blockquoteRef.current.innerHTML !== incoming) {
        blockquoteRef.current.innerHTML = incoming;
      }
    }
  }, [content]);

  const showToolbar = isSelected && hasFocus;

  return (
    <div style={{ position: 'relative' }}>
      {showToolbar && <RichTextToolbar containerRef={blockquoteRef} />}
      <blockquote
        ref={blockquoteRef}
        contentEditable={isSelected}
        suppressContentEditableWarning={true}
        onClick={handleSelect}
        onBlur={handleBlur}
        onFocus={handleFocus}
        style={{
          borderLeft: '4px solid #ccc',
          paddingLeft: '10px',
          margin: '10px 0',
          fontStyle: 'italic',
        }}
      />
    </div>
  );
};

export default Blockquote;
