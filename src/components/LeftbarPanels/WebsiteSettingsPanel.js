// src/components/LeftbarPanels/WebsiteSettingsPanel.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import '../css/SettingsPanel.css';
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase';
import { EditableContext } from '../../context/EditableContext';
import { pinata, pinataJwt } from '../../utils/configPinata';

// Helper function to get or create a group on Pinata.
async function getOrCreateGroup(walletId) {
  try {
    if (!pinata.groups) {
      throw new Error("Pinata groups is undefined. Check your SDK version and configuration.");
    }
    const groupsResponse = await pinata.groups.list().name(walletId);
    if (groupsResponse.groups && groupsResponse.groups.length > 0) {
      console.log("Found group:", groupsResponse.groups[0]);
      return groupsResponse.groups[0];
    } else {
      const newGroup = await pinata.groups.create({ name: walletId });
      console.log("Created new group:", newGroup);
      return newGroup;
    }
  } catch (error) {
    console.error("Error fetching or creating group:", error);
    throw error;
  }
}

// Helper function to upload a file to Pinata.
async function uploadFileToPinata(file, walletId, projectName) {
  try {
    const group = await getOrCreateGroup(walletId);
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    formData.append('file', file);
    // Attach metadata to simulate a folder structure and preserve file info.
    const metadata = {
      name: `${walletId}/${file.name}`,
      keyvalues: {
        walletId: walletId,
        projectName: projectName,
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));
    const response = await fetch(`${url}?group=${group.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`,
      },
      body: formData,
    });
    const data = await response.json();
    console.log("Pinata upload response:", data);
    return data;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
}

const WebsiteSettingsPanel = ({ onUpdateSettings, userId }) => {
  // Default settings for the website/project.
  const defaultSettings = {
    siteTitle: 'My Website',
    faviconUrl: '',
    description: 'My Project',
    author: '',
    // Add additional settings as needed.
  };

  // Load saved settings from localStorage (if any) on mount.
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

  // Handle favicon image upload using Pinata.
  const handleFaviconUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      // Upload the file to Pinata using the userId as the walletId and 'favicon' as the projectName.
      const response = await uploadFileToPinata(file, userId, 'favicon');
      if (response && response.IpfsHash) {
        const url = `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`;
        setSettings(prev => ({ ...prev, faviconUrl: url }));
      }
    } catch (error) {
      console.error("Error uploading favicon via Pinata:", error);
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
        <label htmlFor="faviconUpload">Upload Favicon:</label>
        <input
          id="faviconUpload"
          type="file"
          accept="image/*"
          onChange={handleFaviconUpload}
        />
        {settings.faviconUrl && (
          <img
            src={settings.faviconUrl}
            alt="Favicon Preview"
            style={{ width: '32px', height: '32px', marginTop: '8px' }}
          />
        )}
      </div>
      {/* Uncomment the sections below if you need additional settings fields.
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
      */}
      <button onClick={handleSave} className="save-button">
        Save Settings
      </button>
    </div>
  );
};

export default WebsiteSettingsPanel;
