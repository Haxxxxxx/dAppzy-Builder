import React, { useState } from 'react';

const CollapsibleSection = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const contentId = `collapsible-content-${title?.replace(/\s+/g, '-').toLowerCase()}`;

  const toggle = () => setIsCollapsed(prev => !prev);

  return (
    <div>
      <h3
        className="link-settings-panel-header"
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
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
      {!isCollapsed && <div id={contentId}>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
