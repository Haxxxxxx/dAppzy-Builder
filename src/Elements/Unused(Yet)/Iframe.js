// src/Elements/Media/Iframe.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrop } from 'react-dnd';

const Iframe = ({ id, isPreviewMode }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = element;
  const isSelected = selectedElement?.id === id;
  const iframeRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState(content || '');
  const [iframeDimensions, setIframeDimensions] = useState({ width: '600px', height: '400px' });

  const defaultSrc = 'https://www.example.com';

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'iframe' });
    if (!isPreviewMode) {
      setShowModal(true);
    }
  };

  // Setup drop functionality
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'mediaItem',
    drop: (item) => {
      if (item.mediaType === 'iframe') {
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
        width: iframeDimensions.width,
        height: iframeDimensions.height,
        ...styles,
      }}
    >
      <iframe
        ref={iframeRef}
        src={content || defaultSrc}
        width="100%"
        height="100%"
        style={{
          border: 'none',
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
            <h3>Change Iframe Source and Dimensions</h3>
            <input
              type="text"
              placeholder="Enter iframe URL"
              value={newSrc}
              onChange={handleUrlChange}
              style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
            />
            <div style={{ marginBottom: '10px' }}>
              <label>
                Width:
                <input
                  type="text"
                  value={iframeDimensions.width}
                  onChange={(e) =>
                    setIframeDimensions((prev) => ({ ...prev, width: e.target.value }))
                  }
                  style={{ marginLeft: '5px', width: '80px' }}
                />
              </label>
              <label style={{ marginLeft: '20px' }}>
                Height:
                <input
                  type="text"
                  value={iframeDimensions.height}
                  onChange={(e) =>
                    setIframeDimensions((prev) => ({ ...prev, height: e.target.value }))
                  }
                  style={{ marginLeft: '5px', width: '80px' }}
                />
              </label>
            </div>
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

export default Iframe;
