import React, { useState, useContext } from 'react';
import NewElementPanel from './LeftbarPanels/NewElementPanel';
import EditorPanel from './LeftbarPanels/EditorPanel';
import { EditableContext } from '../context/EditableContext';
import './css/Sidebar.css';

const SideBar = ({ contentListWidth }) => {
  const [viewMode, setViewMode] = useState('layout'); // 'elements' or 'layout'
  const { selectedElement } = useContext(EditableContext); // Access selectedElement from context

  return (
    <div className="sidebar-container">
      {/* Sidebar header buttons */}
      <div className="sidebar-toggle-buttons">
        <button
          onClick={() => setViewMode('elements')}
          className={viewMode === 'elements' ? 'active' : ''}
        >
          Elements
        </button>
        <button
          onClick={() => setViewMode('layout')}
          className={viewMode === 'layout' ? 'active' : ''}
        >
          Layout
        </button>
      </div>

      {/* Display EditorPanel if an element is selected; otherwise, show default panel */}
      {selectedElement ? (
        <div className="editor-panel-container">
          <EditorPanel /> {/* Show the EditorPanel for the selected element */}
        </div>
      ) : (
        <div className="default-sidebar-container">
          <NewElementPanel viewMode={viewMode} contentListWidth={contentListWidth} />
        </div>
      )}
    </div>
  );
};

export default SideBar;
