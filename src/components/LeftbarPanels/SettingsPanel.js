// src/components/LeftbarPanels/SettingsPanel.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';
import CandyMachineSettings from './SettingsPanels/CandyMachineSettings';
import WalletSettingsPanel from './SettingsPanels/WalletSettingsPanel';
import '../css/SettingsPanel.css'
const SettingsPanel = ({ onUpdateSettings }) => {
  const { selectedElement } = useContext(EditableContext); // Access selectedElement from context
  const [settings, setSettings] = useState({
    siteTitle: 'My Website',
    faviconUrl: '',
    description: 'My Project',
    author: '',
    wallets: [
      { name: 'Phantom', enabled: true },
      { name: 'MetaMask', enabled: false },
      { name: 'WalletConnect', enabled: false },
    ],
  });

  // Update settings based on selectedElement type
  useEffect(() => {
    
      // Default settings for general or no selection
      setSettings((prevSettings) => ({
        ...prevSettings,
        siteTitle: 'My Website',
        faviconUrl: '',
        description: 'My Project',
        author: '',
      }));
    
  }, [selectedElement]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));

    // Call onUpdateSettings on every change to update in real-time
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, [name]: value });
    }
  };

  const handleSave = () => {
    if (onUpdateSettings) {
      onUpdateSettings(settings);
    } else {
      console.error('onUpdateSettings is not defined');
    }
  };


  return (
    <div className="settings-panel scrollable-panel">
     
        <>
          <h3>Website Settings</h3>
          <div className="settings-group">
            <label htmlFor="siteTitle">Site Title:</label>
            <input
              type="text"
              name="siteTitle"
              value={settings.siteTitle || ''}
              onChange={handleInputChange}
              placeholder="Enter site title"
            />
          </div>
          <div className="settings-group">
            <label htmlFor="faviconUrl">Favicon URL:</label>
            <input
              type="text"
              name="faviconUrl"
              value={settings.faviconUrl || ''}
              onChange={handleInputChange}
              placeholder="Enter favicon URL"
            />
          </div>
          <div className="settings-group">
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              value={settings.description || ''}
              onChange={handleInputChange}
              placeholder="Enter site description"
            />
          </div>
          <div className="settings-group">
            <label htmlFor="author">Author:</label>
            <input
              type="text"
              name="author"
              value={settings.author || ''}
              onChange={handleInputChange}
              placeholder="Enter author name"
            />
          </div>
          <button onClick={handleSave} className="save-button">
            Save Settings
          </button>
        </>
    </div>
  );
};

export default SettingsPanel;
