import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ open, title, content, okText = 'OK', cancelText = 'Cancel', okType = 'primary', onOk, onCancel }) => {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{content}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`confirm-modal-btn confirm-modal-btn-${okType === 'danger' ? 'danger' : 'primary'}`}
            onClick={onOk}
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
