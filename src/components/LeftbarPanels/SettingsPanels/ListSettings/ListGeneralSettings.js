import React from 'react';

const ListGeneralSettings = ({ localSettings, handleInputChange }) => {
  // For toggling "Show Dots/Numbers":
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;

    // If checked, pick either 'decimal' (for OL) or 'disc' (for UL).
    // If unchecked, set list style to 'none'.
    const nextStyleType = checked
      ? localSettings.listType === 'ol'
        ? 'decimal'
        : 'disc'
      : 'none';

    // Because our parent is expecting standard input events,
    // create a synthetic event for `handleInputChange`
    const syntheticEvent = {
      target: {
        name: 'listStyleType',
        value: nextStyleType,
        // We can mimic a <select> or <input type="text" />
        type: 'text',
      },
    };
    handleInputChange(syntheticEvent);
  };

  return (
    <>
      <div className="settings-group">
        <label htmlFor="id">ID</label>
        <input
          type="text"
          name="id"
          value={localSettings.id}
          onChange={handleInputChange}
          placeholder="Enter list ID"
          className="settings-input"
        />
      </div>

      <div className="settings-group">
        <label htmlFor="listType">List Type</label>
        <select
          name="listType"
          value={localSettings.listType}
          onChange={handleInputChange}
          className="settings-input"
        >
          <option value="ul">Unordered List</option>
          <option value="ol">Ordered List</option>
        </select>
      </div>

      <div className="settings-group list-checkbox-group">
        <label htmlFor="listStyleToggle" className="wrapper-toggle-dots">
          <input
            type="checkbox"
            id="listStyleToggle"
            checked={localSettings.listStyleType !== 'none'}
            onChange={handleCheckboxChange}
            className="custom-list-style-checkbox"
          />
          Show Dots/Numbers
        </label>
      </div>
      <hr />
    </>
  );
};

export default ListGeneralSettings;
