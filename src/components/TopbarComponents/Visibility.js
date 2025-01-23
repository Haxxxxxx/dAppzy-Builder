// src/components/Actions.js
import React from 'react';

const Visibility = ({ onPreviewToggle, isPreviewMode }) => {
  const handlePreviewToggle = () => {
    onPreviewToggle();
  };

  return (
    <div className="actions">
      <button className="undo-button"><span class="material-symbols-outlined">
undo
</span></button>
      <button className="redo-button"><span class="material-symbols-outlined">
redo
</span></button>
      <button className="preview-button" onClick={handlePreviewToggle}>
        {isPreviewMode ? (
          <span className="material-symbols-outlined">visibility_off</span>
        ) : (
          <span className="material-symbols-outlined">visibility</span>
        )}
      </button>
    </div>
  );
};

export default Visibility;
