import React, { useState, useContext } from 'react';
import NewElementPanel from './LeftbarPanels/NewElementPanel';
import EditorPanel from './LeftbarPanels/EditorPanel';
import { EditableContext } from '../context/EditableContext';
import './css/Sidebar.css';

const SideBar = ({ contentListWidth }) => {
  const [viewMode, setViewMode] = useState('layout'); // 'elements' or 'layout'
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const { selectedElement } = useContext(EditableContext); // Access selectedElement from context

  return (
    <div className="sidebar-container">


      {/* Display buttons only when no element is selected */}
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
        <span class="material-symbols-outlined">
          search
        </span>
        <input
          type="text"
          placeholder="Search components or styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Display EditorPanel if an element is selected; otherwise, show default panel */}
      {selectedElement ? (
        <div className="editor-panel-container">
          <EditorPanel searchQuery={searchQuery} /> {/* Pass searchQuery */}
        </div>
      ) : (
        <div className="default-sidebar-container">
          <NewElementPanel
            viewMode={viewMode}
            contentListWidth={contentListWidth}
            searchQuery={searchQuery} // Pass searchQuery
          />
        </div>
      )}
    </div>
  );
};

export default SideBar;
