import React, { useState } from 'react';

const CollapsibleSection = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div>
      <h3
        className="link-settings-panel-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer', userSelect: 'none', display:'flex', justifyContent:'space-between'  }}
      >
        {title}
        <span>{isCollapsed ? '▼' : '▶'}</span>
      </h3>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
