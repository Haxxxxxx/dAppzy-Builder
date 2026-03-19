import React, { useState, useEffect, useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import FormAdvancedSettings from './FormSettings/FormAdvancedSettings';
import FormFieldsManager from './FormSettings/FormFieldsManager';
import CollapsibleSection from './LinkSettings/CollapsibleSection';
import '../../css/SettingsPanel.css';

// Element types that support the "required" attribute
const REQUIRED_CAPABLE_TYPES = new Set(['input', 'textarea', 'select']);

const FormSettings = () => {
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
        return updated;
      });
    } else {
      const { name, value } = eOrUpdater.target;
      setLocalSettings((prev) => ({ ...prev, [name]: value }));
      updateConfiguration(selectedElement.id, name, value);
    }
  };

  // For input/textarea/select — show field-level settings (required, name, placeholder)
  if (selectedElement && REQUIRED_CAPABLE_TYPES.has(selectedElement.type)) {
    const settings = selectedElement.settings || selectedElement.configuration || {};
    const isRequired = !!settings.required;

    const handleRequiredToggle = (e) => {
      updateConfiguration(selectedElement.id, 'required', e.target.checked);
    };

    const handleNameChange = (e) => {
      updateConfiguration(selectedElement.id, 'name', e.target.value);
    };

    const handlePlaceholderChange = (e) => {
      updateConfiguration(selectedElement.id, 'placeholder', e.target.value);
    };

    return (
      <div className="settings-panel form-settings-panel">
        <CollapsibleSection title="Field Settings" defaultExpanded={true}>
          <div className="settings-group">
            <label>Field Name</label>
            <input
              type="text"
              value={settings.name || ''}
              onChange={handleNameChange}
              placeholder="e.g. email, name, message"
              className="settings-input"
            />
          </div>
          {selectedElement.type !== 'select' && (
            <div className="settings-group">
              <label>Placeholder</label>
              <input
                type="text"
                value={settings.placeholder || ''}
                onChange={handlePlaceholderChange}
                placeholder="Placeholder text..."
                className="settings-input"
              />
            </div>
          )}
          <div className="settings-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="required-toggle"
              checked={isRequired}
              onChange={handleRequiredToggle}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="required-toggle" style={{ cursor: 'pointer', margin: 0 }}>
              Required
            </label>
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  // For form elements — show form-level settings
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
