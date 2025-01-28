import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const LinkBlock = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } =
    useContext(EditableContext);
  const linkBlockRef = useRef(null);

  // Get element data dynamically
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {}, url = '#' } = elementData;

  // Handle selection
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'linkBlock', styles });
  };

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || 'Editable Link'); // Default text if empty
    }
  };

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && linkBlockRef.current) {
      linkBlockRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <a
      id={id}
      ref={linkBlockRef}
      href={url}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...customStyles,
        ...styles,
        display: 'block',
        textDecoration: 'none',
        cursor: 'text',
      }}
    >
      {content || 'Editable Link'}
    </a>
  );
};

export default LinkBlock;
