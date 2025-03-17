// src/components/LeftbarPanels/SettingsPanel.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import '../css/SettingsPanel.css';
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase';
import { EditableContext } from '../../context/EditableContext';

const WebsiteSettingsPanel = ({ onUpdateSettings, userId }) => {

  // Default settings for the website/project.
  const defaultSettings = {
    siteTitle: 'My Website',
    faviconUrl: '',
    description: 'My Project',
    author: '',
    // Add additional settings as needed.
  };

  // On mount, load saved settings from localStorage (if any).
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('websiteSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Use a ref to store the initial project name for comparison.
  const initialProjectNameRef = useRef(settings.siteTitle);




  // Handler for input changes.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Function to "rename" the folder in Firebase Storage.
  const renameProjectFolder = async (oldName, newName, userId) => {
    const oldFolderPath = `usersProjectData/${userId}/projects/${oldName}`;
    const newFolderPath = `usersProjectData/${userId}/projects/${newName}`;
    const oldFolderRef = ref(storage, oldFolderPath);

    try {
      const res = await listAll(oldFolderRef);
      const promises = res.items.map(async (itemRef) => {
        // Get the current file URL.
        const url = await getDownloadURL(itemRef);
        // Download the file as a Blob.
        const response = await fetch(url);
        const blob = await response.blob();
        // Create a reference in the new folder.
        const newFileRef = ref(storage, `${newFolderPath}/${itemRef.name}`);
        // Upload the blob to the new reference.
        await uploadBytes(newFileRef, blob);
        // Delete the original file.
        await deleteObject(itemRef);
      });
      await Promise.all(promises);
      console.log("Folder renamed successfully from", oldName, "to", newName);
    } catch (error) {
      console.error("Error renaming folder:", error);
      throw error;
    }
  };

  // Trigger folder rename when the siteTitle input loses focus.
  const handleSiteTitleBlur = async () => {
    if (initialProjectNameRef.current !== settings.siteTitle) {
      try {
        await renameProjectFolder(initialProjectNameRef.current, settings.siteTitle, userId);
        // Update the stored initial project name.
        initialProjectNameRef.current = settings.siteTitle;
      } catch (error) {
        console.error("Folder rename failed:", error);
      }
    }
  };

  const handleSave = () => {
    localStorage.setItem('websiteSettings', JSON.stringify(settings));
    if (onUpdateSettings) {
      onUpdateSettings(settings);
    }
  };


  return (
    <div className="settings-panel scrollable-panel">
      <h3>Website Settings</h3>
      <div className="settings-group">
        <label htmlFor="siteTitle">Site Title:</label>
        <input
          type="text"
          name="siteTitle"
          value={settings.siteTitle}
          onChange={handleInputChange}
          onBlur={handleSiteTitleBlur} // Trigger folder rename on blur.
          placeholder="Enter site title"
        />
      </div>
      <div className="settings-group">
        <label htmlFor="faviconUrl">Favicon URL:</label>
        <input
          type="text"
          name="faviconUrl"
          value={settings.faviconUrl}
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
          placeholder="Enter site description"
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

export default WebsiteSettingsPanel;
