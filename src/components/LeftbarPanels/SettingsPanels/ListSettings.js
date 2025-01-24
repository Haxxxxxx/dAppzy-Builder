import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import ListGeneralSettings from './ListSettings/ListGeneralSettings';
import ListAdvancedSettings from './ListSettings/ListAdvancedSettings';
import ListItemsManager from './ListSettings/ListItemsManager';
import '../../css/SettingsPanel.css';
import './css/ListSettings.css';

const ListSettings = () => {
  const { selectedElement, elements, updateConfiguration, setElements } = useContext(EditableContext);

  const [localSettings, setLocalSettings] = useState({
    id: '',
    type: 'ul',
    start: 1,
    listStyleType: 'decimal',
    reversed: false,
    items: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setLocalSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    if (name === 'type') {
      updateConfiguration(localSettings.id, 'type', value);
  
      // Update the `type` in the elements array
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === localSettings.id ? { ...el, type: value } : el
        )
      );
    } else if (name === 'id') {
      updateConfiguration(localSettings.id, 'id', value);
    }
  };
  
  
  useEffect(() => {
    if (selectedElement) {
      const listElement =
        selectedElement.type === 'list-item'
          ? elements.find((el) => el.id === selectedElement.parentId)
          : elements.find((el) => el.id === selectedElement.id);

      setLocalSettings({
        id: listElement?.id || '',
        type: listElement?.type || 'ul',
        start: listElement?.configuration?.start || 1,
        listStyleType: listElement?.configuration?.listStyleType || 'decimal',
        reversed: listElement?.configuration?.reversed || false,
        items: listElement?.children || [],
      });
    }
  }, [selectedElement, elements]);

  return (
    <div className="settings-panel list-settings-panel">
      <ListGeneralSettings
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
      />
      {localSettings.type === 'ol' && (
        <ListAdvancedSettings
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
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
