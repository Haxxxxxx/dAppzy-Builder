import React, { useState } from 'react';
import './CollapsibleSection.css';

const CollapsibleSection = ({ title, children, defaultExpanded = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(!defaultExpanded);

  return (
    <div className={`collapsible-section ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className="collapsible-header"
        aria-expanded={!isCollapsed}
        onClick={() => setIsCollapsed(prev => !prev)}
      >
        <span className="collapsible-title">{title}</span>
        <span className="material-symbols-outlined collapsible-chevron">
          {isCollapsed ? 'chevron_right' : 'keyboard_arrow_down'}
        </span>
      </button>
      {!isCollapsed && (
        <div className="collapsible-body">{children}</div>
      )}
    </div>
  );
};

export default CollapsibleSection;
