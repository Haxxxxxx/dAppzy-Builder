import React from 'react';
import './css/MediaPanel.css';
import { useDrag } from 'react-dnd';

export const MediaItem = ({
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
    item: { 
      id: item.id, 
      src: item.src, 
      mediaType: item.type // Ensures correct media type
    },
    canDrag: item.type === "image", // ❌ Prevent dragging non-images to the image slot
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      key={item.id}
      className={`media-item ${editingItemId === item.id ? 'editing' : ''}`}
      ref={drag}
      style={{ 
        opacity: isDragging ? 0.5 : 1, 
        cursor: item.type === "image" ? "grab" : "not-allowed" // ❌ Prevent dragging PDFs
      }}
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
        {item.type === 'file' && (
          <div className="file-preview">
            <div className="file-icon">📄</div>
            <div className="file-label">File</div>
          </div>
        )}

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
