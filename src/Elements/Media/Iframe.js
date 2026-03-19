import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';

const Iframe = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = element;
  const isSelected = selectedElement?.id === id;
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState(content || '');

  const defaultSrc = 'about:blank';

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'iframe' });
    setShowModal(true);
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
      onClick={handleSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-block',
        width: styles.width || '100%',
        height: styles.height || '300px',
        ...styles,
      }}
    >
      {content ? (
        <iframe
          src={content}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none', pointerEvents: isSelected ? 'none' : 'auto' }}
          title="Embedded content"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f0f0',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            color: '#666',
            fontFamily: 'Montserrat',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '8px' }}>code</span>
          <span>Click to set embed URL</span>
        </div>
      )}

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              minWidth: '400px',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0' }}>Edit Embed URL</h3>
            <input
              type="text"
              placeholder="Enter URL (e.g. https://maps.google.com/...)"
              value={newSrc}
              onChange={(e) => setNewSrc(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSrcChange}
                style={{ padding: '8px 16px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Iframe;
