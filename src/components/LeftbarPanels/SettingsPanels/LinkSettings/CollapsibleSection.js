import React, { useState } from 'react';

const CollapsibleSection = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div>
      <h3
        className="link-settings-panel-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between' }}
      >
        {title}
        <span>{isCollapsed ? <span className="material-symbols-outlined">
          keyboard_arrow_down
        </span> : <span className="material-symbols-outlined">
          chevron_right
        </span>}</span>
      </h3>
      <hr></hr>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
