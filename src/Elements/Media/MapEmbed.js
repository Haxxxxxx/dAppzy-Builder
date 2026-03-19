import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';

/**
 * Converts a plain address string into a Google Maps embed URL.
 * If the content already looks like a URL it is returned as-is.
 */
function toEmbedUrl(raw) {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
    return trimmed;
  }
  // Treat as a plain address — build a Google Maps embed query
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

const MapEmbed = ({ id }) => {
  const { selectedElement, setSelectedElement, elements, updateContent } = useContext(EditableContext);
  const element = elements.find((el) => el.id === id) || {};
  const { content = '', styles = {} } = element;
  const isSelected = selectedElement?.id === id;
  const [showModal, setShowModal] = useState(false);
  const [newSrc, setNewSrc] = useState(content || '');

  // Sync modal input when content changes externally (e.g., via AI command)
  React.useEffect(() => { setNewSrc(content || ''); }, [content]);

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type: 'mapEmbed' });
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleSrcChange = () => {
    if (newSrc) {
      updateContent(id, newSrc);
    }
    setShowModal(false);
  };

  const embedUrl = toEmbedUrl(content);

  return (
    <div
      id={id}
      onClick={handleSelect}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        width: styles.width || '100%',
        height: styles.height || '300px',
        borderRadius: styles.borderRadius || '8px',
        overflow: 'hidden',
        ...styles,
      }}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none', pointerEvents: isSelected ? 'none' : 'auto', borderRadius: 'inherit' }}
          title="Map embed"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
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
          <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '8px' }}>location_on</span>
          <span>Enter address or Google Maps embed URL</span>
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
            <h3 style={{ margin: '0 0 12px 0' }}>Edit Map Location</h3>
            <input
              type="text"
              placeholder="Paste a Google Maps embed URL or enter an address"
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

export default MapEmbed;
