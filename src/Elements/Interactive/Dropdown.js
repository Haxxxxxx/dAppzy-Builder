import React, { useState, useRef, useEffect } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const Dropdown = ({ id }) => {
  const { data: parsedData, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'dropdown');

  // Parse from content — { label, items: string[] }
  const defaultData = {
    label: 'Dropdown',
    items: ['Option 1', 'Option 2', 'Option 3'],
  };

  const data = (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) ? parsedData : defaultData;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLabelBlur = (e) => {
    if (!isSelected) return;
    const updated = { ...data, label: e.target.innerText.trim() || 'Dropdown' };
    updateData(updated);
  };

  const borderColor = styles.borderColor || '#d0d0d0';
  const hoverBg = styles.hoverBackground || '#f5f5f5';
  const activeColor = styles.activeColor || '#5C4EFA';

  return (
    <div
      id={id}
      ref={dropdownRef}
      onClick={handleSelect}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: styles.width || '200px',
        fontFamily: styles.fontFamily || 'inherit',
        fontSize: styles.fontSize || '14px',
        color: styles.color || '#333',
        ...styles,
      }}
    >
      {/* Trigger */}
      <div
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); handleSelect(e); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: styles.triggerPadding || '10px 14px',
          border: `1px solid ${borderColor}`,
          borderRadius: styles.borderRadius || '6px',
          backgroundColor: styles.backgroundColor || '#fff',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          contentEditable={isSelected && !isOpen}
          suppressContentEditableWarning={true}
          onBlur={handleLabelBlur}
          style={{ outline: 'none', flex: 1 }}
        >
          {selectedItem || data.label}
        </span>
        <span
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            fontSize: '10px',
            color: '#999',
            marginLeft: '8px',
          }}
        >
          ▼
        </span>
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            border: `1px solid ${borderColor}`,
            borderRadius: styles.borderRadius || '6px',
            backgroundColor: styles.menuBackground || '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {data.items.map((item, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              style={{
                padding: styles.itemPadding || '10px 14px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                color: selectedItem === item ? activeColor : 'inherit',
                fontWeight: selectedItem === item ? '600' : '400',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
