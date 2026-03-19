import React, { useState } from 'react';
import { useInteractiveElement } from '../../hooks/useInteractiveElement';

const Modal = ({ id }) => {
  const { data: parsedData, styles, isSelected, handleSelect, updateData } = useInteractiveElement(id, 'modal');

  const defaultData = {
    triggerText: 'Open Modal',
    title: 'Modal Title',
    body: 'Modal content goes here.',
  };

  const data = (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) ? parsedData : defaultData;

  const [isOpen, setIsOpen] = useState(false);

  const handleFieldBlur = (field) => (e) => {
    if (!isSelected) return;
    const updated = { ...data, [field]: e.target.innerText.trim() || defaultData[field] };
    updateData(updated);
  };

  const activeColor = styles.activeColor || '#5C4EFA';
  const overlayBg = styles.overlayBackground || 'rgba(0,0,0,0.5)';

  return (
    <div id={id} onClick={handleSelect}>
      {/* Trigger button */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); handleSelect(e); }}
        style={{
          backgroundColor: activeColor,
          color: '#fff',
          border: 'none',
          padding: styles.triggerPadding || '10px 20px',
          borderRadius: styles.borderRadius || '6px',
          cursor: 'pointer',
          fontSize: styles.fontSize || '14px',
          fontFamily: styles.fontFamily || 'inherit',
          fontWeight: '500',
        }}
      >
        {data.triggerText}
      </button>

      {/* Modal overlay + dialog */}
      {isOpen && (
        <div
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: overlayBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: styles.modalBackground || '#fff',
              borderRadius: styles.modalRadius || '12px',
              padding: styles.modalPadding || '24px',
              minWidth: styles.modalWidth || '400px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span
                contentEditable={isSelected}
                suppressContentEditableWarning={true}
                onBlur={handleFieldBlur('title')}
                style={{ fontSize: '18px', fontWeight: '600', outline: 'none', color: styles.color || '#333' }}
              >
                {data.title}
              </span>
              <span
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                style={{ cursor: 'pointer', fontSize: '20px', color: '#999', lineHeight: 1 }}
              >
                ✕
              </span>
            </div>

            {/* Body */}
            <div
              contentEditable={isSelected}
              suppressContentEditableWarning={true}
              onBlur={handleFieldBlur('body')}
              style={{
                fontSize: styles.fontSize || '14px',
                color: styles.bodyColor || '#666',
                lineHeight: '1.6',
                outline: 'none',
              }}
            >
              {data.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
