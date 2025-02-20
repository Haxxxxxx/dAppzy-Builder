// DateComponent.jsx
// -------------------------------------------
import React, { useContext, useEffect, useRef, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';

const DateComponent = ({ id, styles = {}, label }) => {
  const {
    selectedElement,
    setSelectedElement,
    updateContent,
    elements,
    findElementById
  } = useContext(EditableContext);

  const dateRef = useRef(null);

  // 1) Read the user-selected date (stored as ISO string)
  const elementData = findElementById(id, elements);
  const isoString = elementData?.content;  // e.g. "2025-03-10T10:35:00Z"

  // 2) Convert ISO string to a JavaScript Date
  const targetDate = isoString && !isNaN(Date.parse(isoString))
    ? new Date(isoString)
    : null;

  // 3) Local state to store the "time remaining" string
  const [timeRemaining, setTimeRemaining] = useState('');

  // 4) Each second, recalc how much time is left and set it
  useEffect(() => {
    if (!targetDate) {
      setTimeRemaining('No valid date');
      return;
    }

    const timerId = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        // date is in the past
        setTimeRemaining('0d 0h 0m 0s');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [targetDate]);

  // (Optional) contentEditable logic
  const handleSelect = (e) => {
    e.stopPropagation();
  };

  const handleBlur = () => {
    if (selectedElement?.id === id) {
      // If you want user text edits, you can store them:
      const newContent = dateRef.current?.innerText || '';
      updateContent(id, newContent);
    }
  };

  return (
    <div
      id={id}
      ref={dateRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...styles,
      }}
    >
      {label && (
        <div style={{ fontSize: '1rem', color: '#ccc', marginBottom: '0.5rem' }}>
          {label}
        </div>
      )}

      {/* The dynamic countdown string */}
      <div style={{
        fontSize: '1.5rem',
        color: '#fff',
        textAlign: 'center',
        wordWrap: 'break-word',
        outline: 'none',
      }}>
        {timeRemaining}
      </div>
    </div>
  );
};

export default DateComponent;
