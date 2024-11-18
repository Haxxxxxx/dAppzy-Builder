// src/components/TableFormatModal.js
import React, { useState } from 'react';

const TableFormatModal = ({ isOpen, onClose, onSubmit }) => {
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);

  const handleSubmit = () => {
    onSubmit(rows, columns);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Choose Table Format</h3>
        <div className="modal-controls">
          <label>
            Rows:
            <input
              type="number"
              min="1"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </label>
          <label>
            Columns:
            <input
              type="number"
              min="1"
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button onClick={handleSubmit}>Create Table</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TableFormatModal;
