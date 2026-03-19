import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import '../components/css/SettingsPanel.css';
import '../components/LeftbarPanels/SettingsPanels/css/SettingsForm.css';

const DisplayEditor = () => {
  const { selectedElement, updateStyles, updateElementProperties } = useContext(EditableContext);

  if (!selectedElement) return null;

  // Read directly from live selectedElement — no local state needed
  const s = selectedElement.styles || {};
  const display = s.display || 'block';
  const flexDirection = s.flexDirection || 'row';
  const justifyContent = s.justifyContent || 'flex-start';
  const alignItems = s.alignItems || 'stretch';
  const flexWrap = s.flexWrap || 'nowrap';
  const gap = s.gap || '0px';
  const gridTemplateColumns = s.gridTemplateColumns || '';
  const gridTemplateRows = s.gridTemplateRows || '';

  const set = (prop, value) => updateStyles(selectedElement.id, { [prop]: value });

  // Breakpoint visibility helpers — write directly to breakpointStyles
  const bp = selectedElement.breakpointStyles || {};
  const isHiddenOn = (breakpoint) => bp[breakpoint]?.display === 'none';

  const toggleBreakpointVisibility = (breakpoint, hidden) => {
    const existing = bp[breakpoint] || {};
    let updated;
    if (hidden) {
      updated = { ...existing, display: 'none' };
    } else {
      // Remove the display override so it falls back to the default
      const { display: _removed, ...rest } = existing;
      updated = rest;
    }
    updateElementProperties(selectedElement.id, {
      breakpointStyles: {
        ...bp,
        [breakpoint]: updated,
      },
    });
  };

  return (
    <div className="settings-panel">
      {/* Visibility per breakpoint */}
      <div className="settings-group">
        <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Visibility</label>
        {[
          { key: 'desktop', label: 'Hide on Desktop' },
          { key: 'tablet', label: 'Hide on Tablet' },
          { key: 'mobile', label: 'Hide on Mobile' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isHiddenOn(key)}
              onChange={(e) => toggleBreakpointVisibility(key, e.target.checked)}
            />
            <span className="custom-checkbox"></span>
            {label}
          </label>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '8px 0' }} />

      <div className="settings-group">
        <select
          value={display}
          onChange={(e) => set('display', e.target.value)}
          className="settings-select"
        >
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="inline-block">Inline Block</option>
          <option value="inline-flex">Inline Flex</option>
          <option value="none">None</option>
        </select>
      </div>

      {(display === 'flex' || display === 'inline-flex') && (
        <>
          <div className="settings-group">
            <label>Flex Direction</label>
            <select
              value={flexDirection}
              onChange={(e) => set('flexDirection', e.target.value)}
              className="settings-select"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Justify Content</label>
            <select
              value={justifyContent}
              onChange={(e) => set('justifyContent', e.target.value)}
              className="settings-select"
            >
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Align Items</label>
            <select
              value={alignItems}
              onChange={(e) => set('alignItems', e.target.value)}
              className="settings-select"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex End</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Flex Wrap</label>
            <select
              value={flexWrap}
              onChange={(e) => set('flexWrap', e.target.value)}
              className="settings-select"
            >
              <option value="nowrap">No Wrap</option>
              <option value="wrap">Wrap</option>
              <option value="wrap-reverse">Wrap Reverse</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Gap</label>
            <input
              type="text"
              value={gap}
              onChange={(e) => set('gap', e.target.value)}
              placeholder="e.g., 10px, 1rem"
              className="settings-input"
            />
          </div>
        </>
      )}

      {display === 'grid' && (
        <>
          <div className="settings-group">
            <label>Grid Columns</label>
            <input
              type="text"
              value={gridTemplateColumns}
              onChange={(e) => set('gridTemplateColumns', e.target.value)}
              placeholder="e.g., 1fr 1fr, repeat(3, 1fr)"
              className="settings-input"
            />
          </div>

          <div className="settings-group">
            <label>Quick Presets</label>
            <div className="grid-preset-row">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => set('gridTemplateColumns', `repeat(${n}, 1fr)`)}
                  className={`grid-preset-btn ${gridTemplateColumns === `repeat(${n}, 1fr)` ? 'active' : ''}`}
                >
                  {n}-col
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group">
            <label>Grid Rows</label>
            <input
              type="text"
              value={gridTemplateRows}
              onChange={(e) => set('gridTemplateRows', e.target.value)}
              placeholder="e.g., auto, 100px 1fr"
              className="settings-input"
            />
          </div>

          <div className="settings-group">
            <label>Align Items</label>
            <select
              value={alignItems}
              onChange={(e) => set('alignItems', e.target.value)}
              className="settings-select"
            >
              <option value="stretch">Stretch</option>
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Justify Content</label>
            <select
              value={justifyContent}
              onChange={(e) => set('justifyContent', e.target.value)}
              className="settings-select"
            >
              <option value="start">Start</option>
              <option value="end">End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Gap</label>
            <input
              type="text"
              value={gap}
              onChange={(e) => set('gap', e.target.value)}
              placeholder="e.g., 10px, 1rem"
              className="settings-input"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DisplayEditor;
