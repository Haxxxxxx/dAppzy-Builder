import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import PlaybackSettings from './VideoSettings/PlaybackSettings';
import '../../css/SettingsPanel.css'; // Common styles
import './css/BackgroundSettings.css'; // Specific styles for background settings
import CollapsibleSection from './LinkSettings/CollapsibleSection';

// Helper: convert hex to rgb string, e.g. "#ff0000" => "rgb(255, 0, 0)"
const hexToRgb = (hex) => {
  // Remove hash if present.
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgb(${r}, ${g}, ${b})`;
};

// Helper: convert an rgb string "rgb(255, 0, 0)" to hex "#ff0000"
const rgbToHex = (rgb) => {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return '';
  const r = parseInt(result[0], 10).toString(16).padStart(2, '0');
  const g = parseInt(result[1], 10).toString(16).padStart(2, '0');
  const b = parseInt(result[2], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};

const BackgroundSettings = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  // New state: which color format to show (either "hex" or "rgb")
  const [colorFormat, setColorFormat] = useState('hex');

  // Extend local settings to include background and display-related properties.
  const [localSettings, setLocalSettings] = useState({
    id: '',
    backgroundType: 'none',   // 'none', 'default', 'color', 'image', 'video'
    backgroundUrl: '',
    backgroundColor: '',
    muted: false,
    autoplay: false,
    controls: true,
    // Display settings:
    display: 'block',         // block, flex, inline-block, grid, etc.
    gap: '',                  // Numeric gap in pixels (as string or number)
    flexDirection: 'row',     // Flex container: row or column.
    justifyContent: 'flex-start', // Justify content for flex or grid
    alignItems: 'stretch',        // Align items for flex or grid
    alignContent: 'stretch',      // Align content (works for multi-line flex or grid)
  });

  // Load settings from the selected element if available
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
        display: selectedElement.styles?.display || 'block',
        gap: selectedElement.styles?.gap ? parseInt(selectedElement.styles.gap, 10) : '',
        flexDirection: selectedElement.styles?.flexDirection || 'row',
        justifyContent: selectedElement.styles?.justifyContent || 'flex-start',
        alignItems: selectedElement.styles?.alignItems || 'stretch',
        alignContent: selectedElement.styles?.alignContent || 'stretch',
      });
    }
  }, [selectedElement]);

  // Handle generic input changes and update the element styles
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gap') {
      const numericValue = value ? Number(value) : '';
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        [name]: numericValue,
      }));
      updateStyles(selectedElement.id, { gap: numericValue ? `${numericValue}px` : '' });
    } else {
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        [name]: value,
      }));
      updateStyles(selectedElement.id, { [name]: value });
    }
  };

  // Handle background color changes via color picker
  const handleColorChange = (e) => {
    const color = e.target.value;
    setLocalSettings((prevSettings) => ({
      ...prevSettings,
      backgroundColor: color,
    }));
    updateStyles(selectedElement.id, { backgroundColor: color });
  };

  // When the user manually edits the color code
  const handleColorCodeChange = (e) => {
    const newCode = e.target.value;
    setLocalSettings((prevSettings) => ({
      ...prevSettings,
      backgroundColor: newCode,
    }));
    updateStyles(selectedElement.id, { backgroundColor: newCode });
  };

  // Toggle the color format between hex and rgb.
  const toggleColorFormat = () => {
    setColorFormat((prev) => (prev === 'hex' ? 'rgb' : 'hex'));
  };

  // Handle file uploads for image or video backgrounds.
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

  // Handle changes to playback settings for video backgrounds.
  const handlePlaybackChange = (key, value) => {
    setLocalSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
    updateStyles(selectedElement.id, { [key]: value });
  };

  // Clear background settings.
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

  // Compute the displayed color code based on the selected format.
  let displayColorCode = localSettings.backgroundColor;
  if (localSettings.backgroundColor) {
    if (colorFormat === 'rgb' && localSettings.backgroundColor.startsWith('#')) {
      displayColorCode = hexToRgb(localSettings.backgroundColor);
    } else if (colorFormat === 'hex' && localSettings.backgroundColor.startsWith('rgb')) {
      displayColorCode = rgbToHex(localSettings.backgroundColor);
    }
  }

  return (
    <div className="settings-panel background-settings-panel">
      {/* Background Settings Section */}
      <CollapsibleSection title="Background Settings">
        <div className="settings-wrapper">
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

          {localSettings.backgroundType === 'color' && (
            <div className="settings-group">
              <label htmlFor="backgroundColor">Background Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  id="backgroundColor"
                  name="backgroundColor"
                  value={localSettings.backgroundColor}
                  onChange={handleColorChange}
                  className="settings-input color-picker"
                />
                <input
                  type="text"
                  id="colorCode"
                  name="colorCode"
                  value={displayColorCode}
                  onChange={handleColorCodeChange}
                  className="settings-input color-code-input"
                />
                <button type="button" onClick={toggleColorFormat} className="toggle-button">
                  {colorFormat === 'hex' ? 'RGB' : 'HEX'}
                </button>
              </div>
            </div>
          )}

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

          {localSettings.backgroundType === 'video' && (
            <PlaybackSettings
              isMuted={localSettings.muted}
              isAutoplay={localSettings.autoplay}
              showControls={localSettings.controls}
              handlePlaybackChange={handlePlaybackChange}
            />
          )}

          <button className="clear-button" onClick={handleClearBackground}>
            Clear Background
          </button>
        </div>
      </CollapsibleSection>

      {/* Display Settings Section */}
      <CollapsibleSection title="Display Settings">
        <div className="settings-wrapper">
          {/* Display Type Selector */}
          <div className="settings-group">
            <label htmlFor="display">Display</label>
            <select
              id="display"
              name="display"
              value={localSettings.display}
              onChange={handleInputChange}
              className="settings-input"
            >
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="inline-block">Inline-block</option>
              <option value="grid">Grid</option>
              {/* Additional display options can be added here */}
            </select>
          </div>

          {/* Gap: Applicable for flex and grid layouts */}
          {(localSettings.display === 'flex' || localSettings.display === 'grid') && (
            <div className="settings-group">
              <label htmlFor="gap">Gap (px)</label>
              <input
                type="number"
                id="gap"
                name="gap"
                value={localSettings.gap}
                onChange={handleInputChange}
                className="settings-input"
                placeholder="e.g., 10"
              />
            </div>
          )}

          {/* Flex Direction: Only for flex layouts */}
          {localSettings.display === 'flex' && (
            <div className="settings-group">
              <label htmlFor="flexDirection">Flex Direction</label>
              <select
                id="flexDirection"
                name="flexDirection"
                value={localSettings.flexDirection}
                onChange={handleInputChange}
                className="settings-input"
              >
                <option value="row">Row</option>
                <option value="column">Column</option>
              </select>
            </div>
          )}

          {/* Justify Content: For flex and grid layouts */}
          {(localSettings.display === 'flex' || localSettings.display === 'grid') && (
            <div className="settings-group">
              <label htmlFor="justifyContent">Justify Content</label>
              <select
                id="justifyContent"
                name="justifyContent"
                value={localSettings.justifyContent}
                onChange={handleInputChange}
                className="settings-input"
              >
                <option value="flex-start">Flex-start</option>
                <option value="center">Center</option>
                <option value="flex-end">Flex-end</option>
                <option value="space-between">Space-between</option>
                <option value="space-around">Space-around</option>
                <option value="space-evenly">Space-evenly</option>
              </select>
            </div>
          )}

          {/* Align Items: For flex and grid layouts */}
          {(localSettings.display === 'flex' || localSettings.display === 'grid') && (
            <div className="settings-group">
              <label htmlFor="alignItems">Align Items</label>
              <select
                id="alignItems"
                name="alignItems"
                value={localSettings.alignItems}
                onChange={handleInputChange}
                className="settings-input"
              >
                <option value="stretch">Stretch</option>
                <option value="flex-start">Flex-start</option>
                <option value="center">Center</option>
                <option value="flex-end">Flex-end</option>
                <option value="baseline">Baseline</option>
              </select>
            </div>
          )}

          {/* Align Content: For flex (with wrapping) and grid layouts */}
          {(localSettings.display === 'flex' || localSettings.display === 'grid') && (
            <div className="settings-group">
              <label htmlFor="alignContent">Align Content</label>
              <select
                id="alignContent"
                name="alignContent"
                value={localSettings.alignContent}
                onChange={handleInputChange}
                className="settings-input"
              >
                <option value="stretch">Stretch</option>
                <option value="flex-start">Flex-start</option>
                <option value="center">Center</option>
                <option value="flex-end">Flex-end</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
                <option value="space-evenly">Space Evenly</option>
              </select>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default BackgroundSettings;
