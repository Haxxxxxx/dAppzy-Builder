const TargetValueField = ({ actionType, targetValue, onChange }) => {
    const pages = ['Home', 'About', 'Contact'];
    const sections = ['#section1', '#section2', '#section3'];
    const popups = ['Popup1', 'Popup2', 'Popup3'];
  
    const renderField = () => {
      switch (actionType) {
        case 'page':
          return (
            <select
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              className="settings-input"
            >
              <option value="" disabled>Select a page</option>
              {pages.map((page) => (
                <option key={page} value={page}>{page}</option>
              ))}
            </select>
          );
        case 'pageSection':
          return (
            <select
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              className="settings-input"

            >
              <option value="" disabled>Select a section</option>
              {sections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          );
        case 'popup':
          return (
            <select
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              className="settings-input"
            >
              <option value="" disabled>Select a popup</option>
              {popups.map((popup) => (
                <option key={popup} value={popup}>{popup}</option>
              ))}
            </select>
          );
        case 'URL':
          return (
            <input
              type="text"
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              placeholder="Enter external URL"
              className="settings-input"
              style={{  width: "80%"}}

            />
          );
          case 'file':
          return (
            <input
              type="text"
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              placeholder="Enter file"
              className="settings-input"

            />
          );
        default:
          return (
            <input
              type="text"
              name="targetValue"
              value={targetValue}
              onChange={onChange}
              placeholder="Enter value"
              className="settings-input"
            />
          );
      }
    };
  
    return <div className="settings-group"         
>
        <p>{actionType}</p>
        {renderField()}</div>;
  };
  
  export default TargetValueField;
  