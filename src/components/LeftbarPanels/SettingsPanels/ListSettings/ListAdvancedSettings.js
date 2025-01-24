import React from 'react';

const ListAdvancedSettings = ({ localSettings, setLocalSettings }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setLocalSettings((prev) => ({ ...prev, [name]: newValue }));
  };

  return (
    <>
      <div className="settings-group">
        <label htmlFor="start">Start Number</label>
        <input
          type="number"
          name="start"
          value={localSettings.start}
          onChange={handleInputChange}
          className="settings-input"
          min={1}
        />
      </div>
      <div className="settings-group">
        <label htmlFor="listStyleType">List Style</label>
        <select
          name="listStyleType"
          value={localSettings.listStyleType}
          onChange={handleInputChange}
          className="settings-input"
        >
          <option value="decimal">Decimal (1, 2, 3)</option>
          <option value="lower-roman">Lower Roman (i, ii, iii)</option>
          <option value="upper-roman">Upper Roman (I, II, III)</option>
          <option value="lower-alpha">Lower Alphabet (a, b, c)</option>
          <option value="upper-alpha">Upper Alphabet (A, B, C)</option>
        </select>
      </div>
      <div className="settings-group">
        <label htmlFor="reversed">Reversed Order</label>
        <input
          type="checkbox"
          name="reversed"
          checked={localSettings.reversed}
          onChange={handleInputChange}
          className="settings-input"
        />
      </div>
      <hr />
    </>
  );
};

export default ListAdvancedSettings;
