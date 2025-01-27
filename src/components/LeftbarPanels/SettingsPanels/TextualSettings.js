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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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

  return (
    <div className={`settings-panel textual-settings-panel ${isExpanded ? 'expanded' : ''}`}>
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
          {localSettings.type === 'code' ? (
            <div className="code-editor-wrapper">
              <button className="expand-button" onClick={toggleExpand}>
                {isExpanded ? (
                  <>
                    <span className="material-symbols-outlined">collapse_content</span>
                    Minimize
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">expand_content</span>
                    Expand
                  </>
                )}
              </button>
              <div className="code-editor">
                {renderLineNumbers(localSettings.content)}
                <textarea
                  name="content"
                  value={localSettings.content}
                  onChange={handleInputChange}
                  placeholder="Enter your code here..."
                  className="settings-input code-input"
                  rows="10"
                />
              </div>
            </div>
          ) : (
            <textarea
              name="content"
              value={localSettings.content}
              onChange={handleInputChange}
              placeholder={`Enter ${localSettings.type} content`}
              className="settings-input"
              rows="3"
            />
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default TextualSettings;
