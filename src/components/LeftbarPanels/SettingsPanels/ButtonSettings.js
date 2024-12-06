import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';

const ButtonSettingsPanel = () => {
  const { updateContent, selectedElement, elements } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({});

  useEffect(() => {
    if (selectedElement) {
      const buttonSettings = elements.find((el) => el.id === selectedElement.id)?.settings || {};
      setLocalSettings(buttonSettings);
    }
  }, [selectedElement, elements]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));

    if (selectedElement) {
      updateContent(selectedElement.id, { ...localSettings, [name]: value });
    }
  };

  const handleCustomLogicChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      customLogic: { ...prev.customLogic, [name]: value },
    }));

    if (selectedElement) {
      updateContent(selectedElement.id, {
        ...localSettings,
        customLogic: { ...localSettings.customLogic, [name]: value },
      });
    }
  };

  return (
    <div className="button-settings-panel">
      <h3>Button Settings</h3>
      {/* Button Text */}
      <div className="settings-group">
        <label htmlFor="text">Button Text:</label>
        <input
          type="text"
          name="text"
          value={localSettings.text || ''}
          onChange={handleInputChange}
          placeholder="Enter button text"
          className="settings-input"
        />
      </div>
      {/* Background Color */}
      <div className="settings-group">
        <label htmlFor="backgroundColor">Background Color:</label>
        <input
          type="color"
          name="backgroundColor"
          value={localSettings.backgroundColor || '#ffffff'}
          onChange={handleInputChange}
          className="settings-input"
        />
      </div>
      {/* Text Color */}
      <div className="settings-group">
        <label htmlFor="textColor">Text Color:</label>
        <input
          type="color"
          name="textColor"
          value={localSettings.textColor || '#000000'}
          onChange={handleInputChange}
          className="settings-input"
        />
      </div>
      {/* Border Style */}
      <div className="settings-group">
        <label htmlFor="borderStyle">Border Style:</label>
        <select
          name="borderStyle"
          value={localSettings.borderStyle || 'solid'}
          onChange={handleInputChange}
          className="settings-input"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="none">None</option>
        </select>
      </div>
      {/* Button Action */}
      <div className="settings-group">
        <label htmlFor="action">Button Action:</label>
        <select
          name="action"
          value={localSettings.action || 'none'}
          onChange={handleInputChange}
          className="settings-input"
        >
          <option value="none">None</option>
          <option value="navigate">Navigate to URL</option>
          <option value="showModal">Show Modal</option>
          <option value="executeFunction">Execute Function</option>
        </select>
      </div>
      {/* Additional Settings for Navigate Action */}
      {localSettings.action === 'navigate' && (
        <div className="settings-group">
          <label htmlFor="url">Redirect URL:</label>
          <input
            type="url"
            name="url"
            value={localSettings.url || ''}
            onChange={handleCustomLogicChange}
            placeholder="Enter URL"
            className="settings-input"
          />
        </div>
      )}
      {/* Additional Settings for Execute Function Action */}
      {localSettings.action === 'executeFunction' && (
        <div className="settings-group">
          <label htmlFor="functionName">Function Name:</label>
          <input
            type="text"
            name="functionName"
            value={localSettings.customLogic?.functionName || ''}
            onChange={handleCustomLogicChange}
            placeholder="Enter function name"
            className="settings-input"
          />
          <label htmlFor="functionArguments">Arguments (comma-separated):</label>
          <input
            type="text"
            name="functionArguments"
            value={localSettings.customLogic?.functionArguments || ''}
            onChange={handleCustomLogicChange}
            placeholder="Enter arguments"
            className="settings-input"
          />
        </div>
      )}
    </div>
  );
};

export default ButtonSettingsPanel;
