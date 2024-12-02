import React, { useContext, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import './TableFormatModal.css';

const FormStructureModal = ({ isOpen, onClose, onSubmit, editingFormId }) => {
  const { addNewElement } = useContext(EditableContext);
  const [selectedStructure, setSelectedStructure] = useState('');
  const [customFields, setCustomFields] = useState([]);

  const formStructures = [
    { id: 'basic', label: 'Basic Form', fields: ['text', 'email'] },
    { id: 'registration', label: 'Registration Form', fields: ['text', 'email', 'password'] },
    { id: 'contact', label: 'Contact Form', fields: ['text', 'email', 'textarea'] },
  ];

  const addCustomField = () => {
    setCustomFields([...customFields, { id: `field-${Date.now()}`, label: '', type: 'text' }]);
  };

  const updateCustomField = (index, key, value) => {
    const updatedFields = [...customFields];
    updatedFields[index][key] = value;
    setCustomFields(updatedFields);
  };

  const handleSubmit = () => {
    if (!selectedStructure && customFields.length === 0) {
      console.error('Please select a structure or add custom fields.');
      return;
    }

    const structureFields = formStructures.find((s) => s.id === selectedStructure)?.fields || [];
    const allFields = [...structureFields, ...customFields.map((field) => field.type)];

    if (!editingFormId) {
      const formId = addNewElement('form');
      allFields.forEach((fieldType) => {
        addNewElement('input', 1, null, formId);
      });
      onSubmit?.(formId, allFields);
    } else {
      allFields.forEach((fieldType) => {
        addNewElement('input', 1, null, editingFormId);
      });
      onSubmit?.(editingFormId, allFields);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-content">
      <h3>Choose Form Structure</h3>
      <div className="modal-controls">
        {formStructures.map((structure) => (
          <label key={structure.id}>
            <input
              type="radio"
              name="form-structure"
              value={structure.id}
              onChange={(e) => setSelectedStructure(e.target.value)}
            />
            {structure.label}
          </label>
        ))}
      </div>
      <h4>Add Custom Fields</h4>
      <button onClick={addCustomField}>Add Field</button>
      <ul>
        {customFields.map((field, index) => (
          <li key={field.id}>
            <input
              type="text"
              placeholder="Field Label"
              value={field.label}
              onChange={(e) => updateCustomField(index, 'label', e.target.value)}
            />
            <select
              value={field.type}
              onChange={(e) => updateCustomField(index, 'type', e.target.value)}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="password">Password</option>
              <option value="textarea">Textarea</option>
            </select>
          </li>
        ))}
      </ul>
      <div className="modal-actions">
        <button onClick={handleSubmit}>Apply</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FormStructureModal;
