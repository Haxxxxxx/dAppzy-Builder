import React, { useState } from 'react';

const WebsiteSettingsPanel = ({ initialSettings, onUpdate }) => {
  const [settings, setSettings] = useState(initialSettings);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    if (onUpdate) onUpdate({ ...settings, [name]: value });
  };

  return (
    <div className="website-settings-panel">
      <h3>Website Settings</h3>
      <div className="settings-group">
        <label htmlFor="siteTitle">Site Title:</label>
        <input
          type="text"
          name="siteTitle"
          value={settings.siteTitle}
          onChange={handleInputChange}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="faviconUrl">Favicon URL:</label>
        <input
          type="text"
          name="faviconUrl"
          value={settings.faviconUrl}
          onChange={handleInputChange}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="description">Description:</label>
        <textarea
          name="description"
          value={settings.description}
          onChange={handleInputChange}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="author">Author:</label>
        <input
          type="text"
          name="author"
          value={settings.author}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default WebsiteSettingsPanel;
