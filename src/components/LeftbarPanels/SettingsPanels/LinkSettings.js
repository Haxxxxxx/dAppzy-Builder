import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import '../../css/SettingsPanel.css'; // Common styles
import './css/LinkSettings.css'; // Specific styles for LinkSettingsPanel
import ActionTypeSelector from './LinkSettings/ActionTypeSelector';
import TargetValueField from './LinkSettings/TargetValueField';
import OpenInNewTabCheckbox from './LinkSettings/OpenInNewTabCheckbox';
import CollapsibleSection from './LinkSettings/CollapsibleSection';
import ButtonSettings from './LinkSettings/ButtonSettings'; // Import ButtonSettings

const LinkSettings = ({ onUpdateSettings, settings }) => {
  const { selectedElement, updateConfiguration } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({
    actionType: 'page',
    targetValue: '',
    openInNewTab: false,
    ...settings,
  });

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
        targetValue: '',
        openInNewTab: value === 'URL',
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

  const additionalOptions = selectedElement?.type === 'button' ? ['Dropdown'] : [];

  return (
    <div className="settings-panel link-settings-panel">
      <hr />
      <div className="settings-group settings-header">
        <label htmlFor="redirectId">ID</label>
        <input
          type="text"
          name="redirectId"
          value={localSettings.id || ''}
          onChange={handleInputChange}
          placeholder="ID"
          className="settings-input"
        />
      </div>
      <hr />
      <CollapsibleSection title="Link Settings">
        <div className="link-settings-wrapper-target">
          <ActionTypeSelector
            actionType={localSettings.actionType}
            onChange={handleInputChange}
            additionalOptions={additionalOptions} // Pass the additional options
          />
          <TargetValueField
            actionType={localSettings.actionType}
            targetValue={localSettings.targetValue}
            onChange={handleInputChange}
          />
          <OpenInNewTabCheckbox
            openInNewTab={localSettings.openInNewTab}
            onChange={handleInputChange}
          />
        </div>
      </CollapsibleSection>

      {/* Render ButtonSettings if actionType is Dropdown */}
      {localSettings.actionType === 'Dropdown' && (
        <CollapsibleSection title="Dropdown Settings">
          <ButtonSettings />
        </CollapsibleSection>
      )}
    </div>
  );
};

export default LinkSettings;
