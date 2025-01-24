import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import '../../css/SettingsPanel.css'; // Common styles
import './css/HeadingSettings.css'; // Specific styles for textual settings
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const TextualSettings = () => {
  const { selectedElement, updateContent, updateConfiguration } = useContext(EditableContext);

  const [localSettings, setLocalSettings] = useState({
    id: '',
    content: '',
    type: '', // Element type (e.g., 'paragraph', 'heading', etc.)
  });

  useEffect(() => {
    if (selectedElement) {
      setLocalSettings({
        id: selectedElement.id || '',
        content: selectedElement.content || '',
        type: selectedElement.type || '', // Dynamically capture the type
      });
    }
  }, [selectedElement]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const newSettings = {
      ...localSettings,
      [name]: value,
    };

    setLocalSettings(newSettings);

    if (name === 'content') {
      updateContent(selectedElement.id, value);
    } else {
      updateConfiguration(selectedElement.id, name, value);
    }
  };

  return (
    <div className="settings-panel textual-settings-panel">
      <hr />
      <div className="settings-group settings-header">
        <label htmlFor="id">ID</label>
        <input
          type="text"
          name="id"
          value={localSettings.id}
          onChange={handleInputChange}
          placeholder="Enter element ID"
          className="settings-input"
        />
      </div>
      <hr />
      <CollapsibleSection title={`${localSettings.type} Settings`}>
        <div className="settings-wrapper">
          {localSettings.type === 'title' && (
            <div className="settings-group">
              <label htmlFor="level">Size</label>
              <select
                name="level"
                value={localSettings.level || 1} // Default to `h1` for headings
                onChange={handleInputChange}
                className="settings-input"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
          )}
          <div className="settings-group content">
            <label htmlFor="content">Content</label>
            <textarea
              name="content"
              value={localSettings.content}
              onChange={handleInputChange}
              placeholder={`Enter ${localSettings.type} content`}
              className="settings-input"
              rows="3"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default TextualSettings;
