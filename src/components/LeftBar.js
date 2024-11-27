import React from 'react';
import './css/LeftBar.css';

const LeftBar = ({ onShowSidebar, onShowStructurePanel, onShowMediaPanel, onShowSettingsPanel }) => {
  return (
    <div className="leftbar">
      <div className="buttons-group">
        {/* Layout/Element Icon */}
        <button onClick={onShowSidebar} className="icon-button">
          <span className="material-symbols-outlined">add</span>
        </button>
        {/* Media Icon */}
        <button onClick={onShowStructurePanel} className="icon-button">
          <span className="material-symbols-outlined">stacks</span>
        </button>
        {/* Architecture Page Icon */}
        <button onClick={onShowMediaPanel} className="icon-button">
          <span class="material-symbols-outlined">
            perm_media
          </span>        
        </button>
        {/* Setting Page Icon */}
        <button onClick={onShowSettingsPanel} className="icon-button">
          <span class="material-symbols-outlined">
            settings
          </span>        
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
