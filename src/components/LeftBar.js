import React from 'react';
import './css/LeftBar.css';

const LeftBar = ({ openPanel, onShowSidebar, onShowStructurePanel, onShowMediaPanel, onShowSettingsPanel }) => {
  return (
    <div className="leftbar">
      <div className="buttons-group">
        {/* Layout/Element Icon */}
        <button
          onClick={onShowSidebar}
          className={`icon-button ${openPanel === 'sidebar' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        {/* Structure Icon */}
        {/* <button
          onClick={onShowStructurePanel}
          className={`icon-button ${openPanel === 'structure' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">stacks</span>
        </button> */}
        {/* Media Icon */}
        <button
          onClick={onShowMediaPanel}
          className={`icon-button ${openPanel === 'media' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">perm_media</span>
        </button>
        {/* Settings Icon */}
        <button
          onClick={onShowSettingsPanel}
          className={`icon-button ${openPanel === 'settings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
      <div className="help-center">
        <button className="help-center-button">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </div>
  );
};

export default LeftBar;
