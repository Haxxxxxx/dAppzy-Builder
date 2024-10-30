// src/components/SideBar.js
import React, { useState } from 'react';
import EditorPanel from './EditorPanel';
import NewElementPanel from './NewElementPanel';

const SideBar = () => {
  const [isEditorPanel, setIsEditorPanel] = useState(true);

  // Toggle the displayed panel
  const togglePanel = () => {
    setIsEditorPanel((prev) => !prev);
  };

  return (
    <div>
      {/* Toggle Text at the Top */}
      <div style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px' }} onClick={togglePanel}>
        {isEditorPanel ? 'Switch to New Element Panel' : 'Switch to Editor Panel'}
      </div>

      {/* Conditional Rendering of Panels */}
      {isEditorPanel ? <EditorPanel /> : <NewElementPanel />}
    </div>
  );
};

export default SideBar;
