import React, { useState, useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const IconSettings = () => {
  const { selectedElement, updateStyles, updateElementProperties } = useContext(EditableContext);
  const [iconSrc, setIconSrc] = useState('');
  const [iconSize, setIconSize] = useState('40');
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedElement?.type === 'icon') {
      setIconSrc(selectedElement.src || '');
      const styles = selectedElement.styles || {};
      setIconSize(parseInt(styles.maxWidth, 10) || 40);
      setAltText(styles.alt || '');
    }
  }, [selectedElement]);

  const handleSrcChange = (e) => {
    const src = e.target.value;
    setIconSrc(src);
  };

  const handleSrcBlur = () => {
    if (selectedElement && iconSrc) {
      updateElementProperties(selectedElement.id, { src: iconSrc });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSrc = URL.createObjectURL(file);
      setIconSrc(newSrc);
      if (selectedElement) {
        updateElementProperties(selectedElement.id, { src: newSrc });
      }
    }
  };

  const handleSizeChange = (e) => {
    const val = e.target.value;
    setIconSize(val);
    if (selectedElement && val) {
      updateStyles(selectedElement.id, {
        maxWidth: val + 'px',
        maxHeight: val + 'px',
      });
    }
  };

  const handleAltChange = (e) => {
    const val = e.target.value;
    setAltText(val);
    if (selectedElement) {
      updateStyles(selectedElement.id, { alt: val });
    }
  };

  if (!selectedElement || selectedElement.type !== 'icon') return null;

  return (
    <div className="wallet-settings-panel">
      <hr />
      <div className="settings-group">
        <label htmlFor="iconId">ID</label>
        <input type="text" id="iconId" value={selectedElement.id || ''} readOnly className="settings-input" />
      </div>
      <hr />

      <CollapsibleSection title="Icon Settings">
        <div className="settings-group">
          <label>Icon URL</label>
          <input
            type="text"
            value={iconSrc}
            onChange={handleSrcChange}
            onBlur={handleSrcBlur}
            placeholder="Icon image URL"
            className="settings-input"
            style={{ width: '100%' }}
          />
        </div>
        <div className="settings-group">
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '6px 12px',
              background: 'var(--input-bg, #2a2a3a)',
              border: '1px solid var(--border-color, #333)',
              borderRadius: '4px',
              color: 'var(--editor-text, #fff)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Upload Icon
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="settings-group">
          <label>Size (px)</label>
          <input
            type="number"
            value={iconSize}
            onChange={handleSizeChange}
            min={8}
            max={256}
            className="settings-input"
          />
        </div>
        <div className="settings-group">
          <label>Alt Text</label>
          <input
            type="text"
            value={altText}
            onChange={handleAltChange}
            placeholder="Icon description"
            className="settings-input"
            style={{ width: '100%' }}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default IconSettings;
