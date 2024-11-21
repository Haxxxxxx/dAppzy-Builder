import React, { useState } from 'react';
import NewElementPanel from './LeftbarPanels/NewElementPanel';
import "./css/Sidebar.css";

const SideBar = ({contentListWidth}) => {
  const [viewMode, setViewMode] = useState('elements'); // 'elements' or 'layout'

  return (
    <div className="sidebar-container">
      {/* Buttons to switch between Elements and Layout */}
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

      {/* New Element Panel with conditional rendering */}
      <NewElementPanel viewMode={viewMode} contentListWidth={contentListWidth}/>
    </div>
  );
};

export default SideBar;
