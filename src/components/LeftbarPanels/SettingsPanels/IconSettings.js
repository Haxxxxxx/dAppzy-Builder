import React, { useState, useContext, useEffect, useRef } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import CollapsibleSection from './LinkSettings/CollapsibleSection';
import './css/IconSettings.css';

const MATERIAL_ICONS = [
  'home', 'search', 'menu', 'close', 'settings', 'person', 'email', 'phone',
  'star', 'favorite', 'add', 'remove', 'edit', 'delete', 'share', 'link',
  'visibility', 'lock', 'notifications', 'shopping_cart', 'download', 'upload',
  'arrow_forward', 'arrow_back', 'check_circle', 'error', 'warning', 'info',
  'help', 'language', 'public', 'code', 'palette', 'brush', 'image', 'videocam',
  'music_note', 'mic', 'send', 'chat', 'group', 'work', 'school', 'flight',
  'restaurant', 'local_shipping', 'payments', 'trophy', 'rocket_launch',
  'auto_awesome', 'magic_button',
];

const IconSettings = () => {
  const { selectedElement, updateStyles, updateElementProperties } = useContext(EditableContext);
  const [iconSrc, setIconSrc] = useState('');
  const [iconSize, setIconSize] = useState('40');
  const [altText, setAltText] = useState('');
  const [iconSearch, setIconSearch] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedElement?.type === 'icon') {
      setIconSrc(selectedElement.src || '');
      const styles = selectedElement.styles || {};
      setIconSize(parseInt(styles.maxWidth, 10) || 40);
      setAltText(styles.alt || '');
      // If the element has a content that matches an icon name, pre-select it
      const content = selectedElement.content || '';
      if (MATERIAL_ICONS.includes(content)) {
        setSelectedIcon(content);
      } else {
        setSelectedIcon('');
      }
    }
  }, [selectedElement]);

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    if (selectedElement) {
      updateElementProperties(selectedElement.id, {
        content: iconName,
        src: '', // Clear image src when using a Material Symbol
      });
    }
  };

  const handleSrcChange = (e) => {
    const src = e.target.value;
    setIconSrc(src);
  };

  const handleSrcBlur = () => {
    if (selectedElement && iconSrc) {
      setSelectedIcon(''); // Deselect material icon when using custom URL
      updateElementProperties(selectedElement.id, { src: iconSrc, content: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newSrc = URL.createObjectURL(file);
      setIconSrc(newSrc);
      setSelectedIcon('');
      if (selectedElement) {
        updateElementProperties(selectedElement.id, { src: newSrc, content: '' });
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
        fontSize: val + 'px',
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

  const filteredIcons = iconSearch
    ? MATERIAL_ICONS.filter(name => name.includes(iconSearch.toLowerCase().replace(/\s+/g, '_')))
    : MATERIAL_ICONS;

  if (!selectedElement || selectedElement.type !== 'icon') return null;

  return (
    <div className="wallet-settings-panel">
      <hr />
      <div className="settings-group">
        <label htmlFor="iconId">ID</label>
        <input type="text" id="iconId" value={selectedElement.id || ''} readOnly className="settings-input" />
      </div>
      <hr />

      <CollapsibleSection title="Material Icons">
        <div className="icon-picker-container">
          <input
            type="text"
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            placeholder="Search icons..."
            className="settings-input icon-search-input"
          />
          <div className="icon-grid">
            {filteredIcons.map(iconName => (
              <button
                key={iconName}
                className={`icon-grid-item ${selectedIcon === iconName ? 'icon-grid-item--selected' : ''}`}
                onClick={() => handleIconSelect(iconName)}
                title={iconName}
                type="button"
              >
                <span className="material-symbols-outlined">{iconName}</span>
                <span className="icon-grid-label">{iconName.replace(/_/g, ' ')}</span>
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <p className="icon-grid-empty">No icons match your search.</p>
            )}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Custom Image" defaultExpanded={false}>
        <div className="settings-group">
          <label>Icon URL</label>
          <input
            type="text"
            value={iconSrc}
            onChange={handleSrcChange}
            onBlur={handleSrcBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSrcBlur(); }}
            placeholder="Icon image URL"
            className="settings-input"
            style={{ width: '100%' }}
          />
        </div>
        <div className="settings-group">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="icon-upload-button"
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
      </CollapsibleSection>

      <CollapsibleSection title="Icon Settings">
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
