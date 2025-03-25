import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import '../../css/SettingsPanel.css';
import './css/LinkSettings.css';
import ActionTypeSelector from './LinkSettings/ActionTypeSelector';
import TargetValueField from './LinkSettings/TargetValueField';
import OpenInNewTabCheckbox from './LinkSettings/OpenInNewTabCheckbox';
import CollapsibleSection from './LinkSettings/CollapsibleSection';
import DropdownSettings from './LinkSettings/DropdownSettings'; // Import the controlled DropdownSettings

const LinkSettings = ({ onUpdateSettings, settings }) => {
  const { selectedElement, updateConfiguration } = useContext(EditableContext);

  // Default settings for the link/button element
  const defaultSettings = {
    id: '',
    actionType: 'URL',
    targetValue: '',
    openInNewTab: false,
    dropdownLinks: [] // we'll store dropdown links here
  };

  // Local settings state (merged with any previously saved settings)
  const [localSettings, setLocalSettings] = useState({
    ...defaultSettings,
    ...settings,
  });
  
  // Lift the dropdown links state to LinkSettings:
  const [dropdownLinks, setDropdownLinks] = useState(localSettings.dropdownLinks || []);

  // When a new element is selected, update local settings and dropdownLinks.
  useEffect(() => {
    if (selectedElement) {
      const savedSettings =
        selectedElement.settings || selectedElement.configuration || {};
      setLocalSettings({
        ...defaultSettings,
        id: selectedElement.id,
        ...savedSettings,
      });
      if (savedSettings.dropdownLinks) {
        setDropdownLinks(savedSettings.dropdownLinks);
      } else {
        setDropdownLinks([]);
      }
    }
  }, [selectedElement]);

  // General input change handler
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

  // When dropdown links change, update local state and configuration.
  const handleDropdownLinksChange = (links) => {
    setDropdownLinks(links);
    setLocalSettings((prev) => ({ ...prev, dropdownLinks: links }));
    if (selectedElement) {
      updateConfiguration(selectedElement.id, 'dropdownLinks', links);
    }
  };

  const handleSave = () => {
    // Merge the dropdownLinks into localSettings
    const updatedSettings = { ...localSettings, dropdownLinks };
    onUpdateSettings(updatedSettings);
    alert('Link settings saved.');
  };

  // For buttons, we want to offer "Dropdown" as an additional option.
  const additionalOptions = selectedElement?.type === 'button' ? ['Dropdown'] : [];

  // (Optional) Compute a sample onClick attribute for preview purposes.
  const computedOnClick = localSettings.targetValue
    ? localSettings.openInNewTab
      ? `window.open('${localSettings.targetValue}', '_blank')`
      : `window.location.href='${localSettings.targetValue}'`
    : '';

  return (
    <div className="settings-panel link-settings-panel">
      <hr />
      {/* Display the element's ID */}
      <div className="settings-group settings-header">
        <label htmlFor="redirectId">ID</label>
        <input
          type="text"
          name="redirectId"
          value={localSettings.id}
          readOnly
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
            additionalOptions={additionalOptions}
          />
          <TargetValueField
            actionType={localSettings.actionType}
            targetValue={localSettings.targetValue}
            onChange={handleInputChange}
          />
          {localSettings.actionType === 'URL' && (
            <OpenInNewTabCheckbox
              openInNewTab={localSettings.openInNewTab}
              onChange={handleInputChange}
            />
          )}
        </div>
      </CollapsibleSection>
      {/* Render DropdownSettings only if the actionType is Dropdown */}
      {localSettings.actionType === 'Dropdown' && (
        <CollapsibleSection title="Dropdown Settings">
          <DropdownSettings
            links={dropdownLinks}
            onChangeLinks={handleDropdownLinksChange}
          />
        </CollapsibleSection>
      )}
    </div>
  );
};

export default LinkSettings;
