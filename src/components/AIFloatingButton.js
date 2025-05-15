import React from 'react';
import './css/AIFloatingButton.css';

const AIFloatingButton = ({ onClick }) => {
  return (
    <button className="ai-floating-button" onClick={onClick}>
      <span className="material-symbols-outlined">smart_toy</span>
    </button>
  );
};

export default AIFloatingButton; 