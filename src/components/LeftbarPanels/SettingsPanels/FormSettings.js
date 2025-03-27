import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import FormAdvancedSettings from './FormSettings/FormAdvancedSettings';
import FormFieldsManager from './FormSettings/FormFieldsManager';
import '../../css/SettingsPanel.css';
import './css/FormSettings.css';

const FormSettings = ({ onUpdateSettings }) => {
  const { selectedElement, elements, updateConfiguration, setElements } = useContext(EditableContext);

  const [localSettings, setLocalSettings] = useState({
    id: '',
    backgroundColor: '',
    padding: '10px',
    fields: [],
  });

  useEffect(() => {
    if (selectedElement && selectedElement.type === 'form') {
      const formElement = elements.find((el) => el.id === selectedElement.id);
      // Fetch field configurations from children:
      const fieldsInfo =
        formElement && Array.isArray(formElement.children)
          ? formElement.children
              .map((childId) => {
                const child = elements.find((el) => el.id === childId);
                return child && child.configuration ? child.configuration : null;
              })
              .filter(Boolean)
          : [];
      setLocalSettings({
        id: formElement?.id || '',
        backgroundColor: formElement?.configuration?.backgroundColor || '',
        padding: formElement?.configuration?.padding || '10px',
        fields: fieldsInfo,
      });
    }
  }, [selectedElement, elements]);

  const handleInputChange = (eOrUpdater) => {
    if (typeof eOrUpdater === 'function') {
      setLocalSettings((prev) => {
        const updated = eOrUpdater(prev);
        // Optionally update configuration (e.g., updateConfiguration(updated.id, 'fields', updated.fields));
        return updated;
      });
    } else {
      const { name, value } = eOrUpdater.target;
      setLocalSettings((prev) => ({ ...prev, [name]: value }));
      updateConfiguration(localSettings.id, name, value);
    }
  };

  return (
    <div className="settings-panel form-settings-panel">
      <FormAdvancedSettings
        localSettings={localSettings}
        handleInputChange={handleInputChange}
        setElements={setElements}
      />
      <FormFieldsManager
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
      />
    </div>
  );
};

export default FormSettings;
