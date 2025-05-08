// src/components/Actions.js or Visibility.js
import React, { useContext } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Visibility = ({ onPreviewToggle, isPreviewMode }) => {
  const { undo, redo } = useContext(EditableContext);
  const handlePreviewToggle = () => {
    onPreviewToggle();
  };
  return (
    <div className="actions">
      <button className="undo-button" onClick={undo}>
        <span className="material-symbols-outlined">undo</span>
      </button>
      <button className="redo-button" onClick={redo}>
        <span className="material-symbols-outlined">redo</span>
      </button>
      {/*<button className="preview-button" onClick={handlePreviewToggle}>
        {isPreviewMode ? (
          <span className="material-symbols-outlined">visibility_off</span>
        ) : (
          <span className="material-symbols-outlined">visibility</span>
        )}
      </button>*/}
    </div>
  );
};

export default Visibility;
