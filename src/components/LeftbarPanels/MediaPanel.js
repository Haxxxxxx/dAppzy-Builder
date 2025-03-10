// src/components/LeftbarPanels/MediaPanel.js
import React, { useState, useEffect } from 'react';
import './css/MediaPanel.css';
import { MediaItem } from './MediaItem';
import { PinataSDK } from '@pinata/sdk';
import { pinata_api_key, pinata_secret_api_key, pinata, pinataJwt } from '../../utils/configPinata';

// Log the pinata object to verify its structure.
console.log("Pinata instance:", pinata);

function getMediaTypeFromFile(file) {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "file";
  return "file";
}

function guessTypeFromExtension(filename) {
  const ext = filename.toLowerCase().split(".").pop();
  const images = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico", "tiff"];
  const videos = ["mp4", "mov", "avi", "wmv", "mkv", "webm"];
  if (images.includes(ext)) return "image";
  if (videos.includes(ext)) return "video";
  if (ext === "pdf") return "file";
  return "file";
}

/**
 * Retrieves (or creates) a group for the given wallet ID.
 * (Note: We call the methods directly on pinata.groups.)
 */
async function getOrCreateGroup(walletId) {
  try {
    if (!pinata.groups) {
      throw new Error("Pinata groups is undefined. Check your SDK version and configuration.");
    }
    // List groups filtering by name using the chainable .name() method.
    const groupsResponse = await pinata.groups.list().name(walletId);
    if (groupsResponse.groups && groupsResponse.groups.length > 0) {
      console.log("Found group:", groupsResponse.groups[0]);
      return groupsResponse.groups[0];
    } else {
      // Create a new group if none exists.
      const newGroup = await pinata.groups.create({ name: walletId });
      console.log("Created new group:", newGroup);
      return newGroup;
    }
  } catch (error) {
    console.error("Error fetching or creating group:", error);
    throw error;
  }
}

/**
 * Uploads a file to Pinata and assigns it to the group.
 */
async function uploadFileToPinata(file, walletId, projectName) {
  try {
    // Get or create the group.
    const group = await getOrCreateGroup(walletId);

    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    formData.append('file', file);

    // Preserve the file's original metadata.
    const metadata = {
      name: `${walletId}/${file.name}`, // Simulate folder structure in the name
      keyvalues: {
        walletId: walletId,
        projectName: projectName,
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Pass the group id as a query parameter.
    const response = await fetch(`${url}?group=${group.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`, // Make sure pinataJwt is correct
      },
      body: formData,
    });
    const data = await response.json();
    console.log("Upload response:", data);
    return data;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
}

async function listFilesFromPinata() {
  const url = 'https://api.pinata.cloud/data/pinList?status=pinned';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${pinataJwt}`,
    },
  });
  const data = await response.json();
  return data;
}

async function deleteFileFromPinata(ipfsHash) {
  const url = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${pinataJwt}`,
    },
  });
  const data = await response.json();
  return data;
}

const MediaPanel = ({ projectName, isOpen, userId }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchMedia = async () => {
    if (!userId || !projectName.trim()) {
      setMediaItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await listFilesFromPinata();
      // Filter files by metadata matching walletId and projectName.
      const filtered = result.rows.filter(item => {
        const keyvalues = item.metadata?.keyvalues || {};
        return keyvalues.walletId === userId && keyvalues.projectName === projectName;
      });
      const files = filtered.map(item => {
        const fileName = item.metadata?.name || item.ipfs_pin_hash;
        return {
          id: item.ipfs_pin_hash,
          type: guessTypeFromExtension(fileName),
          name: fileName,
          src: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
          ipfsHash: item.ipfs_pin_hash,
        };
      });
      setMediaItems(files);
    } catch (error) {
      console.error("Error listing files from Pinata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newMediaItems = [];
    for (const file of files) {
      try {
        const response = await uploadFileToPinata(file, userId, projectName);
        const ipfsHash = response.IpfsHash;
        const fileType = getMediaTypeFromFile(file);
        newMediaItems.push({
          id: ipfsHash + Date.now(), // Local unique id
          type: fileType,
          name: `${userId}/${file.name}`,
          src: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
          ipfsHash: ipfsHash,
        });
      } catch (error) {
        console.error("Error uploading file to Pinata:", error);
      }
    }
    setMediaItems(prevItems => [...newMediaItems, ...prevItems]);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    await handleFileUpload({ target: { files } });
  };
  const handleDragOver = (event) => event.preventDefault();

  const handleRemoveClick = async (itemId) => {
    const itemToRemove = mediaItems.find(item => item.id === itemId);
    if (!itemToRemove) return;
    try {
      await deleteFileFromPinata(itemToRemove.ipfsHash);
      setMediaItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting file from Pinata:", error);
    }
  };

  const handlePreviewClick = (item) => setPreviewItem(item);
  const closePreviewModal = () => setPreviewItem(null);

  const handleNameDoubleClick = (item) => {
    setEditingItemId(item.id);
    setEditingName(item.name || "");
  };
  const handleNameChange = (e) => setEditingName(e.target.value);
  const handleNameBlur = () => {
    setMediaItems(prev =>
      prev.map(item =>
        item.id === editingItemId ? { ...item, name: editingName } : item
      )
    );
    setEditingItemId(null);
    setEditingName('');
  };
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') handleNameBlur();
  };

  const handleSetFilterType = (type) => setFilterType(type);
  const filteredItems = mediaItems.filter(item => {
    let typeMatch = false;
    if (filterType === 'all') {
      typeMatch = true;
    } else if (filterType === 'media') {
      typeMatch = (item.type === 'image' || item.type === 'video');
    } else if (filterType === 'documents') {
      typeMatch = (item.type === 'file');
    }
    const nameMatch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && nameMatch;
  });

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  useEffect(() => {
    window.addToMediaPanel = (newItem) => setMediaItems(prev => [newItem, ...prev]);
    return () => { window.addToMediaPanel = null; };
  }, []);

  return (
    <div className="media-panel scrollable-panel" onDrop={handleDrop} onDragOver={handleDragOver}>
      <h3>Media Library</h3>
      <div className="filter-buttons">
        <button className={filterType === 'media' ? 'active' : ''} onClick={() => handleSetFilterType('media')}>
          Media
        </button>
        <button className={filterType === 'documents' ? 'active' : ''} onClick={() => handleSetFilterType('documents')}>
          Documents
        </button>
        <button className={filterType === 'all' ? 'active' : ''} onClick={() => handleSetFilterType('all')}>
          All
        </button>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>
      <hr />
      <div className="upload-buttons">
        <label htmlFor="file-upload" className="upload-button">
          Upload Files
          <input id="file-upload" type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        <div className="dropzone">
          Drag &amp; Drop Files Here
        </div>
      </div>
      {isLoading ? (
        <div className="media-loading-state">
          <div className="spinner" />
          <p>Loading Media...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="media-grid">
          {filteredItems.map(item => (
            <MediaItem
              key={item.id}
              item={item}
              isEditing={editingItemId === item.id}
              onNameDoubleClick={handleNameDoubleClick}
              onNameChange={handleNameChange}
              onNameBlur={handleNameBlur}
              onNameKeyDown={handleNameKeyDown}
              onRemoveClick={handleRemoveClick}
              onPreviewClick={handlePreviewClick}
            />
          ))}
        </div>
      ) : (
        <p className="no-media-message">No media found for this project.</p>
      )}
      {previewItem && (
        <div className="preview-modal" onClick={closePreviewModal}>
          <div className="preview-content" onClick={e => e.stopPropagation()}>
            {previewItem.type === 'image' && <img src={previewItem.src} alt={previewItem.name || "Preview"} />}
            {previewItem.type === 'video' && (
              <video controls autoPlay>
                <source src={previewItem.src} type="video/mp4" />
              </video>
            )}
            {previewItem.type === 'file' && (
              <div className="file-preview">
                <div className="file-icon">📄</div>
                <div className="file-label">File Preview</div>
              </div>
            )}
            <button className="close-button" onClick={closePreviewModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPanel;
