import React, { useState } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const Accordion = ({ id }) => {
  const { data, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'accordion');

  // Parse items from content — stored as JSON array of { title, body }
  const defaultItems = [
    { title: 'Accordion Item 1', body: 'Content for accordion item 1.' },
    { title: 'Accordion Item 2', body: 'Content for accordion item 2.' },
    { title: 'Accordion Item 3', body: 'Content for accordion item 3.' },
  ];

  const items = Array.isArray(data) ? data : defaultItems;

  const [openIndices, setOpenIndices] = useState(new Set([0]));
  const allowMultiple = styles.allowMultiple !== false;

  const toggleItem = (index) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) next.clear();
        next.add(index);
      }
      return next;
    });
  };

  const handleTitleBlur = (e, index) => {
    if (!isSelected) return;
    const updated = [...items];
    updated[index] = { ...updated[index], title: e.target.innerText.trim() || `Item ${index + 1}` };
    updateData(updated);
  };

  const handleBodyBlur = (e, index) => {
    if (!isSelected) return;
    const updated = [...items];
    updated[index] = { ...updated[index], body: e.target.innerText.trim() || '' };
    updateData(updated);
  };

  const borderColor = styles.borderColor || '#e0e0e0';
  const headerBg = styles.headerBackground || '#f9f9f9';
  const activeColor = styles.activeColor || '#5C4EFA';

  return (
    <div
      id={id}
      onClick={handleSelect}
      style={{
        width: styles.width || '100%',
        fontFamily: styles.fontFamily || 'inherit',
        fontSize: styles.fontSize || '14px',
        color: styles.color || '#333',
        borderRadius: styles.borderRadius || '8px',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        ...styles,
      }}
    >
      {items.map((item, i) => {
        const isOpen = openIndices.has(i);
        return (
          <div key={i} style={{ borderBottom: i < items.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
            {/* Header */}
            <div
              onClick={(e) => { e.stopPropagation(); toggleItem(i); handleSelect(e); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: styles.headerPadding || '12px 16px',
                backgroundColor: isOpen ? headerBg : 'transparent',
                cursor: 'pointer',
                fontWeight: isOpen ? '600' : '400',
                transition: 'background-color 0.2s ease',
              }}
            >
              <span
                contentEditable={isSelected}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleTitleBlur(e, i)}
                style={{ outline: 'none', flex: 1 }}
              >
                {item.title}
              </span>
              <span
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  fontSize: '12px',
                  color: isOpen ? activeColor : '#999',
                  marginLeft: '8px',
                  flexShrink: 0,
                }}
              >
                ▼
              </span>
            </div>

            {/* Body */}
            <div
              style={{
                maxHeight: isOpen ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}
            >
              <div
                contentEditable={isSelected}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBodyBlur(e, i)}
                style={{
                  padding: styles.bodyPadding || '12px 16px',
                  outline: 'none',
                  lineHeight: '1.6',
                }}
              >
                {item.body}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
