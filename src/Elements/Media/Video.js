// src/Elements/Media/Video.js
import React, { useContext, useRef, useEffect, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrop } from 'react-dnd';

const Video = ({ id, isPreviewMode }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = element;
  const isSelected = selectedElement?.id === id;
  const videoRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState(content || '');
  const [videoDimensions, setVideoDimensions] = useState({ width: null, height: null });

  const defaultSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'video' });
    if (!isPreviewMode) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    if (isSelected && videoRef.current) videoRef.current.focus();
  }, [isSelected]);

  // Handle video load to get its natural dimensions
  const handleVideoLoad = () => {
    if (videoRef.current) {
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      setVideoDimensions({ width: videoWidth, height: videoHeight });
    }
  };

  // Setup drop functionality
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'mediaItem',
    drop: (item) => {
      if (item.mediaType === 'video') {
        updateContent(id, item.src);
        setNewSrc(item.src);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleUrlChange = (e) => {
    setNewSrc(e.target.value);
  };

  const handleSrcChange = () => {
    if (newSrc) {
      updateContent(id, newSrc);
    }
    setShowModal(false);
  };

  return (
    <div
      id={id}
      ref={drop}
      onClick={handleSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        border: isOver ? '2px dashed blue' : 'none',
        display: 'inline-block',
        ...(videoDimensions.width && videoDimensions.height
          ? {
              width: videoDimensions.width,
              height: videoDimensions.height,
            }
          : {}),
        ...styles,
      }}
    >
      <video
        ref={videoRef}
        src={content || defaultSrc}
        controls
        onLoadedMetadata={handleVideoLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      {showModal && (
        <div
          className="modal"
          onClick={() => setShowModal(false)} // Close modal when clicking outside content
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
          >
            <h3>Change Video Source</h3>
            <input
              type="text"
              placeholder="Enter video URL"
              value={newSrc}
              onChange={handleUrlChange}
              style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
            />
            <button
              onClick={handleSrcChange}
              style={{
                marginRight: '10px',
                padding: '10px 20px',
                backgroundColor: '#007BFF',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ccc',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
