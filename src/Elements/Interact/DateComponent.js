import React, { useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';

const DateComponent = ({ id, styles = {}, label }) => {
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
      id={id}
      onClick={handleSelect}
      suppressContentEditableWarning={true}
      style={{
        display: 'flex',
        flexDirection: 'column', // Stack elements vertically
        alignItems: 'center', // Center align for a neat look
        ...styles,
      }}
    >
      {label && (
        <div
          style={{
            fontSize: '1rem', // Smaller font for label
            color: '#ccc', // Subtle color for label
            marginBottom: '0.5rem', // Space between label and date
          }}
        >
          {label}
        </div>
      )}
      <div
        ref={dateRef}
        contentEditable={selectedElement?.id === id}
        onBlur={handleBlur}
        style={{
          fontSize: '1.5rem', // Larger font size for the date
          color: '#fff', // Highlight the date
          textAlign: 'center', // Center-align the date
          wordWrap: 'break-word',
          outline: 'none', // Remove focus outline
        }}
      >
        {typeof content === 'object' && content instanceof Date
          ? content.toLocaleString() // Ensure Date is formatted as string
          : content}
      </div>
    </div>
  );
};

export default DateComponent;
