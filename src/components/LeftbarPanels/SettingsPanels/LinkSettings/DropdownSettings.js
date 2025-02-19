import React from 'react';
import '../css/DropdownSettings.css'; // Specific styles for DropdownSettings
import ActionTypeSelector from '../LinkSettings/ActionTypeSelector';
import CollapsibleSection from './CollapsibleSection';
import OpenInNewTabCheckbox from './OpenInNewTabCheckbox';

const DropdownSettings = ({ links, onChangeLinks }) => {
  // Add a new link with default properties (including content)
  const handleAddLink = () => {
    const newLink = { 
      id: Date.now(), 
      content: 'New Link',
      actionType: 'page', 
      targetValue: '', 
      openInNewTab: false 
    };
    onChangeLinks([...links, newLink]);
  };

  // Update a link's property (actionType, targetValue, openInNewTab, or content)
  const handleLinkChange = (id, field, value) => {
    const updatedLinks = links.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    onChangeLinks(updatedLinks);
  };

  // Remove a link from the dropdown list
  const handleRemoveLink = (id) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    onChangeLinks(updatedLinks);
  };

  return (
    <div className="dropdown-settings">
      <div className="settings-group">
        <button className="add-link-button" onClick={handleAddLink}>
          + Add Link
        </button>
      </div>

      <div className="dropdown-links-section">
        <CollapsibleSection title="Manage Links">
          {links && links.length > 0 ? (
            links.map((link) => (
              <div key={link.id} className="link-item">
                {/* Remove Link Icon */}
                <span
                  className="remove-link-icon material-symbols-outlined"
                  onClick={() => handleRemoveLink(link.id)}
                >
                  delete
                </span>

                {/* Content Input for the link */}
                <div className="settings-group">
                  <label>Link Text</label>
                  <input
                    type="text"
                    name="content"
                    value={link.content}
                    onChange={(e) =>
                      handleLinkChange(link.id, 'content', e.target.value)
                    }
                    placeholder="Enter link text"
                    className="settings-input"
                  />
                </div>

                {/* Redirect Method Selector */}
                <ActionTypeSelector
                  actionType={link.actionType}
                  onChange={(e) =>
                    handleLinkChange(link.id, 'actionType', e.target.value)
                  }
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                {/* Controlled OpenInNewTabCheckbox */}
                <OpenInNewTabCheckbox
                  openInNewTab={link.openInNewTab}
                  onChange={(e) =>
                    handleLinkChange(link.id, 'openInNewTab', e.target.checked)
                  }
                />
                <hr />
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
