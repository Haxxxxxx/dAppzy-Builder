import React, { useState, useEffect, useRef } from 'react';
import './css/MediaPanel.css';
import { MediaItem } from './MediaItem';
import { auth } from '../../firebase';

const CF_BASE = import.meta.env.VITE_CF_BASE_URL;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

// Helpers to determine media type
function getMediaTypeFromFile(file) {
  const mime = file.type.toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'file';
  return 'file';
}

function guessTypeFromExtension(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  const images = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'tiff'];
  const videos = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
  if (images.includes(ext)) return 'image';
  if (videos.includes(ext)) return 'video';
  if (ext === 'pdf') return 'file';
  return 'file';
}

const MediaPanel = ({ projectName, isOpen, userId }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewEditingName, setPreviewEditingName] = useState('');
  const [previewHasChanges, setPreviewHasChanges] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch pinned media via CF proxy
  const fetchMedia = async () => {
    if (!userId || !projectName.trim()) {
      setMediaItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${CF_BASE}/listPinataMedia?userId=${encodeURIComponent(userId)}&projectName=${encodeURIComponent(projectName)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`List media failed: ${res.status} ${res.statusText}`);
      }

      const { rows } = await res.json();
      const files = rows.map(item => ({
        id: item.ipfs_pin_hash,
        type: guessTypeFromExtension(item.metadata.name),
        name: item.metadata.name,
        src: `${GATEWAY_URL}/${item.ipfs_pin_hash}`,
        ipfsHash: item.ipfs_pin_hash,
      }));
      setMediaItems(files);
    } catch (err) {
      setError('Failed to load media files. Please try again later.');
      setMediaItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a single file via CF proxy
  const uploadFile = async (file) => {
    const token = await auth.currentUser?.getIdToken();
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('metadata', JSON.stringify({ name: file.name, keyvalues: { userId, projectName } }));

    const res = await fetch(`${CF_BASE}/uploadPinataMedia`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${text}`);
    }
    return await res.json();
  };

  // Handle file input or drop uploads
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newItems = [];
    for (const file of files) {
      try {
        const response = await uploadFile(file);
        newItems.push({
          id: response.IpfsHash,
          type: getMediaTypeFromFile(file),
          name: file.name,
          src: `${GATEWAY_URL}/${response.IpfsHash}`,
          ipfsHash: response.IpfsHash,
        });
      } catch (err) {
        setError(`Failed to upload file: ${err.message}`);
      }
    }
    setMediaItems(prev => [...newItems, ...prev]);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    await handleFileUpload({ target: { files: event.dataTransfer.files } });
  };
  const handleDragOver = (event) => event.preventDefault();

  // Delete a file via CF proxy
  const handleRemoveClick = async (itemId) => {
    const item = mediaItems.find(i => i.id === itemId);
    if (!item) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${CF_BASE}/deletePinataMedia`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hash: item.ipfsHash })
      });
      if (!res.ok) throw new Error(res.statusText);
      setMediaItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      setError('Failed to delete file. Please try again.');
    }
  };

  // Preview and editing handlers
  const handlePreviewClick = (item) => {
    setPreviewItem(item);
    setPreviewEditingName(item.name || '');
    setPreviewHasChanges(false);
  };
  const closePreviewModal = () => setPreviewItem(null);

  const handlePreviewSave = () => {
    if (!previewItem) return;
    setMediaItems(prev =>
      prev.map(m =>
        m.id === previewItem.id ? { ...m, name: previewEditingName } : m
      )
    );
    setPreviewItem(prev => ({ ...prev, name: previewEditingName }));
    setPreviewHasChanges(false);
  };

  // Inline renaming in grid
  const handleNameDoubleClick = (item) => {
    setEditingItemId(item.id);
    setEditingName(item.name || '');
  };
  const handleNameChange = (e) => setEditingName(e.target.value);
  const handleNameBlur = () => {
    setMediaItems(prev =>
      prev.map(m => m.id === editingItemId ? { ...m, name: editingName } : m)
    );
    setEditingItemId(null);
    setEditingName('');
  };
  const handleNameKeyDown = (e) => e.key === 'Enter' && handleNameBlur();

  // Filtering and searching
  const filteredItems = mediaItems.filter(item => {
    const typeMatch = filterType === 'all' ||
      (filterType === 'media' && (item.type === 'image' || item.type === 'video')) ||
      (filterType === 'documents' && item.type === 'file');
    const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && nameMatch;
  });

  useEffect(() => {
    if (isOpen) fetchMedia();
  }, [isOpen, projectName, userId]);

  useEffect(() => {
    window.addToMediaPanel = (newItem) => setMediaItems(prev => [newItem, ...prev]);
    return () => { window.addToMediaPanel = null; };
  }, []);

  return (
    <div className="media-panel scrollable-panel" onDrop={handleDrop} onDragOver={handleDragOver}>
      {error && <div className="media-panel-warning"><p>{error}</p></div>}

      <div className="filter-buttons">
        <button className={filterType === 'media' ? 'active' : ''} onClick={() => setFilterType('media')}>Media</button>
        <button className={filterType === 'documents' ? 'active' : ''} onClick={() => setFilterType('documents')}>Documents</button>
        <button className={`all-button ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>All</button>
      </div>

      <div className="media-panel-search-bar">
        <span className="material-symbols-outlined">search</span>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <hr />

      <div className="upload-buttons">
        <div
          className="dropzone"
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <img src="./img/UploadMediaPanel.png" alt="Upload icon" />
          <p>Click or Drag & Drop Files Here</p>
          <input id="file-upload" type="file" multiple ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

        </div>
      </div>

      <hr />

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
            {previewItem.type === 'image' && (
              <div className="preview-title-edit">
                <p>Default Name: {previewItem.id}</p>
                <input
                  type="text"
                  value={previewEditingName}
                  onChange={e => { setPreviewEditingName(e.target.value); setPreviewHasChanges(e.target.value !== previewItem.name); }}
                />
                {previewHasChanges && <button onClick={handlePreviewSave} className="save-changes-btn">Save</button>}
              </div>
            )}
            {previewItem.type === 'image' && <img src={previewItem.src} alt={previewItem.name} />}
            {previewItem.type === 'video' && (
              <video controls autoPlay>
                <source src={previewItem.src} type="video/mp4" />
              </video>
            )}
            {previewItem.type === 'file' && (
              <div className="file-preview"><div className="file-icon">📄</div><div className="file-label">File Preview</div></div>
            )}
            <button className="close-button" onClick={closePreviewModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPanel;
