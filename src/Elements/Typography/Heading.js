import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Heading = ({ id, content: initialContent, styles: customStyles }) => {
  const { selectedElement, setSelectedElement, updateContent, updateConfiguration, elements, findElementById } =
    useContext(EditableContext);
  const headingRef = useRef(null);

  // Find the latest element data
  const elementData = findElementById(id, elements);
  const { content = initialContent, styles = {}, level = 1 } = elementData || {};

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'title', level, styles });
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && headingRef.current) {
      headingRef.current.focus();
    }
  }, [selectedElement, id, level]);

  // Dynamically render the heading level
  const Tag = `h${elementData?.level || 1}`;

  return (
    <Tag
      ref={headingRef}
      id={elementData?.id || id}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...customStyles, // Override with custom styles
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
      }}
    >
      {content || 'New Heading'}
    </Tag>
  );
};

export default Heading;
