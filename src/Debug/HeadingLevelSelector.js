// src/components/Paragraph.js
import React, { useContext, useEffect, useRef } from 'react';

const HeadingLevelSelector = ({ onSelectLevel }) => {
    return (
      <div className="modal">
        <h3>Select Heading Level</h3>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button key={level} onClick={() => onSelectLevel(level)}>
            H{level}
          </button>
        ))}
      </div>
    );
  };

export default HeadingLevelSelector;
