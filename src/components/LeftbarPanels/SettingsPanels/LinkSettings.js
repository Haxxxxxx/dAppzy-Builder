import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';

const LinkSettingsPanel = ({ onUpdateSettings, settings }) => {
  const { selectedElement, updateConfiguration } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({
    settings
  });

  useEffect(() => {
    if (selectedElement?.settings) {
      setLocalSettings(selectedElement.settings);
    }
  }, [selectedElement]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setLocalSettings((prev) => ({ ...prev, [name]: newValue }));

    if (selectedElement) {
      updateConfiguration(selectedElement.id, name, newValue);
    }
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    alert('Link settings saved.');
  };

  return (
    <div className="link-settings-panel">
      <h3>Link Settings</h3>
      <div className="settings-group">
        <label htmlFor="textContent">Text Content:</label>
        <input
          type="text"
          name="textContent"
          value={localSettings.textContent}
          onChange={handleInputChange}
          placeholder="Enter link text"
          className="settings-input"
        />
      </div>
      <div className="settings-group">
        <label htmlFor="redirectUrl">Redirect URL:</label>
        <input
          type="url"
          name="redirectUrl"
          value={localSettings.redirectUrl}
          onChange={handleInputChange}
          placeholder="Enter redirect URL"
          className="settings-input"
        />
      </div>
      <div className="settings-group" >
        <label htmlFor="openInNewTab" style={{display:'flex', flexDirection:'row', width:'100%', alignContent:'center', justifyContent:'space-around' }}>
          <input
            type="checkbox"
            name="openInNewTab"
            checked={localSettings.openInNewTab}
            onChange={handleInputChange}
            style={{width:'auto', }}
          />
          <p>Open in new tab</p>
        </label>
      </div>
      <button onClick={handleSave} className="save-button">
        Save Link Settings
      </button>
    </div>
  );
};

export default LinkSettingsPanel;
