import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import PlaybackSettings from './VideoSettings/PlaybackSettings';
import '../../css/SettingsPanel.css'; // Common styles
import './css/BackgroundSettings.css'; // Specific styles for background settings
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const BackgroundSettings = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [localSettings, setLocalSettings] = useState({
    id: '',
    // Available options: 'none', 'default', 'color', 'image', 'video'
    backgroundType: 'none',
    backgroundUrl: '',
    backgroundColor: '',
    muted: false,
    autoplay: false,
    controls: true,
  });

  useEffect(() => {
    if (selectedElement) {
      setLocalSettings({
        id: selectedElement.id || '',
        backgroundType: selectedElement.styles?.backgroundType || 'none',
        backgroundUrl: selectedElement.styles?.backgroundUrl || '',
        backgroundColor: selectedElement.styles?.backgroundColor || '',
        muted: selectedElement.styles?.muted || false,
        autoplay: selectedElement.styles?.autoplay || false,
        controls: selectedElement.styles?.controls !== undefined ? selectedElement.styles.controls : true,
      });
    }
  }, [selectedElement]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
    updateStyles(selectedElement.id, { [name]: value });
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setLocalSettings((prevSettings) => ({
      ...prevSettings,
      backgroundColor: color,
    }));
    updateStyles(selectedElement.id, { backgroundColor: color });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        backgroundUrl: fileUrl,
      }));
      updateStyles(selectedElement.id, { backgroundUrl: fileUrl });
    }
  };

  const handlePlaybackChange = (key, value) => {
    setLocalSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
    updateStyles(selectedElement.id, { [key]: value });
  };

  const handleClearBackground = () => {
    const clearedSettings = {
      backgroundType: 'none',
      backgroundUrl: '',
      backgroundColor: '',
      muted: false,
      autoplay: false,
      controls: true,
    };
    setLocalSettings((prev) => ({ ...prev, ...clearedSettings }));
    updateStyles(selectedElement.id, clearedSettings);
  };

  return (
    <div className="settings-panel background-settings-panel">
      <CollapsibleSection title="Background Settings">
        <div className="settings-wrapper">
          {/* Background Type Selector */}
          <div className="settings-group">
            <label htmlFor="backgroundType">Background Type</label>
            <select
              id="backgroundType"
              name="backgroundType"
              value={localSettings.backgroundType}
              onChange={handleInputChange}
              className="settings-input"
            >
              <option value="none">None</option>
              <option value="default">Default</option>
              <option value="color">Color</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Color Picker for Color Background */}
          {localSettings.backgroundType === 'color' && (
            <div className="settings-group">
              <label htmlFor="backgroundColor">Background Color</label>
              <input
                type="color"
                id="backgroundColor"
                name="backgroundColor"
                value={localSettings.backgroundColor}
                onChange={handleColorChange}
                className="settings-input"
              />
            </div>
          )}

          {/* File Upload & Preview for Image/Video Background */}
          {(localSettings.backgroundType === 'image' ||
            localSettings.backgroundType === 'video') && (
            <div className="settings-group background-preview-wrapper">
              {localSettings.backgroundType === 'image' ? (
                <img
                  src={localSettings.backgroundUrl}
                  alt="Background Preview"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              ) : (
                <video
                  src={localSettings.backgroundUrl}
                  muted={localSettings.muted}
                  autoPlay={localSettings.autoplay}
                  controls={localSettings.controls}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              )}
              <div className="settings-group full-width">
                <button
                  className="replace-button"
                  onClick={() =>
                    document.getElementById('uploadFileHidden').click()
                  }
                >
                  Replace {localSettings.backgroundType}
                </button>
                <input
                  type="file"
                  id="uploadFileHidden"
                  accept={
                    localSettings.backgroundType === 'image'
                      ? 'image/*'
                      : 'video/*'
                  }
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Playback Settings for Video Background */}
          {localSettings.backgroundType === 'video' && (
            <PlaybackSettings
              isMuted={localSettings.muted}
              isAutoplay={localSettings.autoplay}
              showControls={localSettings.controls}
              handlePlaybackChange={handlePlaybackChange}
            />
          )}

          {/* Clear Button */}
          <button className="clear-button" onClick={handleClearBackground}>
            Clear Background
          </button>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default BackgroundSettings;
