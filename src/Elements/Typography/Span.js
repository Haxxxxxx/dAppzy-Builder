import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
import { EditableContext } from '../../context/EditableContext';
import RichTextToolbar from '../../components/RichTextToolbar';

const Span = ({ id, content: initialContent, styles: customStyles, label }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const spanRef = useRef(null);
  const [hasFocus, setHasFocus] = useState(false);
  const isFocusedRef = useRef(false);

  // Get full element data (including settings, configuration, etc.)
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;

  // When selecting, pass along the full element data
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(elementData);
  };

  // Update content on blur — save innerHTML for rich text
  const handleBlur = useCallback((e) => {
    isFocusedRef.current = false;
    setHasFocus(false);
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerHTML.trim() || 'Editable Span');
    }
  }, [selectedElement, id, updateContent]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    setHasFocus(true);
  }, []);

  // Sync content from props into the DOM only when NOT actively editing
  useEffect(() => {
    if (spanRef.current && !isFocusedRef.current) {
      const incoming = content || 'Editable Span';
      if (spanRef.current.innerHTML !== incoming) {
        spanRef.current.innerHTML = incoming;
      }
    }
  }, [content]);

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && spanRef.current) {
      spanRef.current.focus();
    }
  }, [selectedElement, id]);

  const isSelected = selectedElement?.id === id;
  const showToolbar = isSelected && hasFocus;

  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <span
          style={{
            fontSize: '1rem',
            color: '#aaa',
            marginRight: '1rem',
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', position: 'relative' }}>
          {showToolbar && <RichTextToolbar containerRef={spanRef} />}
          <span
            id={id}
            ref={spanRef}
            onClick={handleSelect}
            contentEditable={isSelected}
            onBlur={handleBlur}
            onFocus={handleFocus}
            suppressContentEditableWarning={true}
            style={{
              ...styles,
              ...customStyles,
              fontSize: '1rem',
              border: 'none',
              cursor: 'text',
              wordWrap: 'break-word',
            }}
          />
        </div>
      </div>
    );
  }

  // Render content only
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {showToolbar && <RichTextToolbar containerRef={spanRef} />}
      <span
        id={id}
        ref={spanRef}
        onClick={handleSelect}
        contentEditable={isSelected}
        onBlur={handleBlur}
        onFocus={handleFocus}
        suppressContentEditableWarning={true}
        style={{
          ...styles,
          ...customStyles,
          cursor: 'text',
          border: 'none',
          outline: 'none',
          display: 'inline-block',
        }}
      />
    </div>
  );
};

export default Span;
