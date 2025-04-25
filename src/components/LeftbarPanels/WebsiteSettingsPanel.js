// src/components/LeftbarPanels/WebsiteSettingsPanel.js
import React, { useState, useEffect, useRef } from 'react';
import '../css/SettingsPanel.css';
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase';
import { pinata, pinataSDK } from '../../utils/configPinata';

// Replace pinataJwt with pinata.jwt
const jwt = pinata.pinata_jwt;

// 1) Helper: get or create Pinata group
async function getOrCreateGroup(walletId) {
  try {
    if (!pinata.groups) {
      throw new Error("Pinata groups is undefined. Check your SDK version and configuration.");
    }
    const groupsResponse = await pinata.groups.list();
    const existingGroup = groupsResponse.find(group => group.name === walletId);
    if (existingGroup) {
      console.log("Found group:", existingGroup);
      return existingGroup;
    } else {
      const newGroup = await pinata.groups.create(walletId);
      console.log("Created new group:", newGroup);
      return newGroup;
    }
  } catch (error) {
    console.error("Error fetching or creating group:", error);
    throw error;
  }
}

// 2) Helper: upload file to Pinata
async function uploadFileToPinata(file, walletId, projectName) {
  try {
    const group = await getOrCreateGroup(walletId);
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    formData.append('file', file);

    // Attach metadata
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
        'Authorization': `Bearer ${jwt}`,
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

// 3) Helper: rename folder in Firebase Storage
async function renameProjectFolder(oldName, newName, userId) {
  const oldFolderPath = `usersProjectData/${userId}/projects/${oldName}`;
  const newFolderPath = `usersProjectData/${userId}/projects/${newName}`;
  const oldFolderRef = ref(storage, oldFolderPath);

  try {
    const res = await listAll(oldFolderRef);
    const promises = res.items.map(async (itemRef) => {
      // Download the file as a Blob
      const url = await getDownloadURL(itemRef);
      const response = await fetch(url);
      const blob = await response.blob();

      // Upload it to the new folder
      const newFileRef = ref(storage, `${newFolderPath}/${itemRef.name}`);
      await uploadBytes(newFileRef, blob);

      // Delete the original file
      await deleteObject(itemRef);
    });
    await Promise.all(promises);
    console.log(`Folder renamed successfully from ${oldName} to ${newName}`);
  } catch (error) {
    console.error("Error renaming folder:", error);
    throw error;
  }
}

const WebsiteSettingsPanel = ({ onUpdateSettings, userId }) => {
  // Default website settings
  const defaultSettings = {
    siteTitle: 'My Website',
    faviconUrl: '',
    description: 'My Project',
    author: '',
  };

  // Load from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('websiteSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Keep track of the original siteTitle for rename
  const initialProjectNameRef = useRef(settings.siteTitle);

  // ============ Favicon Preview states ============
  // We'll store the uploaded file as a "previewItem" if it's an image
  const [previewItem, setPreviewItem] = useState(null);
  const [previewEditingName, setPreviewEditingName] = useState('');
  const [previewHasChanges, setPreviewHasChanges] = useState(false);

  // ============ 1) Title / Folder rename logic ============
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiteTitleBlur = async () => {
    if (initialProjectNameRef.current !== settings.siteTitle) {
      try {
        await renameProjectFolder(initialProjectNameRef.current, settings.siteTitle, userId);
        initialProjectNameRef.current = settings.siteTitle;
      } catch (error) {
        console.error("Folder rename failed:", error);
      }
    }
  };

  // ============ 2) Favicon Upload to Pinata ============
  const fileInputRef = useRef(null);

  const handleFaviconClick = () => {
    fileInputRef.current.click();
  };

  const handleFaviconFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // Upload the file to Pinata
      const response = await uploadFileToPinata(file, userId, 'favicon');
      if (response && response.IpfsHash) {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`;
        // Save the favicon URL in our settings
        setSettings((prev) => ({ ...prev, faviconUrl: ipfsUrl }));

        // If it's an image, show a preview modal
        const extension = file.name.toLowerCase().split('.').pop();
        const images = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico", "tiff"];
        if (images.includes(extension)) {
          setPreviewItem({
            type: 'image',
            src: ipfsUrl,
            name: file.name,
          });
          setPreviewEditingName(file.name);
          setPreviewHasChanges(false);
        } else {
          // If not an image, you could handle differently or skip preview
          setPreviewItem(null);
        }
      }
    } catch (error) {
      console.error("Error uploading favicon via Pinata:", error);
    }
  };



  // ============ 4) Save entire settings to localStorage ============
  const handleSave = () => {
    localStorage.setItem('websiteSettings', JSON.stringify(settings));
    if (onUpdateSettings) {
      onUpdateSettings(settings);
    }
  };

  return (
    <div className="settings-panel scrollable-panel">
      {/* Site Title & Folder Rename */}
      <div className="settings-group">
        <label htmlFor="siteTitle">Title :</label>
        <input
          type="text"
          name="siteTitle"
          value={settings.siteTitle}
          onChange={handleInputChange}
          onBlur={handleSiteTitleBlur}
          placeholder="Enter site title"
        />
      </div>
      <hr />

      {/* Favicon Upload */}
      <div className="settings-group">
        <label>Favicon :</label>
                {/* Show a small image preview under the dropzone if we have a faviconUrl */}
                {settings.faviconUrl && (
          <div className="favicon-preview">
            <div className="favicon-multi-preview">
              {/* Large */}
              <div className="favicon-size size-large">
                <img src={settings.faviconUrl} alt="Favicon Large" />
              </div>
              {/* Medium */}
              <div className="favicon-size size-medium">
                <img src={settings.faviconUrl} alt="Favicon Medium" />
              </div>
              {/* Small */}
              <div className="favicon-size size-small">
                <img src={settings.faviconUrl} alt="Favicon Small" />
              </div>
            </div>
          </div>
        )}
        <div className="upload-buttons">
          <div
            className="dropzone"
            onClick={handleFaviconClick}
          >
            <img src="./img/UploadMediaPanel.png" alt="upload icon" />
            <p>Click or Drag &amp; Drop Files Here</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFaviconFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>



      </div>


      {/* Optional additional fields */}
      {/* 
      <div className="settings-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={settings.description}
          onChange={handleInputChange}
        />
      </div>
      <div className="settings-group">
        <label>Author:</label>
        <input
          type="text"
          name="author"
          value={settings.author}
          onChange={handleInputChange}
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
