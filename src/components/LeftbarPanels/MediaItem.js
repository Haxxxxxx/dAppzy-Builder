import React from 'react';
import './css/MediaPanel.css';
import { useDrag } from 'react-dnd';

function getTruncatedName(fullName) {
  if (!fullName) return "Untitled";
  const lastDotIndex = fullName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    // no extension
    return maybeTruncate(fullName);
  } else {
    const base = fullName.substring(0, lastDotIndex);
    const extension = fullName.substring(lastDotIndex + 1);
    return maybeTruncate(base) + "." + extension;
  }
}

function maybeTruncate(str) {
  if (str.length <= 6) return str;
  return str.substring(0, 4) + "..." + str.substring(str.length - 2);
}

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
  // Map media panel types to element types accepted by UnifiedDropZone / ContentList
  const DRAGGABLE_MEDIA = { image: true, video: true, audio: true };
  const isDraggableType = !!DRAGGABLE_MEDIA[item.type];

  const [{ isDragging }, drag] = useDrag(() => ({
    // Use the element type string so UnifiedDropZone's accept list recognises it
    type: item.type,
    item: () => {
      const base = { type: item.type, content: item.src };
      if (item.type === 'image') {
        return { ...base, styles: { width: '100%', height: 'auto' } };
      }
      return base;
    },
    canDrag: isDraggableType,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item.id, item.src, item.type]);

  return (
    <div
      key={item.id}
      className={`media-item ${editingItemId === item.id ? 'editing' : ''}`}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDraggableType ? "grab" : "default"
      }}
    >
      <div className="media-preview">
        {item.type === 'image' && <img src={item.src} alt={item.name || "Media item"} />}
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
              {getTruncatedName(item.name)}
            </p>
          )}
          <div className="overlay-buttons">
            <button className="overlay-button remove-button" onClick={() => onRemoveClick(item.id)}>
              <span className="material-symbols-outlined">delete_forever</span>
            </button>
            <button className="overlay-button preview-button" onClick={() => onPreviewClick(item)}>
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
