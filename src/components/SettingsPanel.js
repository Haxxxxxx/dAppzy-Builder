// src/components/SettingsPanel.js
import React, { useState } from 'react';

const SettingsPanel = ({ onUpdateSettings }) => {
  const [settings, setSettings] = useState({
    title: '',
    iconUrl: '',
    description: '',
    author: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdateSettings(settings);
  };

  return (
    <div className="settings-panel">
      <h3>Page Settings</h3>
      <div className="settings-group">
        <label htmlFor="title">Page Title:</label>
        <input
          type="text"
          name="title"
          value={settings.title}
          onChange={handleInputChange}
          placeholder="Enter page title"
        />
      </div>
      <div className="settings-group">
        <label htmlFor="iconUrl">Favicon URL:</label>
        <input
          type="text"
          name="iconUrl"
          value={settings.iconUrl}
          onChange={handleInputChange}
          placeholder="Enter favicon URL"
        />
      </div>
      <div className="settings-group">
        <label htmlFor="description">Description:</label>
        <textarea
          name="description"
          value={settings.description}
          onChange={handleInputChange}
          placeholder="Enter page description"
        />
      </div>
      <div className="settings-group">
        <label htmlFor="author">Author:</label>
        <input
          type="text"
          name="author"
          value={settings.author}
          onChange={handleInputChange}
          placeholder="Enter author name"
        />
      </div>
      <button onClick={handleSave} className="save-button">
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPanel;
