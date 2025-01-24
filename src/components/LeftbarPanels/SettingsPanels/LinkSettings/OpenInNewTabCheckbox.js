const OpenInNewTabCheckbox = ({ openInNewTab, onChange }) => (
    <div className="settings-group target-blank">
      <label className="target-input">
        <input
          type="checkbox"
          name="openInNewTab"
          checked={openInNewTab}
          onChange={onChange}
          className="rounded-checkbox"
          
        />
        <p>Open in new tab</p>
      </label>
    </div>
  );
  
  export default OpenInNewTabCheckbox;
  