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

  // Live update the label for a given field.
  const handleLiveLabelChange = (index, newLabel) => {
    handleInputChange(prev => {
      const updatedFields = prev.fields.map((field, idx) =>
        idx === index ? { ...field, label: newLabel } : field
      );
      return { ...prev, fields: updatedFields };
    });
    // Update the corresponding child element's configuration.
    setElements(prevElements =>
      prevElements.map(el => {
        if (el.id === localSettings.id && Array.isArray(el.children) && el.children[index]) {
          updateConfiguration(el.children[index], 'label', newLabel);
        }
        return el;
      })
    );
  };

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
      {/* {selectedStructure && localSettings.fields && (
        <div className="settings-group">
          <h4>Edit Field Labels</h4>
          {localSettings.fields.map((field, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <label>
                {field.type} Label:
                <input 
                  type="text"
                  value={field.label}
                  onChange={(e) => handleLiveLabelChange(index, e.target.value)}
                  style={{ marginLeft: '5px' }}
                />
              </label>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default FormAdvancedSettings;
