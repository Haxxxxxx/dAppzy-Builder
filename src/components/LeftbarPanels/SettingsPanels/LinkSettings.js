import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';

const LinkSettingsPanel = ({ onUpdateSettings, settings }) => {
  const { selectedElement, updateConfiguration } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({
    actionType: 'page', // Default action type
    targetValue: '',
    openInNewTab: false,
    ...settings,
  });

  const [isCollapsed, setIsCollapsed] = useState(false); // State for collapsibility

  // Placeholder data for dropdowns
  const pages = ['Home', 'About', 'Contact']; // Replace with dynamic values if needed
  const sections = ['#section1', '#section2', '#section3']; // Replace with dynamic values
  const popups = ['Popup1', 'Popup2', 'Popup3']; // Replace with dynamic values

  useEffect(() => {
    if (selectedElement?.settings) {
      setLocalSettings(selectedElement.settings);
    }
  }, [selectedElement]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name === 'actionType') {
      setLocalSettings((prev) => ({
        ...prev,
        [name]: value,
        targetValue: '', // Reset target value when action type changes
        openInNewTab: value === 'URL', // Automatically check for external URLs
      }));
    } else {
      setLocalSettings((prev) => ({ ...prev, [name]: newValue }));
    }

    if (selectedElement) {
      updateConfiguration(selectedElement.id, name, newValue);
    }
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    alert('Link settings saved.');
  };

  const renderTargetValueField = () => {
    switch (localSettings.actionType) {
      case 'page':
        return (
          <select
            name="targetValue"
            value={localSettings.targetValue}
            onChange={handleInputChange}
            className="settings-input"
          >
            <option value="" disabled>
              Select a page
            </option>
            {pages.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        );
      case 'pageSection':
        return (
          <select
            name="targetValue"
            value={localSettings.targetValue}
            onChange={handleInputChange}
            className="settings-input"
          >
            <option value="" disabled>
              Select a section
            </option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        );
      case 'popup':
        return (
          <select
            name="targetValue"
            value={localSettings.targetValue}
            onChange={handleInputChange}
            className="settings-input"
          >
            <option value="" disabled>
              Select a popup
            </option>
            {popups.map((popup) => (
              <option key={popup} value={popup}>
                {popup}
              </option>
            ))}
          </select>
        );
      case 'URL':
        return (
          <input
            type="text"
            name="targetValue"
            value={localSettings.targetValue}
            onChange={handleInputChange}
            placeholder="Enter external URL (e.g., https://example.com)"
            className="settings-input"
          />
        );
      default:
        return (
          <input
            type="text"
            name="targetValue"
            value={localSettings.targetValue}
            onChange={handleInputChange}
            placeholder="Enter value"
            className="settings-input"
          />
        );
    }
  };

  return (
    <div className="link-settings-panel">
      <hr />
      <div className="settings-group">
        <label htmlFor="redirectUrl">ID</label>
        <input
          type="id"
          name="redirectId"
          value={localSettings.id}
          onChange={handleInputChange}
          placeholder="ID"
          className="settings-input"
        />
      </div>
      <hr />
      {/* Clickable h3 to toggle collapsibility */}
      <h3
        onClick={() => setIsCollapsed((prev) => !prev)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        Link Settings 
        <span>{isCollapsed ? '▼' : '▶'}</span>

      </h3>

      {!isCollapsed && (
        <>
          <div className="settings-group">
            <select
              name="actionType"
              value={localSettings.actionType}
              onChange={handleInputChange}
              className="settings-input"
            >
              <option value="page">Page</option>
              <option value="pageSection">Page Section</option>
              <option value="file">File</option>
              <option value="popup">Popup</option>
              <option value="function">Function</option>
              <option value="URL">URL</option>
            </select>
          </div>

          {/* Dynamic Target Value Field */}
          <div className="settings-group">
            <label htmlFor="targetValue">
              {localSettings.actionType === 'URL'
                ? 'URL'
                : localSettings.actionType === 'page'
                ? 'Page'
                : localSettings.actionType === 'pageSection'
                ? 'Section'
                : localSettings.actionType === 'popup'
                ? 'Popup'
                : 'Value'}
            </label>
            {renderTargetValueField()}
          </div>

          {/* Checkbox for Open in New Tab */}
          <div className="settings-group">
            <label
              htmlFor="openInNewTab"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <input
                type="checkbox"
                name="openInNewTab"
                checked={localSettings.openInNewTab}
                onChange={handleInputChange}
              />
              Open in new tab
            </label>
          </div>

          <button onClick={handleSave} className="save-button">
            Save Link Settings
          </button>
        </>
      )}
    </div>
  );
};

export default LinkSettingsPanel;
