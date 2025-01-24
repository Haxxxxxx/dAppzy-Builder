const ActionTypeSelector = ({ actionType, onChange }) => (
    <div className="settings-group full-size-input">
      <select
        name="actionType"
        value={actionType}
        onChange={onChange}
        className="settings-input"
      >
        <option value="page">Page</option>
        <option value="pageSection">Page Section</option>
        <option value="file">File</option>
        <option value="popup">Popup</option>
        <option value="function">Function</option>
        <option value="URL">URL</option>
      </select>
    </div>
  );
  
  export default ActionTypeSelector;
  