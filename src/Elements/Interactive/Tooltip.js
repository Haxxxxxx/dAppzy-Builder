import React, { useState } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const Tooltip = ({ id }) => {
  const { data: parsedData, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'tooltip');

  const defaultData = { trigger: 'Hover me', tip: 'Tooltip text here' };
  const data = (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) ? parsedData : defaultData;

  const [showTip, setShowTip] = useState(false);

  const handleFieldBlur = (field) => (e) => {
    if (!isSelected) return;
    const updated = { ...data, [field]: e.target.innerText.trim() || defaultData[field] };
    updateData(updated);
  };

  const position = styles.tooltipPosition || 'top';
  const tipBg = styles.tooltipBackground || '#333';
  const tipColor = styles.tooltipColor || '#fff';

  const positionStyles = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' },
  };

  return (
    <div
      id={id}
      onClick={handleSelect}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: styles.fontFamily || 'inherit',
        ...styles,
      }}
    >
      {/* Trigger */}
      <span
        contentEditable={isSelected}
        suppressContentEditableWarning={true}
        onBlur={handleFieldBlur('trigger')}
        style={{
          fontSize: styles.fontSize || '14px',
          color: styles.color || '#333',
          cursor: 'default',
          outline: 'none',
          borderBottom: `1px dotted ${styles.color || '#999'}`,
        }}
      >
        {data.trigger}
      </span>

      {/* Tooltip bubble */}
      {(showTip || isSelected) && (
        <div
          style={{
            position: 'absolute',
            ...positionStyles[position],
            backgroundColor: tipBg,
            color: tipColor,
            padding: styles.tipPadding || '6px 12px',
            borderRadius: styles.tipRadius || '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: isSelected ? 'auto' : 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <span
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            onBlur={handleFieldBlur('tip')}
            style={{ outline: 'none' }}
          >
            {data.tip}
          </span>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
