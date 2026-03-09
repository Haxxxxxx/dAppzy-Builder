import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { EditableContext } from '../../../../context/EditableContext';

const FormAdvancedSettings = ({ localSettings, handleInputChange, setElements }) => {
  const { addNewElement, updateConfiguration } = useContext(EditableContext);
  const [selectedStructure, setSelectedStructure] = useState('');
  const appliedStructureRef = useRef(null);

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
      <h3>Form Structure Settings</h3>
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
    </div>
  );
};

export default FormAdvancedSettings;
