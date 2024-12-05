import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Heading = ({ id, content: initialContent }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } = useContext(EditableContext);
  const headingRef = useRef(null);

  // Fetch the latest element data, including `level`, from `elements`
  const elementData = findElementById(id, elements);
  const { content = '', styles = {}, level = 1 } = elementData || {}; // Use default level 1 if undefined

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent bubbling to parent elements
    setSelectedElement({ id, type: 'heading', level, styles }); // Include styles when selecting
  };

  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && headingRef.current) {
      // console.log('Focusing on heading:', id, selectedElement);
      headingRef.current.focus();
    }
    // console.log('Rendering Heading with level:', level, 'Content:', content); // Confirm the correct level
  }, [selectedElement, id, level]);

  const Tag = `h${level}`; // Render the appropriate heading tag

  return (
    <Tag
      ref={headingRef}
      onClick={handleSelect}
      id={id}
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
      {content || 'New Heading'}
    </Tag>
  );
};

export default Heading;
