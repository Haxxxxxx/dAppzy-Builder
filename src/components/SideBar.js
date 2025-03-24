import React, { useState, useContext } from 'react';
import NewElementPanel from './LeftbarPanels/NewElementPanel';
import EditorPanel from './LeftbarPanels/EditorPanel';
import { EditableContext } from '../context/EditableContext';
import './css/Sidebar.css';

const SideBar = ({ contentListWidth, pageSettings }) => {
  // State for when no element is selected
  const [sidebarViewMode, setSidebarViewMode] = useState('layout'); 
  // State for when an element is selected (editor panel)
  const [editorViewMode, setEditorViewMode] = useState('style'); 
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedElement } = useContext(EditableContext);

  return (
    <div className="sidebar-container">
      {selectedElement ? (
        // Editor toggle buttons: style vs. settings
        <div className="sidebar-toggle-buttons">
          <button
            onClick={() => setEditorViewMode('style')}
            className={editorViewMode === 'style' ? 'active' : ''}
          >
            Style Editor
          </button>
          <button
            onClick={() => setEditorViewMode('settings')}
            className={editorViewMode === 'settings' ? 'active' : ''}
          >
            Element Setting
          </button>
        </div>
      ) : (
        // Sidebar toggle buttons: layout vs. elements
        <>
          <div className="sidebar-toggle-buttons">
            <button
              onClick={() => setSidebarViewMode('layout')}
              className={sidebarViewMode === 'layout' ? 'active' : ''}
            >
              Layout
            </button>
            <button
              onClick={() => setSidebarViewMode('elements')}
              className={sidebarViewMode === 'elements' ? 'active' : ''}
            >
              Elements
            </button>
          </div>
          <div className="sidebar-search-bar">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search components or styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </>
      )}
      
      {/* Render panel based on whether an element is selected */}
      {selectedElement ? (
        <div className="editor-panel-container">
          <EditorPanel
            searchQuery={searchQuery}
            pageSettings={pageSettings}
            viewMode={editorViewMode}
            setViewMode={setEditorViewMode}
          />
        </div>
      ) : (
        <div className="default-sidebar-container">
          <NewElementPanel
            viewMode={sidebarViewMode}
            contentListWidth={contentListWidth}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
};

export default SideBar;
