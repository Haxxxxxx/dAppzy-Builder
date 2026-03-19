import React, { useRef, useState, useCallback } from 'react';

const TOOLBAR_BUTTONS = [
  { command: 'bold', label: 'B', style: { fontWeight: 'bold' }, title: 'Bold' },
  { command: 'italic', label: 'I', style: { fontStyle: 'italic' }, title: 'Italic' },
  { command: 'underline', label: 'U', style: { textDecoration: 'underline' }, title: 'Underline' },
  { command: 'createLink', label: 'link', isIcon: true, title: 'Insert Link' },
  { command: 'removeFormat', label: 'format_clear', isIcon: true, title: 'Clear Formatting' },
];

const toolbarStyles = {
  wrapper: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    background: '#1e1e2e',
    borderRadius: 6,
    padding: '4px 6px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
    zIndex: 9999,
    whiteSpace: 'nowrap',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    border: 'none',
    borderRadius: 4,
    background: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'inherit',
    padding: 0,
    transition: 'background 0.15s, color 0.15s',
  },
  buttonHover: {
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
  icon: {
    fontSize: 18,
  },
};

const RichTextToolbar = ({ containerRef }) => {
  const toolbarRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const execCommand = useCallback((command) => {
    if (command === 'createLink') {
      const url = window.prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else {
      document.execCommand(command, false, null);
    }
    // Re-focus the editable element so the selection stays
    if (containerRef?.current) {
      containerRef.current.focus();
    }
  }, [containerRef]);

  // Prevent toolbar clicks from blurring the contentEditable
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div
      ref={toolbarRef}
      style={toolbarStyles.wrapper}
      onMouseDown={handleMouseDown}
    >
      {TOOLBAR_BUTTONS.map((btn, i) => (
        <button
          key={btn.command}
          title={btn.title}
          onClick={() => execCommand(btn.command)}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(-1)}
          style={{
            ...toolbarStyles.button,
            ...(btn.style || {}),
            ...(hoveredIndex === i ? toolbarStyles.buttonHover : {}),
          }}
        >
          {btn.isIcon ? (
            <span className="material-symbols-outlined" style={toolbarStyles.icon}>
              {btn.label}
            </span>
          ) : (
            btn.label
          )}
        </button>
      ))}
    </div>
  );
};

export default RichTextToolbar;
