// src/components/LeftbarPanels/MediaPanel.js
import React, { useState } from 'react';
import './css/MediaPanel.css'; // Ensure this file includes necessary styles
import { useDrag } from 'react-dnd';

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
  // Set up drag
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
        {item.type === 'image' && <img src={item.src} alt={item.name} />}
        {item.type === 'video' && (
          <video>
            <source src={item.src} type="video/mp4" />
          </video>
        )}
        {item.type === 'file' && <div className="file-icon">📄</div>}

        {/* Overlay content on hover */}
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
            <p
              className="media-name"
              onDoubleClick={() => onNameDoubleClick(item)}
            >
              {item.name}
            </p>
          )}
          <div className="overlay-buttons">
            <button
              className="overlay-button remove-button"
              onClick={() => onRemoveClick(item.id)}
            >
              Remove
            </button>
            <button
              className="overlay-button preview-button"
              onClick={() => onPreviewClick(item)}
            >
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaPanel = () => {
  // Media list with state to allow adding new items
  const [mediaItems, setMediaItems] = useState([
    { id: 1, type: 'image', name: 'Example Image', src: 'https://via.placeholder.com/300' },
    { id: 2, type: 'image', name: 'Another Image', src: 'https://via.placeholder.com/300/0000FF/808080' },
    { id: 3, type: 'video', name: 'Example Video', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 4, type: 'file', name: 'Example File', src: 'https://example.com/sample.pdf' },
    // Add more media items as needed
  ]);

  const [previewItem, setPreviewItem] = useState(null); // State for full-size preview
  const [filterType, setFilterType] = useState('all'); // 'all', 'media', 'documents'

  // State for editing media name
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemoveClick = (itemId) => {
    // Remove the media item from the list
    setMediaItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handlePreviewClick = (item) => {
    // Show the full-size preview of the media item
    setPreviewItem(item);
  };

  const closePreviewModal = () => {
    setPreviewItem(null);
  };

  // Handle file uploads from file explorer
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  // Handle files dropped into the dropzone
  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  };

  // Prevent default behavior for drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Process the files and update mediaItems state
  const handleFiles = (files) => {
    const newMediaItems = files.map((file) => {
      const id = Date.now() + Math.random();
      const name = file.name;
      const type = getFileType(file);
      const src = URL.createObjectURL(file);
      return { id, type, name, src };
    });
    setMediaItems((prevItems) => [...newMediaItems, ...prevItems]);
  };

  // Determine file type based on MIME type
  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'file';
    return 'file';
  };

  // Handle double-click on media name to start editing
  const handleNameDoubleClick = (item) => {
    setEditingItemId(item.id);
    setEditingName(item.name);
  };

  // Handle changes in the input field
  const handleNameChange = (e) => {
    setEditingName(e.target.value);
  };

  // Handle blur event to save the new name
  const handleNameBlur = () => {
    setMediaItems((prevItems) =>
      prevItems.map((item) =>
        item.id === editingItemId ? { ...item, name: editingName } : item
      )
    );
    setEditingItemId(null);
    setEditingName('');
  };

  // Handle Enter key press to save the new name
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtered media items based on filterType and search query
  const filteredItems = mediaItems.filter((item) => {
    // Filter by type
    let typeMatch = false;
    if (filterType === 'all') {
      typeMatch = true;
    } else if (filterType === 'media') {
      typeMatch = item.type === 'image' || item.type === 'video';
    } else if (filterType === 'documents') {
      typeMatch = item.type === 'file';
    }

    // Filter by search query
    const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    // If search query matches multiple items with similar names but different types, automatically filter by type
    if (searchQuery && nameMatch) {
      if (filterType === 'all') {
        setFilterType(item.type === 'file' ? 'documents' : 'media');
      }
    }

    return typeMatch && nameMatch;
  });

  return (
    <div className="media-panel scrollable-panel">
      <h3>Media Library</h3>
      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={filterType === 'media' ? 'active' : ''}
          onClick={() => setFilterType('media')}
        >
          Media
        </button>
        <button
          className={filterType === 'documents' ? 'active' : ''}
          onClick={() => setFilterType('documents')}
        >
          Documents
        </button>
        <button
          className={filterType === 'all' ? 'active' : ''}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <hr />

      {/* Upload and Dropzone Buttons */}
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
        <div
          className="dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          Drag & Drop Files Here
        </div>
      </div>

      {/* Media Grid */}
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

      {/* Full-size preview modal */}
      {previewItem && (
        <div className="preview-modal" onClick={closePreviewModal}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            {previewItem.type === 'image' && (
              <img src={previewItem.src} alt={previewItem.name} />
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
