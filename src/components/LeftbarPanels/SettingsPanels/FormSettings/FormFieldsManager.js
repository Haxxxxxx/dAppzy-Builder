import React, { useContext } from 'react';
import { EditableContext } from '../../../../context/EditableContext';

const FormFieldsManager = ({ localSettings, setLocalSettings }) => {
  const { updateConfiguration, elements } = useContext(EditableContext);

  // Remove a field from the list.
  const handleRemoveField = (indexToRemove) => {
    const updatedFields = localSettings.fields.filter((_, index) => index !== indexToRemove);
    setLocalSettings((prev) => ({ ...prev, fields: updatedFields }));
    // Optionally, remove the corresponding child element from the context here.
  };

  // Update the label for a given field and propagate the change.
  const handleLabelChange = (index, newLabel) => {
    // Update local settings.
    const updatedFields = localSettings.fields.map((field, idx) =>
      idx === index ? { ...field, label: newLabel } : field
    );
    setLocalSettings((prev) => ({ ...prev, fields: updatedFields }));

    // Update the corresponding child element's configuration in context.
    // Assume that the order of localSettings.fields corresponds to the order of formElement.children.
    const formElement = elements.find((el) => el.id === localSettings.id);
    if (formElement && Array.isArray(formElement.children) && formElement.children[index]) {
      const childId = formElement.children[index];
      // Call updateConfiguration for the child element.
      updateConfiguration(childId, 'label', newLabel);
    }
  };

  return (
    <div className="form-fields-manager">
      <h3>Fields Manager</h3>
      {localSettings.fields && localSettings.fields.length === 0 ? (
        <p className="empty-placeholder">No fields added yet.</p>
      ) : (
        <div>
          {localSettings.fields.map((field, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <div>
                <span>
                  <strong>Type:</strong> {field.fieldType || field.type}
                </span>
              </div>
              <div>
                <label>
                  <strong>Label:</strong>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    style={{ marginLeft: '5px' }}
                  />
                </label>
              </div>
              <button onClick={() => handleRemoveField(index)} style={{ marginTop: '5px' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormFieldsManager;
