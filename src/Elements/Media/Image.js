import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Image = ({ id, styles: customStyles, src, isLogo }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = imageElement;
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState(content || src || '');
  const modalRef = useRef(null);

  const defaultSrc = `https://ipfs.io/ipfs/QmPYNr9i6RR2bFpW9jnaME4NLCm9qcMDMEhxtFKqK3uvwM`;

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'image' });
    setShowModal(true);
  };

  const handleSrcChange = () => {
    if (newSrc) {
      updateContent(id, newSrc);
    }
    setShowModal(false);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Src = e.target.result;
        updateContent(id, base64Src);
        setNewSrc(base64Src);
      };
      reader.onerror = () => {
        console.error('Failed to read the file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    setNewSrc(e.target.value);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showModal]);

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        ...styles,
        ...customStyles,
        ...(isLogo && {
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          overflow: 'hidden', // Ensures image fits within the circular container
        }),
        position: 'relative',
        cursor: 'pointer',
      }}
      aria-label="Editable image"
    >
      <img
        src={content || src || defaultSrc}
        alt="Editable element"
        style={{
          objectFit: 'cover', // Ensures the image covers the container completely
          width: '100%',
          height: '100%',
          ...(isLogo && {
            borderRadius: '50%', // Ensures the image itself is round
          }),
        }}
      />
      {showModal && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content" ref={modalRef}>
            <h3>Change Image Source</h3>
            <input
              type="text"
              placeholder="Enter image URL"
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
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                border: '1px dashed #ccc',
                padding: '20px',
                textAlign: 'center',
                marginTop: '10px',
                cursor: 'pointer',
              }}
              aria-label="Drag and drop image file here"
            >
              Drop an image file here
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Image;
