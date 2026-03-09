import React, { useState, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const TableSettings = () => {
  const { selectedElement, elements, addNewElement, handleRemoveElement, recordElementsUpdate } = useContext(EditableContext);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);

  // Find the table element — could be selected as table, table-row, or table-cell
  const getTableId = () => {
    if (!selectedElement) return null;
    if (selectedElement.type === 'table') return selectedElement.id;
    // Walk up to find the table
    let current = elements.find(el => el.id === selectedElement.id);
    let depth = 0;
    while (current && depth < 5) {
      if (current.type === 'table') return current.id;
      current = elements.find(el => el.id === current.parentId);
      depth++;
    }
    return null;
  };

  const tableId = getTableId();
  const tableElement = tableId ? elements.find(el => el.id === tableId) : null;

  useEffect(() => {
    if (!tableElement) return;
    const rowElements = (tableElement.children || [])
      .map(id => elements.find(el => el.id === id))
      .filter(Boolean);
    setRows(rowElements.length);
    // Use first row to determine column count
    const firstRow = rowElements[0];
    setCols(firstRow?.children?.length || 0);
  }, [tableElement, elements]);

  const addRow = () => {
    if (!tableId) return;
    const colCount = cols || 1;
    // Create a row with cells
    const rowConfig = {
      type: 'table-row',
      children: Array.from({ length: colCount }, () => ({
        type: 'table-cell',
        content: 'Cell',
      })),
    };
    addNewElement('table-row', 1, null, tableId, rowConfig);
  };

  const removeLastRow = () => {
    if (!tableElement || !tableElement.children?.length) return;
    const lastRowId = tableElement.children[tableElement.children.length - 1];
    handleRemoveElement(lastRowId);
  };

  const addColumn = () => {
    if (!tableElement) return;
    const rowIds = tableElement.children || [];
    // Add a cell to each row
    rowIds.forEach(rowId => {
      addNewElement('table-cell', 1, null, rowId, { type: 'table-cell', content: 'Cell' });
    });
  };

  const removeLastColumn = () => {
    if (!tableElement) return;
    const rowIds = tableElement.children || [];
    rowIds.forEach(rowId => {
      const row = elements.find(el => el.id === rowId);
      if (row?.children?.length > 1) {
        const lastCellId = row.children[row.children.length - 1];
        handleRemoveElement(lastCellId);
      }
    });
  };

  if (!tableElement) return null;

  return (
    <div className="settings-panel">
      <hr />
      <div className="settings-group">
        <label>ID</label>
        <input type="text" value={tableId || ''} readOnly className="settings-input" />
      </div>
      <hr />

      <CollapsibleSection title="Table Structure">
        <div className="settings-group">
          <label>Rows: {rows}</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={addRow}
              style={{
                flex: 1, padding: '6px', background: 'var(--input-bg, #2a2a3a)',
                border: '1px solid var(--border-color, #333)', borderRadius: '4px',
                color: 'var(--editor-text, #fff)', cursor: 'pointer', fontSize: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>add</span> Add Row
            </button>
            <button
              onClick={removeLastRow}
              disabled={rows <= 1}
              style={{
                flex: 1, padding: '6px', background: 'var(--input-bg, #2a2a3a)',
                border: '1px solid var(--border-color, #333)', borderRadius: '4px',
                color: rows <= 1 ? 'var(--not-selected, #888)' : 'var(--editor-text, #fff)',
                cursor: rows <= 1 ? 'not-allowed' : 'pointer', fontSize: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>remove</span> Remove Row
            </button>
          </div>
        </div>

        <div className="settings-group">
          <label>Columns: {cols}</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={addColumn}
              style={{
                flex: 1, padding: '6px', background: 'var(--input-bg, #2a2a3a)',
                border: '1px solid var(--border-color, #333)', borderRadius: '4px',
                color: 'var(--editor-text, #fff)', cursor: 'pointer', fontSize: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>add</span> Add Column
            </button>
            <button
              onClick={removeLastColumn}
              disabled={cols <= 1}
              style={{
                flex: 1, padding: '6px', background: 'var(--input-bg, #2a2a3a)',
                border: '1px solid var(--border-color, #333)', borderRadius: '4px',
                color: cols <= 1 ? 'var(--not-selected, #888)' : 'var(--editor-text, #fff)',
                cursor: cols <= 1 ? 'not-allowed' : 'pointer', fontSize: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>remove</span> Remove Column
            </button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default TableSettings;
