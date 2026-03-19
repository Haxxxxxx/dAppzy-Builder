import React, { useState, useRef, useEffect, useCallback } from 'react';
import { projectStorage } from '../../utils/storageManager';
import '../css/SettingsPanel.css';
import { uploadFileToPinata, getGatewayUrl } from '../../utils/ipfs';
import { renameProjectFolder } from '../../utils/LeftBarUtils/storageUtils';

const WebsiteSettingsPanel = ({ onUpdateSettings, userId, onOpenMediaPanel }) => {
  const FONT_OPTIONS = [
    '', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
    'Nunito', 'Raleway', 'Playfair Display', 'Source Sans Pro', 'DM Sans',
    'Plus Jakarta Sans',
  ];

  const defaultSettings = {
    siteTitle: 'My Website',
    faviconUrl: '',
    description: 'My Project',
    author: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    primaryColor: '#5C4EFA',
    bodyFont: '',
    bodyBackgroundColor: '#ffffff',
    bodyBackgroundImage: '',
    headInjectCode: '',
  };

  const [settings, setSettings] = useState(() => {
    const cached = projectStorage.getWebsiteSettings();
    return Object.keys(cached).length > 0 ? cached : defaultSettings;
  });

  const initialProjectNameRef = useRef(settings.siteTitle);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiteTitleBlur = async () => {
    if (initialProjectNameRef.current !== settings.siteTitle) {
      try {
        setError('');
        await renameProjectFolder(initialProjectNameRef.current, settings.siteTitle, userId);
        initialProjectNameRef.current = settings.siteTitle;
      } catch (err) {
        setError('Failed to rename project. Please try again.');
      }
    }
  };

  const fileInputRef = useRef(null);

  const handleFaviconClick = () => {
    fileInputRef.current.click();
  };

  const handleFaviconFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setError('');
      const response = await uploadFileToPinata(file, userId, 'favicon');
      const hash = response.ipfsHash || response.IpfsHash;
      if (hash) {
        const ipfsUrl = getGatewayUrl(hash);
        setSettings((prev) => ({ ...prev, faviconUrl: ipfsUrl }));
      }
    } catch (err) {
      setError('Failed to upload favicon. Please try again.');
    }
  };

  // Auto-save with debounce whenever settings change
  const isInitialMount = useRef(true);

  const debouncedSave = useCallback(() => {
    projectStorage.setWebsiteSettings(settings);
    if (onUpdateSettings) {
      onUpdateSettings(settings);
    }
  }, [settings, onUpdateSettings]);

  useEffect(() => {
    // Skip auto-save on initial mount (already loaded from cache)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(debouncedSave, 300);
    return () => clearTimeout(timer);
  }, [debouncedSave]);

  return (
    <div className="settings-panel scrollable-panel">
      {error && <div className="settings-error" style={{ color: '#ff4444', fontSize: '12px', padding: '4px 8px' }}>{error}</div>}
      <div className="settings-group">
        <label htmlFor="siteTitle">Title :</label>
        <input
          type="text"
          name="siteTitle"
          value={settings.siteTitle}
          onChange={handleInputChange}
          onBlur={handleSiteTitleBlur}
          placeholder="Enter site title"
        />
      </div>
      <hr />

      <div className="settings-group">
        <label>Favicon :</label>
                {settings.faviconUrl && (
          <div className="favicon-preview">
            <div className="favicon-multi-preview">
              <div className="favicon-size size-large">
                <img src={settings.faviconUrl} alt="Favicon Large" />
              </div>
              <div className="favicon-size size-medium">
                <img src={settings.faviconUrl} alt="Favicon Medium" />
              </div>
              <div className="favicon-size size-small">
                <img src={settings.faviconUrl} alt="Favicon Small" />
              </div>
            </div>
          </div>
        )}
        <div className="upload-buttons">
          <div
            className="dropzone"
            onClick={handleFaviconClick}
          >
            <img src="./img/UploadMediaPanel.png" alt="upload icon" />
            <p>Click or Drag &amp; Drop Files Here</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFaviconFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="metaDescription">Meta Description :</label>
        <textarea
          name="metaDescription"
          value={settings.metaDescription || ''}
          onChange={handleInputChange}
          placeholder="Brief description of your website"
          rows={3}
        />
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="metaKeywords">Meta Keywords :</label>
        <input
          type="text"
          name="metaKeywords"
          value={settings.metaKeywords || ''}
          onChange={handleInputChange}
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="author">Author :</label>
        <input
          type="text"
          name="author"
          value={settings.author || ''}
          onChange={handleInputChange}
          placeholder="Author name"
        />
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="canonicalUrl">Canonical URL :</label>
        <input
          type="text"
          name="canonicalUrl"
          value={settings.canonicalUrl || ''}
          onChange={handleInputChange}
          placeholder="https://example.com/page"
        />
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="ogImage">OG Image URL :</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            name="ogImage"
            value={settings.ogImage || ''}
            onChange={handleInputChange}
            placeholder="https://example.com/image.png"
            style={{ flex: 1 }}
          />
          {onOpenMediaPanel && (
            <button
              type="button"
              className="expand-button"
              onClick={onOpenMediaPanel}
              title="Open Media Panel"
            >
              Media
            </button>
          )}
        </div>
        {settings.ogImage && (
          <div className="favicon-preview">
            <img
              src={settings.ogImage}
              alt="OG preview"
              style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '5px', marginTop: '4px' }}
            />
          </div>
        )}
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="primaryColor">Theme Color :</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            name="primaryColor"
            value={settings.primaryColor || '#5C4EFA'}
            onChange={handleInputChange}
            style={{ width: '36px', height: '36px', padding: '2px', cursor: 'pointer' }}
          />
          <input
            type="text"
            name="primaryColor"
            value={settings.primaryColor || '#5C4EFA'}
            onChange={handleInputChange}
            placeholder="#5C4EFA"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <hr />

      <div className="settings-group">
        <label htmlFor="bodyFont">Body Font :</label>
        <select
          name="bodyFont"
          value={settings.bodyFont || ''}
          onChange={handleInputChange}
        >
          <option value="">System Default</option>
          {FONT_OPTIONS.filter(Boolean).map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="bodyBackgroundColor">Background Color :</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            name="bodyBackgroundColor"
            value={settings.bodyBackgroundColor || '#ffffff'}
            onChange={handleInputChange}
            style={{ width: '36px', height: '36px', padding: '2px', cursor: 'pointer' }}
          />
          <input
            type="text"
            name="bodyBackgroundColor"
            value={settings.bodyBackgroundColor || '#ffffff'}
            onChange={handleInputChange}
            placeholder="#ffffff"
            style={{ flex: 1 }}
          />
        </div>
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="bodyBackgroundImage">Background Image URL :</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            name="bodyBackgroundImage"
            value={settings.bodyBackgroundImage || ''}
            onChange={handleInputChange}
            placeholder="https://example.com/bg.jpg"
            style={{ flex: 1 }}
          />
          {onOpenMediaPanel && (
            <button
              type="button"
              className="expand-button"
              onClick={onOpenMediaPanel}
              title="Open Media Panel"
            >
              Media
            </button>
          )}
        </div>
        {settings.bodyBackgroundImage && (
          <div className="favicon-preview">
            <img
              src={settings.bodyBackgroundImage}
              alt="Background preview"
              style={{ maxWidth: '100%', maxHeight: '80px', borderRadius: '5px', marginTop: '4px', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
      <hr />

      <div className="settings-group">
        <label htmlFor="headInjectCode">Custom Head Code :</label>
        <span style={{ fontSize: '11px', color: '#999', lineHeight: '1.3' }}>
          Add custom code to &lt;head&gt; (analytics, fonts, etc.)
        </span>
        <textarea
          name="headInjectCode"
          value={settings.headInjectCode || ''}
          onChange={handleInputChange}
          placeholder={'<!-- Google Analytics -->\n<script async src="..."></script>'}
          rows={5}
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            resize: 'vertical',
          }}
        />
        <span style={{ fontSize: '11px', color: '#e8a838', lineHeight: '1.3' }}>
          ⚠ Code is injected as-is. Use with caution.
        </span>
      </div>

    </div>
  );
};

export default WebsiteSettingsPanel;
