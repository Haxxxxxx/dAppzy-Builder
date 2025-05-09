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
    type: '', // Element type (e.g., 'paragraph', 'code', etc.)
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

  const renderLineNumbers = (content) => {
    const lines = content.split('\n');
    return (
      <div className="line-numbers">
        {lines.map((_, index) => (
          <div key={index} className="line-number">
            {index + 1}
          </div>
        ))}
      </div>
    );
  };

  const getPlaceholderText = (type) => {
    switch (type) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return `Enter ${type.toUpperCase()} text...`;
      case 'p':
      case 'paragraph':
        return 'Enter paragraph text...';
      case 'span':
        return 'Enter inline text...';
      case 'blockquote':
        return 'Enter blockquote text...';
      case 'code':
        return 'Enter code...';
      case 'pre':
        return 'Enter preformatted text...';
      case 'caption':
        return 'Enter caption text...';
      default:
        return `Enter ${type} content...`;
    }
  };

  const getTextareaRows = (type) => {
    switch (type) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'span':
        return 1;
      case 'p':
      case 'paragraph':
      case 'blockquote':
        return 3;
      case 'code':
      case 'pre':
        return 5;
      default:
        return 3;
    }
  };

  return (
    <div className="settings-panel textual-settings-panel">
      <CollapsibleSection title="Element ID" defaultExpanded={true}>
        <div className="settings-group">
          <input
            type="text"
            name="id"
            value={localSettings.id}
            onChange={handleInputChange}
            placeholder="Enter element ID"
            className="settings-input"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Content" defaultExpanded={true}>
        <div className="settings-group">
          <textarea
            name="content"
            value={localSettings.content}
            onChange={handleInputChange}
            placeholder={getPlaceholderText(localSettings.type)}
            rows={getTextareaRows(localSettings.type)}
            className="settings-textarea"
          />
        </div>
      </CollapsibleSection>

      {localSettings.type && localSettings.type.startsWith('h') && (
        <CollapsibleSection title="Heading Level" defaultExpanded={true}>
          <div className="settings-group">
            <select
              name="type"
              value={localSettings.type}
              onChange={handleInputChange}
              className="settings-select"
            >
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default TextualSettings;
