import React from 'react';

const ActionTypeSelector = ({ actionType, onChange, additionalOptions = [] }) => (
  <div className="settings-group full-size-input">
    <select
      name="actionType"
      value={actionType}
      onChange={onChange}
      className="settings-input"
    >
      <option value="page">Page Link</option>
      <option value="pageSection">Page Section</option>
      <option value="file">File</option>
      <option value="URL">URL</option>
      <option value="mailto">Email (mailto:)</option>
      <option value="tel">Phone (tel:)</option>
      {additionalOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default ActionTypeSelector;
