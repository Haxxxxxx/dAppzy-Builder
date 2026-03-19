import React, { useState } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const Tabs = ({ id }) => {
  const { data, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'tabs');

  // Parse tabs from content — stored as JSON array of { label, body }
  const defaultTabs = [
    { label: 'Tab 1', body: 'Content for tab 1' },
    { label: 'Tab 2', body: 'Content for tab 2' },
    { label: 'Tab 3', body: 'Content for tab 3' },
  ];

  const tabs = Array.isArray(data) ? data : defaultTabs;

  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabLabelBlur = (e, index) => {
    if (!isSelected) return;
    const updated = [...tabs];
    updated[index] = { ...updated[index], label: e.target.innerText.trim() || `Tab ${index + 1}` };
    updateData(updated);
  };

  const handleBodyBlur = (e) => {
    if (!isSelected) return;
    const updated = [...tabs];
    updated[activeIndex] = { ...updated[activeIndex], body: e.target.innerText.trim() || '' };
    updateData(updated);
  };

  const activeColor = styles.activeColor || '#5C4EFA';
  const inactiveColor = styles.inactiveColor || 'transparent';
  const borderColor = styles.borderColor || '#e0e0e0';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        width: styles.width || '100%',
        fontFamily: styles.fontFamily || 'inherit',
        fontSize: styles.fontSize || '14px',
        color: styles.color || '#333',
        ...styles,
      }}
    >
      {/* Tab headers */}
      <div
        style={{
          display: 'flex',
          borderBottom: `2px solid ${borderColor}`,
          gap: styles.tabGap || '0px',
        }}
      >
        {tabs.map((tab, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); setActiveIndex(i); handleSelect(e); }}
            style={{
              padding: styles.tabPadding || '10px 20px',
              cursor: 'pointer',
              borderBottom: i === activeIndex ? `2px solid ${activeColor}` : '2px solid transparent',
              marginBottom: '-2px',
              backgroundColor: i === activeIndex ? inactiveColor : 'transparent',
              color: i === activeIndex ? activeColor : (styles.inactiveTextColor || '#666'),
              fontWeight: i === activeIndex ? '600' : '400',
              transition: 'all 0.2s ease',
              userSelect: 'none',
            }}
          >
            <span
              contentEditable={isSelected}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleTabLabelBlur(e, i)}
              style={{ outline: 'none' }}
            >
              {tab.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tab body */}
      <div
        style={{
          padding: styles.bodyPadding || '16px',
          minHeight: styles.bodyMinHeight || '80px',
          border: `1px solid ${borderColor}`,
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
        }}
      >
        <div
          contentEditable={isSelected}
          suppressContentEditableWarning={true}
          onBlur={handleBodyBlur}
          style={{ outline: 'none' }}
        >
          {tabs[activeIndex]?.body || ''}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
