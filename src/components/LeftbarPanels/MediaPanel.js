// src/components/LeftbarPanels/MediaPanel.js
import React, { useState, useEffect, useContext } from 'react';
import './css/MediaPanel.css';
import { ref, listAll, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../firebase';
import { EditableContext } from '../../context/EditableContext';
import { MediaItem } from './MediaItem';

const MediaPanel = ({
  projectName , // Now we receive projectName from props
  isOpen,
  userId
}) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Retrieve website settings and use siteTitle as projectName.
  // 1) Make fetchMedia async
  const fetchMedia = async () => {
    // If user isn't logged in or no project name, skip
    if (!userId || !projectName.trim()) {
      setMediaItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const folderPath = `usersProjectData/${userId}/projects/${projectName}`;
      const folderRef = ref(storage, folderPath);

      // 2) Await the listAll call
      const res = await listAll(folderRef);

      // 3) For each item, await getDownloadURL
      const promises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          id: itemRef.name,
          type: 'image', // adjust logic if you also have video/files
          name: itemRef.name,
          src: url,
        };
      });

      // 4) Await the array of file objects
      const files = await Promise.all(promises);

      console.log("Retrieved files:", files); // Now it's the actual array
      setMediaItems(files);
    } catch (error) {
      console.error("Error listing files in storage:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Upload etc. (unchanged)
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newMediaItems = [];
    for (const file of files) {
      try {
        const storagePath = `usersProjectData/${userId}/projects/${projectName}/${file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            () => { },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              newMediaItems.push({
                id: file.name + Date.now(),
                type: file.type.startsWith('image/') ? 'image'
                  : file.type.startsWith('video/') ? 'video' : 'file',
                name: file.name,
                src: downloadURL,
              });
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    setMediaItems((prevItems) => [...newMediaItems, ...prevItems]);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    await handleFileUpload({ target: { files } });
  };

  const handleDragOver = (event) => event.preventDefault();

  const handleRemoveClick = (itemId) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== itemId));
  };
  const handlePreviewClick = (item) => setPreviewItem(item);
  const closePreviewModal = () => setPreviewItem(null);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleNameDoubleClick = (item) => {
    setEditingItemId(item.id);
    setEditingName(item.name || "");
  };
  const handleNameChange = (e) => setEditingName(e.target.value);
  const handleNameBlur = () => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === editingItemId ? { ...item, name: editingName } : item
      )
    );
    setEditingItemId(null);
    setEditingName('');
  };
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  const handleSetFilterType = (type) => {
    setFilterType(type);
  };



  const filteredItems = mediaItems.filter((item) => {
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


  // 5) Use an effect that calls fetchMedia whenever userId or projectName changes
  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);
  

  // Provide a global function to add items from outside
  useEffect(() => {
    window.addToMediaPanel = (newItem) => {
      setMediaItems((prev) => [newItem, ...prev]);
    };
    return () => {
      window.addToMediaPanel = null;
    };
  }, []);

  return (
    <div
      className="media-panel scrollable-panel"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h3>Media Library</h3>
      <div className="filter-buttons">
        <button
          className={filterType === 'media' ? 'active' : ''}
          onClick={() => handleSetFilterType('media')}
        >
          Media
        </button>
        <button
          className={filterType === 'documents' ? 'active' : ''}
          onClick={() => handleSetFilterType('documents')}
        >
          Documents
        </button>
        <button
          className={filterType === 'all' ? 'active' : ''}
          onClick={() => handleSetFilterType('all')}
        >
          All
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <hr />

      <div className="upload-buttons">
        <label htmlFor="file-upload" className="upload-button">
          Upload Files
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        <div className="dropzone">
          Drag & Drop Files Here
        </div>
      </div>

      {isLoading ? (
        <div className="media-loading-state">
          <div className="spinner" />
          <p>Loading Media...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="media-grid">
          {filteredItems.map((item) => (
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
              editingName={editingName}
              editingItemId={editingItemId}
            />
          ))}
        </div>
      ) : (
        <p className="no-media-message">No media found for this project.</p>
      )}

      {previewItem && (
        <div className="preview-modal" onClick={closePreviewModal}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            {previewItem.type === 'image' && (
              <img src={previewItem.src} alt={previewItem.name || "Preview"} />
            )}
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
            <button className="close-button" onClick={closePreviewModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPanel;
