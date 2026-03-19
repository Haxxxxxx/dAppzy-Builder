import React, { useCallback } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const DEFAULT_CONTENT = {
  message: 'This is an alert message',
  variant: 'info',
  dismissible: true,
};

const VARIANT_CONFIG = {
  info:    { bg: '#eff6ff', border: '#3b82f6', icon: '\u2139\uFE0F', color: '#1e40af' },
  success: { bg: '#f0fdf4', border: '#22c55e', icon: '\u2705',       color: '#166534' },
  warning: { bg: '#fffbeb', border: '#f59e0b', icon: '\u26A0\uFE0F', color: '#92400e' },
  error:   { bg: '#fef2f2', border: '#ef4444', icon: '\u274C',       color: '#991b1b' },
};

const Alert = ({ id }) => {
  const { element, data: rawData, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'alert');

  const data = rawData || DEFAULT_CONTENT;
  const { message, variant, dismissible } = { ...DEFAULT_CONTENT, ...data };
  const dismissed = data.dismissed === true;
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;

  const handleDismiss = useCallback((e) => {
    e.stopPropagation();
    const updated = { ...data, dismissed: true };
    updateData(updated);
  }, [data, updateData]);

  if (dismissed && !isSelected) {
    return (
      <div
        id={id}
        onClick={handleSelect}
        style={{
          padding: '8px 16px',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999',
          fontSize: '12px',
          cursor: 'pointer',
          ...styles,
          outline: isSelected ? '2px solid #5C4EFA' : undefined,
        }}
      >
        Alert dismissed (select to restore via settings)
      </div>
    );
  }

  return (
    <div
      id={id}
      onClick={handleSelect}
      data-alert
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        borderLeft: `4px solid ${cfg.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: styles.fontSize || '14px',
        fontFamily: styles.fontFamily || 'inherit',
        ...styles,
        outline: isSelected ? '2px solid #5C4EFA' : undefined,
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
      {dismissible && (
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: cfg.color,
            opacity: 0.6,
            padding: '0 4px',
            lineHeight: 1,
            flexShrink: 0,
          }}
          title="Dismiss"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
