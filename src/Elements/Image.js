import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';

const Image = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const imageElement = elements.find((el) => el.id === id);
  const { content = '', styles = {} } = imageElement || {};
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState('');
  const modalRef = useRef(null);

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
      style={{ ...styles, cursor: 'pointer', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}
    >
      <img
        src={content || 'https://via.placeholder.com/150'}
        alt="Placeholder"
        style={{ maxWidth: '100%', height: 'auto' }}
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
