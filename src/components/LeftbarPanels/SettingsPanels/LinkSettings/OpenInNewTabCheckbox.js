import React from "react";

const OpenInNewTabCheckbox = ({ openInNewTab, onChange }) => (
  <div className="settings-group target-blank">
    <label className="custom-checkbox-label">
      <input
        type="checkbox"
        name="openInNewTab"
        checked={openInNewTab}
        onChange={onChange}
        className="custom-checkbox-input"
      />
      <span className="custom-checkbox"></span>
      <span>Open in new tab</span>
    </label>
  </div>
);

export default OpenInNewTabCheckbox;
