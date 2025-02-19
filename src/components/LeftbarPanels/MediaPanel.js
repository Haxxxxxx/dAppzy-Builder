// src/components/LeftbarPanels/MediaPanel.js
import React, { useState, useEffect, useContext } from 'react';
import './css/MediaPanel.css';
import { useDrag } from 'react-dnd';
import { ref, listAll, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../firebase';
import { EditableContext } from '../../context/EditableContext';

const MediaItem = ({
  item,
  isEditing,
  onNameDoubleClick,
  onNameChange,
  onNameBlur,
  onNameKeyDown,
  onRemoveClick,
  onPreviewClick,
  editingName,
  editingItemId,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'mediaItem',
    item: { id: item.id, src: item.src, mediaType: item.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      key={item.id}
      className={`media-item ${editingItemId === item.id ? 'editing' : ''}`}
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="media-preview">
        {item.type === 'image' && (
          <img src={item.src} alt={item.name || "Media item"} />
        )}
        {item.type === 'video' && (
          <video>
            <source src={item.src} type="video/mp4" />
          </video>
        )}
        {item.type === 'file' && <div className="file-icon">📄</div>}

        <div className="overlay">
          {editingItemId === item.id ? (
            <input
              type="text"
              className="media-name-input"
              value={editingName}
              onChange={onNameChange}
              onBlur={onNameBlur}
              onKeyDown={onNameKeyDown}
              autoFocus
            />
          ) : (
            <p className="media-name" onDoubleClick={() => onNameDoubleClick(item)}>
              {item.name || "Untitled"}
            </p>
          )}
          <div className="overlay-buttons">
            <button className="overlay-button remove-button" onClick={() => onRemoveClick(item.id)}>
              <span className="material-symbols-outlined">delete_forever</span>
            </button>
            <button className="overlay-button preview-button" onClick={() => onPreviewClick(item)}>
              <span className="material-symbols-outlined">preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaPanel = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { userId: contextUserId } = useContext(EditableContext);
  const userId = contextUserId || sessionStorage.getItem("userAccount");

  // Retrieve website settings and use siteTitle as projectName.
  const websiteSettings = JSON.parse(localStorage.getItem("websiteSettings") || "{}");
  const projectName = websiteSettings.siteTitle || "";

  // Function to load media items from Firebase Storage.
  useEffect(() => {
    if (!userId) return;
    if (!projectName.trim()) {
      setMediaItems([]);
      return;
    }
    const folderPath = `usersProjectData/${userId}/projects/${projectName}`;
    const folderRef = ref(storage, folderPath);

    listAll(folderRef)
      .then((res) => {
        const promises = res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            id: itemRef.name, // Optionally, combine with a timestamp for uniqueness.
            type: 'image',    // Adjust if you also support video/file.
            name: itemRef.name,
            src: url,
          };
        });
        Promise.all(promises)
          .then((files) => {
            console.log("Retrieved files:", files);
            setMediaItems(files);
          })
          .catch((err) => {
            console.error("Error getting download URLs:", err);
          });
      })
      .catch((error) => {
        console.error("Error listing files in storage:", error);
      });
  }, [userId, projectName]);

  // Upload files directly to Storage.
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newMediaItems = [];
    for (const file of files) {
      try {
        // Define the storage path using the userId and projectName.
        const storagePath = `usersProjectData/${userId}/projects/${projectName}/${file.name}`;
        const storageRef = ref(storage, storagePath);
        // Start the upload.
        const uploadTask = uploadBytesResumable(storageRef, file);
        // Await completion.
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              // Optionally, track upload progress here.
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              newMediaItems.push({
                id: file.name + Date.now(),
                type: file.type.startsWith('image/') ? 'image' :
                      file.type.startsWith('video/') ? 'video' : 'file',
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
    // Update the state with new media items.
    setMediaItems((prevItems) => [...newMediaItems, ...prevItems]);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    await handleFileUpload({ target: { files } });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Remove, preview, search, and rename handlers (unchanged).
  const handleRemoveClick = (itemId) => {
    setMediaItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handlePreviewClick = (item) => {
    setPreviewItem(item);
  };

  const closePreviewModal = () => {
    setPreviewItem(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredItems = mediaItems.filter((item) => {
    let typeMatch = false;
    if (filterType === 'all') {
      typeMatch = true;
    } else if (filterType === 'media') {
      typeMatch = item.type === 'image' || item.type === 'video';
    } else if (filterType === 'documents') {
      typeMatch = item.type === 'file';
    }
    const nameMatch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && nameMatch;
  });

  const handleNameDoubleClick = (item) => {
    setEditingItemId(item.id);
    setEditingName(item.name || "");
  };

  const handleNameChange = (e) => {
    setEditingName(e.target.value);
  };

  const handleNameBlur = () => {
    setMediaItems((prevItems) =>
      prevItems.map((item) =>
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

  useEffect(() => {
    window.addToMediaPanel = (newItem) => {
      setMediaItems((prevItems) => [newItem, ...prevItems]);
    };
    return () => {
      window.addToMediaPanel = null;
    };
  }, []);

  return (
    <div className="media-panel scrollable-panel">
      <h3>Media Library</h3>
      {/* Filter Buttons */}
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

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search by name..." value={searchQuery} onChange={handleSearchChange} />
      </div>

      <hr />

      {/* Upload and Dropzone */}
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
        <div className="dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
          Drag & Drop Files Here
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length > 0 ? (
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

      {/* Full-size preview modal */}
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
