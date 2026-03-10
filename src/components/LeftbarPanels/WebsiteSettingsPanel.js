import React, { useState, useRef } from 'react';
import '../css/SettingsPanel.css';
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage, auth } from '../../firebase';

const CF_BASE = import.meta.env.VITE_CF_BASE_URL;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

// Helper: upload file to Pinata via CF proxy
async function uploadFileToPinata(file, walletId, projectName) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Authentication required. Please reconnect your wallet.');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify({
    name: `${walletId}/${file.name}`,
    keyvalues: { walletId, projectName },
  }));

  const response = await fetch(`${CF_BASE}/uploadToPinata`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed: ' + response.status);
  return await response.json();
}

// Helper: rename folder in Firebase Storage
async function renameProjectFolder(oldName, newName, userId) {
  const oldFolderPath = `usersProjectData/${userId}/projects/${oldName}`;
  const newFolderPath = `usersProjectData/${userId}/projects/${newName}`;
  const oldFolderRef = ref(storage, oldFolderPath);

  const res = await listAll(oldFolderRef);
  const promises = res.items.map(async (itemRef) => {
    const url = await getDownloadURL(itemRef);
    const response = await fetch(url);
    const blob = await response.blob();
    const newFileRef = ref(storage, `${newFolderPath}/${itemRef.name}`);
    await uploadBytes(newFileRef, blob);
    await deleteObject(itemRef);
  });
  await Promise.all(promises);
}

const WebsiteSettingsPanel = ({ onUpdateSettings, userId }) => {
  const defaultSettings = {
    siteTitle: 'My Website',
    faviconUrl: '',
    description: 'My Project',
    author: '',
  };

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('websiteSettings');
    if (!saved) return defaultSettings;
    try {
      return JSON.parse(saved);
    } catch {
      return defaultSettings;
    }
  });

  const initialProjectNameRef = useRef(settings.siteTitle);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiteTitleBlur = async () => {
    if (initialProjectNameRef.current !== settings.siteTitle) {
      try {
        setError('');
        await renameProjectFolder(initialProjectNameRef.current, settings.siteTitle, userId);
        initialProjectNameRef.current = settings.siteTitle;
      } catch (err) {
        setError('Failed to rename project. Please try again.');
      }
    }
  };

  const fileInputRef = useRef(null);

  const handleFaviconClick = () => {
    fileInputRef.current.click();
  };

  const handleFaviconFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setError('');
      const response = await uploadFileToPinata(file, userId, 'favicon');
      if (response && response.IpfsHash) {
        const ipfsUrl = `${GATEWAY_URL}/${response.IpfsHash}`;
        setSettings((prev) => ({ ...prev, faviconUrl: ipfsUrl }));
      }
    } catch (err) {
      setError('Failed to upload favicon. Please try again.');
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
      {error && <div className="settings-error" style={{ color: '#ff4444', fontSize: '12px', padding: '4px 8px' }}>{error}</div>}
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

      <div className="settings-group">
        <label>Favicon :</label>
                {settings.faviconUrl && (
          <div className="favicon-preview">
            <div className="favicon-multi-preview">
              <div className="favicon-size size-large">
                <img src={settings.faviconUrl} alt="Favicon Large" />
              </div>
              <div className="favicon-size size-medium">
                <img src={settings.faviconUrl} alt="Favicon Medium" />
              </div>
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

      <button onClick={handleSave} className="save-button">
        Save Settings
      </button>
    </div>
  );
};

export default WebsiteSettingsPanel;
