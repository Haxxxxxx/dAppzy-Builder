import React, { useState } from 'react';
import '../css/DropdownSettings.css'; // Add specific styles for DropdownSettings
import ActionTypeSelector from '../LinkSettings/ActionTypeSelector'; // Reuse existing component
import CollapsibleSection from './CollapsibleSection';
import OpenInNewTabCheckbox from './OpenInNewTabCheckbox';

const DropdownSettings = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [closeDelay, setCloseDelay] = useState(0);
  const [openOnHover, setOpenOnHover] = useState(false);
  const [links, setLinks] = useState([]);

  // Add a new link
  const handleAddLink = () => {
    const newLink = { id: Date.now(), actionType: 'page', targetValue: '' };
    setLinks((prevLinks) => [...prevLinks, newLink]);
  };

  // Update a link's action type or target value
  const handleLinkChange = (id, field, value) => {
    setLinks((prevLinks) =>
      prevLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  // Remove a link
  const handleRemoveLink = (id) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
  };

  return (
    <div className="dropdown-settings">
      <div className="settings-group">
        <label className="switch-label">
          <input
            type="checkbox"
            checked={showDropdown}
            onChange={() => setShowDropdown((prev) => !prev)}
            className="switch-input"
          />
          <span className="switch-slider"></span>
          <span>Show Menu Dropdown</span>
        </label>
      </div>

      {/* Close Delay */}
      <div className="settings-group">
        <label htmlFor="closeDelay">Close Delay (ms)</label>
        <input
          type="number"
          id="closeDelay"
          value={closeDelay}
          onChange={(e) => setCloseDelay(Number(e.target.value))}
          className="settings-input"
        />
      </div>

      {/* Open on Hover/Click */}
      <div className="settings-group">
        <label className="custom-checkbox-label">
          <input
            type="checkbox"
            checked={openOnHover}
            onChange={(e) => setOpenOnHover(e.target.checked)}
            className="custom-checkbox-input"
          />
          <span className="custom-checkbox"></span>
          <span>Open menu on hover</span>
        </label>
      </div>

      {/* Add Link Button */}
      <div className="settings-group">
        <button className="add-link-button" onClick={handleAddLink}>
          + Add Link
        </button>
      </div>

      {/* Manage Links */}
      <div className="dropdown-links-section">
        <CollapsibleSection title="Manage Links">
          {links.length > 0 ? (
            links.map((link) => (
              <div key={link.id} className="link-item">
                {/* Remove Link Icon */}
                <span
                  className="remove-link-icon material-symbols-outlined"
                  onClick={() => handleRemoveLink(link.id)}
                >
                  delete
                </span>

                {/* Redirect Method Selector */}
                <ActionTypeSelector
                  actionType={link.actionType}
                  onChange={(e) =>
                    handleLinkChange(link.id, 'actionType', e.target.value)
                  }
                />
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>

                <label>{link.actionType}</label>
                {/* Target Value Input */}
                <input
                  type="text"
                  name="targetValue"
                  value={link.targetValue}
                  onChange={(e) =>
                    handleLinkChange(link.id, 'targetValue', e.target.value)
                  }
                  placeholder="Enter target value"
                  className="settings-input"
                />

                </div>
                <OpenInNewTabCheckbox/>
                <hr/>
              </div>
            ))
          ) : (
            <p>No links added yet.</p>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default DropdownSettings;
