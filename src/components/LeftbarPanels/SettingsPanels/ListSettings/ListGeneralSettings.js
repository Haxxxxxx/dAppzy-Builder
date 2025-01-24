import React from 'react';

const ListGeneralSettings = ({ localSettings, setLocalSettings }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      listStyleType: checked ? (localSettings.type === 'ol' ? 'decimal' : 'disc') : 'none',
    }));
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
        <label htmlFor="type">Type</label>
        <select
          name="type"
          value={localSettings.type}
          onChange={handleInputChange}
          className="settings-input"
        >
          <option value="ul">Unordered List</option>
          <option value="ol">Ordered List</option>
        </select>
      </div>
      <div className="settings-group list-checkbox-group">
        <label htmlFor="listStyleToggle" className='wrapper-toggle-dots'>
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
