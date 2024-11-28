import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Image = ({ id, styles: customStyles, width = 'auto', height = 'auto', src }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id) || {}; // Fallback to avoid undefined errors
  const { content = '', styles = {} } = imageElement;
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState(content || src || ''); // Initialize with current content or src
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
        ...customStyles, // Custom styles take precedence
        position: 'relative',
        cursor: 'pointer',
        alignContent: 'center',
      }}
      aria-label="Editable image"
    >
      <img
        src={content || src || defaultSrc} // Use content from context, or src prop, or default IPFS hash
        alt="Editable element"
        style={{ maxWidth: '100%', height, width }}
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
