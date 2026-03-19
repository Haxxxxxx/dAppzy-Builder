import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { EditableContext } from '../../context/EditableContext';
import RichTextToolbar from '../../components/RichTextToolbar';

const Heading = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const headingRef = useRef(null);
  const [hasFocus, setHasFocus] = useState(false);
  const isFocusedRef = useRef(false);

  // Find the latest element data
  const elementData = findElementById(id, elements);
  const { content = initialContent, styles = {}, level = 1 } = elementData || {};

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(elementData || { id, type: 'title', level, styles });
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
    if (headingRef.current && !isFocusedRef.current) {
      const incoming = content || 'New Heading';
      if (headingRef.current.innerHTML !== incoming) {
        headingRef.current.innerHTML = incoming;
      }
    }
  }, [content]);

  useEffect(() => {
    if (selectedElement?.id === id && headingRef.current) {
      headingRef.current.focus();
    }
  }, [selectedElement, id, level]);

  // Dynamically render the heading level
  const Tag = `h${elementData?.level || 1}`;
  const isSelected = selectedElement?.id === id;
  const showToolbar = isSelected && hasFocus;

  return (
    <div style={{ position: 'relative' }}>
      {showToolbar && <RichTextToolbar containerRef={headingRef} />}
      <Tag
        ref={headingRef}
        id={elementData?.id || id}
        onClick={handleSelect}
        contentEditable={isSelected}
        onBlur={handleBlur}
        onFocus={handleFocus}
        suppressContentEditableWarning={true}
        style={{
          ...customStyles,
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          cursor: 'text',
          border: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
};

export default Heading;
