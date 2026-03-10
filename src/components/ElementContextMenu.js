import React, { useEffect, useRef } from 'react';
import './css/ElementContextMenu.css';

const ElementContextMenu = ({ x, y, onClose, items }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to avoid viewport overflow
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) menuRef.current.style.left = `${x - rect.width}px`;
    if (rect.bottom > vh) menuRef.current.style.top = `${y - rect.height}px`;
  }, [x, y]);

  return (
    <div
      className="ctx-menu"
      ref={menuRef}
      style={{ top: y, left: x }}
    >
      {items.map((item, i) =>
        item === 'divider' ? (
          <div key={i} className="ctx-menu-divider" />
        ) : (
          <button
            key={item.label}
            className={`ctx-menu-item${item.disabled ? ' disabled' : ''}`}
            onClick={() => { if (!item.disabled) { item.action(); onClose(); } }}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  );
};

export default ElementContextMenu;
