// src/components/LeftbarPanels/MediaPanel.js
import React, { useState, useEffect } from 'react';
import './css/MediaPanel.css';
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase';
import { MediaItem } from './MediaItem';

/**
 * A helper to determine file type from a File object (on upload).
 * We use the MIME type to decide if it's an image, video, or file (pdf, doc, etc.).
 */
function getMediaTypeFromFile(file) {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  // You can extend to more document types if needed
  if (mime === "application/pdf") return "file";
  return "file";
}

/**
 * A helper to guess file type from an extension (when loading from Firebase).
 * Because we don’t have direct access to the MIME type in `listAll`.
 */
function guessTypeFromExtension(filename) {
  const ext = filename.toLowerCase().split(".").pop();
  const images = ["png","jpg","jpeg","webp","gif","svg","bmp","ico","tiff"];
  const videos = ["mp4","mov","avi","wmv","mkv","webm"];
  
  if (images.includes(ext)) return "image";
  if (videos.includes(ext)) return "video";
  if (ext === "pdf") return "file"; // Could add doc, docx, etc.
  
  return "file";
}

const MediaPanel = ({ projectName, isOpen, userId }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 1) Fetch media from Firebase Storage for this user/project.
   *    We guess the file type from its extension.
   */
  const fetchMedia = async () => {
    if (!userId || !projectName.trim()) {
      setMediaItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const folderPath = `usersProjectData/${userId}/projects/${projectName}`;
      const folderRef = ref(storage, folderPath);
      const res = await listAll(folderRef);

      const promises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          id: itemRef.name,
          type: guessTypeFromExtension(itemRef.name), // <--- Distinguish type here
          name: itemRef.name,
          src: url,
        };
      });

      const files = await Promise.all(promises);
      setMediaItems(files);
    } catch (error) {
      console.error("Error listing files in storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2) Handle file uploads by setting the correct `type` using MIME.
   */
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
            "state_changed",
            () => {},
            (error) => reject(error),
            async () => {
              // Once upload is complete, get the download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              // Determine type from MIME
              const fileType = getMediaTypeFromFile(file);

              newMediaItems.push({
                id: file.name + Date.now(), // Unique ID
                type: fileType,            // image, video, or file
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
    // Merge with existing media
    setMediaItems((prevItems) => [...newMediaItems, ...prevItems]);
  };

  /**
   * 3) Drag & Drop Upload
   */
  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    await handleFileUpload({ target: { files } });
  };
  const handleDragOver = (event) => event.preventDefault();

  /**
   * 4) Remove items from Firebase + local state
   */
  const handleRemoveClick = async (itemId) => {
    const itemToRemove = mediaItems.find((item) => item.id === itemId);
    if (!itemToRemove) return;

    try {
      const itemRef = ref(
        storage,
        `usersProjectData/${userId}/projects/${projectName}/${itemToRemove.name}`
      );
      await deleteObject(itemRef);
      setMediaItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }
  };

  /**
   * 5) Preview modal handlers
   */
  const handlePreviewClick = (item) => setPreviewItem(item);
  const closePreviewModal = () => setPreviewItem(null);

  /**
   * 6) In-line editing of file names
   */
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

  /**
   * 7) Filtering logic: images & videos -> "media", pdf/other -> "documents"
   */
  const handleSetFilterType = (type) => {
    setFilterType(type);
  };

  const filteredItems = mediaItems.filter((item) => {
    // Filter by type
    let typeMatch = false;
    if (filterType === 'all') {
      typeMatch = true;
    } else if (filterType === 'media') {
      // Accept both images and videos
      typeMatch = (item.type === 'image' || item.type === 'video');
    } else if (filterType === 'documents') {
      // Non-image, non-video => "file"
      typeMatch = (item.type === 'file');
    }

    // Filter by name
    const nameMatch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && nameMatch;
  });

  /**
   * 8) Fetch media when panel opens
   */
  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /**
   * 9) Optional: Provide a global way to add items from outside
   */
  useEffect(() => {
    window.addToMediaPanel = (newItem) => {
      setMediaItems((prev) => [newItem, ...prev]);
    };
    return () => {
      window.addToMediaPanel = null;
    };
  }, []);

  /**
   * 10) Render
   */
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
          onChange={e => setSearchQuery(e.target.value)}
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
