// src/Elements/Media/Audio.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useDrop } from 'react-dnd';

const Audio = ({ id, isPreviewMode }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = element;
  const isSelected = selectedElement?.id === id;
  const audioRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState(content || '');

  const defaultSrc = 'https://www.w3schools.com/html/horse.ogg';

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'audio' });
    if (!isPreviewMode) {
      setShowModal(true);
    }
  };  

  useEffect(() => {
    if (isSelected && audioRef.current) audioRef.current.focus();
  }, [isSelected]);

  // Setup drop functionality
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'mediaItem',
    drop: (item) => {
      if (item.mediaType === 'audio') {
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

  // Remove unnecessary event listener for outside clicks
  // Since the modal covers the entire screen, clicking outside should close it

  return (
    <div
      id={id}
      ref={drop}
      onClick={handleSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        border: isOver ? '2px dashed blue' : isSelected ? '1px dashed blue' : 'none',
        display: 'inline-block',
        ...styles,
      }}
    >
      <audio
        ref={audioRef}
        src={content || defaultSrc}
        controls
        style={{
          outline: 'none',
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
            <h3>Change Audio Source</h3>
            <input
              type="text"
              placeholder="Enter audio URL"
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

export default Audio;
