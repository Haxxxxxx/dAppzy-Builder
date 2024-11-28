import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';
import CandyMachineSettings from './SettingsPanels/CandyMachineSettings';

const SettingsPanel = ({ onUpdateSettings }) => {
  const { selectedElement } = useContext(EditableContext); // Access selectedElement from context
  const [settings, setSettings] = useState({
    siteTitle: 'My Website',
    faviconUrl: '',
    description: '',
    author: '',
  });

  // Update settings fields based on the selectedElement type
  useEffect(() => {
    if (!selectedElement || selectedElement.type !== 'candyMachine') {
      setSettings({
        siteTitle: 'My Website',
        faviconUrl: '',
        description: '',
        author: '',
      });
    }
  }, [selectedElement]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdateSettings(settings);
  };

  return (
    <div className="settings-panel scrollable-panel">
      {!selectedElement || selectedElement.type !== 'candyMachine' ? (
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
      ) : (
        <CandyMachineSettings
          settings={settings}
          onUpdateSettings={(updatedSettings) => {
            setSettings(updatedSettings);
            onUpdateSettings(updatedSettings);
          }}
        />
      )}
    </div>
  );
};

export default SettingsPanel;
