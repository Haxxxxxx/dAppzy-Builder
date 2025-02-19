import React, { useState, useContext } from 'react';
import NewElementPanel from './LeftbarPanels/NewElementPanel';
import EditorPanel from './LeftbarPanels/EditorPanel';
import { EditableContext } from '../context/EditableContext';
import './css/Sidebar.css';

const SideBar = ({ contentListWidth, userId }) => {
  const [viewMode, setViewMode] = useState('layout'); // Default to 'elements'
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedElement } = useContext(EditableContext);

  return (
    <div className="sidebar-container">
      {!selectedElement && (
        <div className="sidebar-toggle-buttons">
          <button
            onClick={() => setViewMode('layout')}
            className={viewMode === 'layout' ? 'active' : ''}
          >
            Layout
          </button>
          <button
            onClick={() => setViewMode('elements')}
            className={viewMode === 'elements' ? 'active' : ''}
          >
            Elements
          </button>
        </div>
      )}
      <div className="sidebar-search-bar">
        <span className="material-symbols-outlined">search</span>
        <input
          type="text"
          placeholder="Search components or styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {selectedElement ? (
        <div className="editor-panel-container">
          <EditorPanel searchQuery={searchQuery} />
        </div>
      ) : (
        <div className="default-sidebar-container">
          <NewElementPanel
            viewMode={viewMode}
            contentListWidth={contentListWidth}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
};

export default SideBar;
