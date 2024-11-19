import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../context/EditableContext';

// Updated Image Component
const Image = ({ id, styles: customStyles, width = 'auto', height = 'auto', src }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id);
  const { content = '', styles = {} } = imageElement || {};
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState('');
  const modalRef = useRef(null);

  // Default IPFS hash as src if none is provided
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
        sessionStorage.setItem(`image_${id}`, e.target.result);
        updateContent(id, e.target.result);
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
      }}
    >
      <img
        src={content || src || defaultSrc} // Use content from context, or src prop, or default IPFS hash
        alt="Placeholder"
        style={{ maxWidth: '100%', height: height, width: width }}
      />
      {showModal && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <h3>Change Image Source</h3>
            <input
              type="text"
              placeholder="Enter image URL"
              value={newSrc}
              onChange={handleUrlChange}
              style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
            />
            <button onClick={handleSrcChange} style={{ marginRight: '10px' }}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center', marginTop: '10px' }}
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
