import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const DateComponent = ({ id, styles = {} }) => {
  const { selectedElement, setSelectedElement, updateContent, elements, findElementById } = useContext(EditableContext);
  const dateRef = useRef(null);

  // Fetch the latest element data, defaulting to current date if not provided
  const elementData = findElementById(id, elements);
  const { content = new Date().toLocaleString() } = elementData || {}; // Default: current date as string

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent bubbling to parent elements
    setSelectedElement({ id, type: 'date' });
  };

  const handleBlur = () => {
    if (selectedElement?.id === id) {
      const newContent = dateRef.current?.innerText || '';
      updateContent(id, newContent);
    }
  };

  useEffect(() => {
    if (selectedElement?.id === id && dateRef.current) {
      dateRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <div
      ref={dateRef}
      id={id}
      contentEditable={selectedElement?.id === id}
      onClick={handleSelect}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...styles,
        border: selectedElement?.id === id ? '1px dashed blue' : 'none',
        wordWrap: 'break-word',
      }}
    >
      {typeof content === 'object' && content instanceof Date
        ? content.toLocaleString() // Ensure Date is formatted as string
        : content}
    </div>
  );
};

export default DateComponent;
