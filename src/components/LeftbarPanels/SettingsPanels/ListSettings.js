// src/components/ListsSettings.js

import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import ListGeneralSettings from './ListSettings/ListGeneralSettings';
import ListAdvancedSettings from './ListSettings/ListAdvancedSettings';
import ListItemsManager from './ListSettings/ListItemsManager';
import '../../css/SettingsPanel.css';
import './css/ListSettings.css';

const ListSettings = () => {
  const { selectedElement, elements, updateConfiguration } = useContext(EditableContext);

  const [localSettings, setLocalSettings] = useState({
    id: '',
    listType: 'ul',
    start: 1,
    listStyleType: 'decimal',
    reversed: false,
    items: [],
  });

  // Synchronized updates from parent -> local state
  useEffect(() => {
    if (selectedElement && selectedElement.type === 'list') {
      const listElement = elements.find((el) => el.id === selectedElement.id);
      setLocalSettings({
        id: listElement?.id || '',
        listType: listElement?.configuration?.listType || 'ul',
        start: listElement?.configuration?.start || 1,
        listStyleType: listElement?.configuration?.listStyleType || 'decimal',
        reversed: listElement?.configuration?.reversed || false,
        items: listElement?.children || [],
      });
    }
  }, [selectedElement, elements]);

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    const finalValue = inputType === 'checkbox' ? checked : value;

    setLocalSettings((prev) => {
      // We'll build new local settings in a mutable way
      const newLocal = { ...prev, [name]: finalValue };

      // If user is changing from 'ol' -> 'ul' or 'ul' -> 'ol', also adapt listStyleType
      if (name === 'listType') {
        const wasOrdered = prev.listType === 'ol';
        const willBeOrdered = finalValue === 'ol';

        // If the user currently has a style that's only valid for ordered lists,
        // or is "decimal", etc., we can swap it to "disc" by default for unordered.
        // Conversely, if switching to ordered, pick "decimal".
        if (!wasOrdered && willBeOrdered) {
          // ul -> ol
          // If user had 'disc', 'circle', or 'none', we might pick 'decimal' as default
          if (prev.listStyleType === 'disc' || prev.listStyleType === 'square') {
            newLocal.listStyleType = 'decimal';
          }
        } else if (wasOrdered && !willBeOrdered) {
          // ol -> ul
          // If user had 'decimal', 'upper-roman', etc., we might pick 'disc'
          if (
            prev.listStyleType === 'decimal' ||
            prev.listStyleType.includes('alpha') ||
            prev.listStyleType.includes('roman')
          ) {
            newLocal.listStyleType = 'disc';
          }
        }
      }
      return newLocal;
    });

    // Update the configuration on the actual element
    updateConfiguration(localSettings.id, name, finalValue);

    // If we changed from ol <-> ul, also immediately update 'listStyleType'
    if (name === 'listType') {
      // Because setLocalSettings is async, we don't have the *latest* newLocal here,
      // so read from the finalValue and do a second update if needed:
      if (finalValue === 'ol' && localSettings.listStyleType === 'disc') {
        updateConfiguration(localSettings.id, 'listStyleType', 'decimal');
      } else if (finalValue === 'ul' && localSettings.listStyleType === 'decimal') {
        updateConfiguration(localSettings.id, 'listStyleType', 'disc');
      }
    }
  };

  return (
    <div className="settings-panel list-settings-panel">
      <ListGeneralSettings
        localSettings={localSettings}
        handleInputChange={handleInputChange}
      />
      {localSettings.listType === 'ol' && (
        <ListAdvancedSettings
          localSettings={localSettings}
          handleInputChange={handleInputChange}
        />
      )}
      <ListItemsManager
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
      />
    </div>
  );
};

export default ListSettings;
