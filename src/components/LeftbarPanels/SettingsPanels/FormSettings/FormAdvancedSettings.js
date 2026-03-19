import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { EditableContext } from '../../../../context/EditableContext';
import CollapsibleSection from '../LinkSettings/CollapsibleSection';

const FormAdvancedSettings = ({ localSettings, handleInputChange, setElements }) => {
  const { selectedElement, addNewElement, updateConfiguration } = useContext(EditableContext);
  const [selectedStructure, setSelectedStructure] = useState('');
  const appliedStructureRef = useRef(null);

  // Local state for form action / method
  const [formAction, setFormAction] = useState('');
  const [formMethod, setFormMethod] = useState('POST');

  // Sync when selected element changes
  useEffect(() => {
    if (selectedElement) {
      const settings = selectedElement.settings || selectedElement.configuration || {};
      setFormAction(settings.action || '');
      setFormMethod(settings.method || 'POST');
    }
  }, [selectedElement]);

  const handleActionChange = (e) => {
    const value = e.target.value;
    setFormAction(value);
    if (selectedElement) {
      updateConfiguration(selectedElement.id, 'action', value);
    }
  };

  const handleMethodChange = (e) => {
    const value = e.target.value;
    setFormMethod(value);
    if (selectedElement) {
      updateConfiguration(selectedElement.id, 'method', value);
    }
  };

  // Predefined form structures (stabilized with useMemo)
  const formStructures = useMemo(() => [
    {
      id: 'basic',
      label: 'Basic Form',
      fields: [
        { type: 'text', label: 'Text:' },
        { type: 'email', label: 'Email:' }
      ]
    },
    {
      id: 'registration',
      label: 'Registration Form',
      fields: [
        { type: 'text', label: 'Name:' },
        { type: 'email', label: 'Email:' },
        { type: 'password', label: 'Password:' }
      ]
    },
    {
      id: 'contact',
      label: 'Contact Form',
      fields: [
        { type: 'text', label: 'Name:' },
        { type: 'email', label: 'Email:' },
        { type: 'textarea', label: 'Message:' }
      ]
    },
  ], []);

  // When a new structure is selected, destroy old children and create new ones.
  useEffect(() => {
    if (!selectedStructure) return;
    // Only run if the new structure is different.
    if (appliedStructureRef.current === selectedStructure) return;
    appliedStructureRef.current = selectedStructure;

    const structure = formStructures.find(s => s.id === selectedStructure);
    if (!structure) return;

    // Remove all existing children that belong to this form.
    setElements(prevElements => {
      // Filter out any element whose parentId equals the current form id.
      const filtered = prevElements.filter(el => el.parentId !== localSettings.id);
      // Also update the form element to clear its children.
      return filtered.map(el =>
        el.id === localSettings.id ? { ...el, children: [] } : el
      );
    });

    // Create new children for each field defined in the structure.
    const newChildren = structure.fields.map(field =>
      addNewElement('input', 1, 0, localSettings.id, { fieldType: field.type, label: field.label })
    );

    // Then update the form element's children with the new ones.
    setElements(prevElements =>
      prevElements.map(el =>
        el.id === localSettings.id ? { ...el, children: newChildren } : el
      )
    );

    // Update local settings to reflect the new structure.
    handleInputChange(prev => ({ ...prev, fields: structure.fields }));
  }, [selectedStructure, localSettings.id, addNewElement, setElements, handleInputChange, formStructures, updateConfiguration]);

  return (
    <div className="form-advanced-settings">
      <CollapsibleSection title="Form Action" defaultExpanded={true}>
        <div className="settings-group">
          <label>Submission URL</label>
          <input
            type="text"
            value={formAction}
            onChange={handleActionChange}
            placeholder="https://formspree.io/f/YOUR_ID"
            className="settings-input"
          />
        </div>
        <div className="settings-group">
          <label>Method</label>
          <select
            value={formMethod}
            onChange={handleMethodChange}
            className="settings-input"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        <div style={{
          padding: '8px 10px',
          backgroundColor: 'rgba(92, 78, 250, 0.08)',
          border: '1px solid rgba(92, 78, 250, 0.2)',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#888',
          lineHeight: 1.5,
          marginTop: '4px',
        }}>
          Leave empty for client-side only. Use https://formspree.io/f/YOUR_ID for email submissions.
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Form Structure" defaultExpanded={false}>
        <div className="settings-group">
          <span>Select a predefined structure:</span>
          {formStructures.map(structure => (
            <label key={structure.id} style={{ marginRight: '15px' }}>
              <input
                type="radio"
                name="form-structure"
                value={structure.id}
                onChange={(e) => setSelectedStructure(e.target.value)}
                checked={selectedStructure === structure.id}
              />
              {structure.label}
            </label>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default FormAdvancedSettings;
