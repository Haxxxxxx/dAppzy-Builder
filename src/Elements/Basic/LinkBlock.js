import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const LinkBlock = ({ id, content: initialContent, styles: customStyles, label }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const linkRef = useRef(null);

  // Get full element data (including settings, configuration, etc.)
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {} } = elementData;

  // When selecting, pass along the full element data
  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent parent from being selected
    setSelectedElement(elementData);
  };

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || 'Editable Link'); // Default text if empty
    }
  };

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && linkRef.current) {
      linkRef.current.focus();
    }
  }, [selectedElement, id]);

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
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <a
            id={id}
            ref={linkRef}
            onClick={handleSelect}
            contentEditable={selectedElement?.id === id}
            onBlur={handleBlur}
            suppressContentEditableWarning={true}
            style={{
              ...styles,
              ...customStyles,
              fontSize: '1rem',
              border: 'none',
              cursor: 'text',
              wordWrap: 'break-word',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            {content || 'Editable Link'}
          </a>
        </div>
      </div>
    );
  }

  // Render content only
  return (
    <a
      id={id}
      ref={linkRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...styles,
        ...customStyles,
        cursor: 'text',
        border: 'none',
        outline: 'none',
        textDecoration: 'none',
        display: 'inline-block'
      }}
    >
      {content || 'Editable Link'}
    </a>
  );
};

export default LinkBlock;
