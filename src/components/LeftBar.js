import React, { useState, useContext } from 'react';
import './css/LeftBar.css';
import SupportPopup from './LeftbarPanels/SupportPopup';
import { EditableContext } from '../context/EditableContext';

const LeftBar = ({ 
  openPanel, 
  onShowSidebar, 
  onShowStructurePanel, 
  onShowMediaPanel, 
  onShowSettingsPanel,
  aiChatStarted,
  onShowAIPanel
}) => {
  // Track whether SupportPopup is visible
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const { selectedElement } = useContext(EditableContext);

  const handleHelpClick = () => {
    setShowSupportPopup(true);
  };

  const handleClosePopup = () => {
    setShowSupportPopup(false);
  };

  return (
    <div className="leftbar">
      <div className="buttons-group">
        <button
          onClick={onShowSidebar}
          className={`icon-button ${openPanel === 'sidebar' &&!selectedElement ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">add</span>
        </button>

        <button
          onClick={onShowMediaPanel}
          className={`icon-button ${openPanel === 'media' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">perm_media</span>
        </button>

        <button
          onClick={onShowSettingsPanel}
          className={`icon-button ${openPanel === 'settings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* AI Agent Button */}
        <button
          onClick={onShowAIPanel}
          className={`icon-button ${openPanel === 'ai' ? 'active' : ''}`}
          title="AI Assistant"
        >
          <span className="material-symbols-outlined">smart_toy</span>
        </button>
      </div>

      <div className="help-center">
        <button className="help-center-button" onClick={handleHelpClick}>
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>

      {/* Conditionally render the SupportPopup */}
      {showSupportPopup && (
        <SupportPopup onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default LeftBar;
