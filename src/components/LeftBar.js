// src/components/LeftBar.js
import React from 'react';

const LeftBar = ({ onShowSidebar, onShowStructurePanel, onShowMediaPanel, onShowSettingsPanel }) => {
  return (
    <div className="leftbar">
      <div className="buttons-group">
        <button onClick={onShowSidebar}>1</button>
        <button onClick={onShowStructurePanel}>2</button>
        <button onClick={onShowMediaPanel}>3</button>
        <button onClick={onShowSettingsPanel}>4</button>
      </div>
      <div className="help-center">
        <button className="help-center-button">HC</button>
      </div>
    </div>
  );
};

export default LeftBar;
