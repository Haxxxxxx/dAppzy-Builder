// src/components/SpacingEditor.js
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/SpacingEditor.css';

const UNIT_OPTIONS = ['px', 'rem', 'em', '%', 'vw'];

// Parses a spacing value string (e.g. "16px" => { value: 16, unit: "px" })
function parseSpacingValue(val) {
  if (!val) return { value: 0, unit: 'px' };
  const str = String(val).trim();
  const match = str.match(/^(-?[\d.]+)\s*([a-z%]+)$/i);
  if (match) {
    return { value: parseFloat(match[1]) || 0, unit: match[2] };
  }
  return { value: parseFloat(str) || 0, unit: 'px' };
}

// Detects the most common unit across four side values
function detectUnit(sides) {
  const units = sides.map(s => parseSpacingValue(s).unit);
  const counts = {};
  for (const u of units) {
    counts[u] = (counts[u] || 0) + 1;
  }
  let best = 'px';
  let max = 0;
  for (const [u, c] of Object.entries(counts)) {
    if (c > max) { max = c; best = u; }
  }
  return best;
}

const SpacingEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [marginUnit, setMarginUnit] = useState('px');
  const [paddingUnit, setPaddingUnit] = useState('px');

  // Sync units from element styles when selection changes
  useEffect(() => {
    if (!selectedElement) return;
    const s = selectedElement.styles || {};
    setMarginUnit(detectUnit([s.marginTop, s.marginRight, s.marginBottom, s.marginLeft]));
    setPaddingUnit(detectUnit([s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft]));
  }, [selectedElement]);

  if (!selectedElement) return null;

  // Read directly from live selectedElement -- no local state needed for values
  const s = selectedElement.styles || {};

  // Parse shorthand values (e.g. "10px" or "10px 20px" or "10px 20px 30px 40px")
  const parseShorthand = (val) => {
    if (!val) return [0, 0, 0, 0];
    const parts = String(val).split(/\s+/).map(p => parseFloat(p) || 0);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    return [parts[0], parts[1], parts[2], parts[3]];
  };

  const [mT, mR, mB, mL] = parseShorthand(s.margin);
  const [pT, pR, pB, pL] = parseShorthand(s.padding);

  const margin = {
    top: parseSpacingValue(s.marginTop).value || mT,
    right: parseSpacingValue(s.marginRight).value || mR,
    bottom: parseSpacingValue(s.marginBottom).value || mB,
    left: parseSpacingValue(s.marginLeft).value || mL,
  };
  const padding = {
    top: parseSpacingValue(s.paddingTop).value || pT,
    right: parseSpacingValue(s.paddingRight).value || pR,
    bottom: parseSpacingValue(s.paddingBottom).value || pB,
    left: parseSpacingValue(s.paddingLeft).value || pL,
  };

  const handleSpacingChange = (type, direction, value) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    const unit = type === 'margin' ? marginUnit : paddingUnit;
    const prop = `${type}${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
    updateStyles(selectedElement.id, { [prop]: `${numericValue}${unit}` });
  };

  const handleMarginUnitChange = (e) => {
    const newUnit = e.target.value;
    setMarginUnit(newUnit);
    // Re-apply all four margin sides with the new unit
    updateStyles(selectedElement.id, {
      marginTop: `${margin.top}${newUnit}`,
      marginRight: `${margin.right}${newUnit}`,
      marginBottom: `${margin.bottom}${newUnit}`,
      marginLeft: `${margin.left}${newUnit}`,
    });
  };

  const handlePaddingUnitChange = (e) => {
    const newUnit = e.target.value;
    setPaddingUnit(newUnit);
    // Re-apply all four padding sides with the new unit
    updateStyles(selectedElement.id, {
      paddingTop: `${padding.top}${newUnit}`,
      paddingRight: `${padding.right}${newUnit}`,
      paddingBottom: `${padding.bottom}${newUnit}`,
      paddingLeft: `${padding.left}${newUnit}`,
    });
  };

  return (
    <div className="spacing-editor">
      {/* Outer container for margin */}
      <div className="margin-box">
        <div className="margin-label">MARGIN</div>
        <div className="margin-unit-select">
          <select value={marginUnit} onChange={handleMarginUnitChange}>
            {UNIT_OPTIONS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="margin-top">
          <input
            type="number"
            value={margin.top}
            onChange={(e) => handleSpacingChange('margin', 'top', e.target.value)}
          />
        </div>
        <div className="margin-right">
          <input
            type="number"
            value={margin.right}
            onChange={(e) => handleSpacingChange('margin', 'right', e.target.value)}
          />
        </div>
        <div className="margin-bottom">
          <input
            type="number"
            value={margin.bottom}
            onChange={(e) => handleSpacingChange('margin', 'bottom', e.target.value)}
          />
        </div>
        <div className="margin-left">
          <input
            type="number"
            value={margin.left}
            onChange={(e) => handleSpacingChange('margin', 'left', e.target.value)}
          />
        </div>

        {/* Inner container for padding */}
        <div className="padding-box">
          <div className="padding-label">PADDING</div>
          <div className="padding-unit-select">
            <select value={paddingUnit} onChange={handlePaddingUnitChange}>
              {UNIT_OPTIONS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="padding-top">
            <input
              type="number"
              value={padding.top}
              onChange={(e) => handleSpacingChange('padding', 'top', e.target.value)}
            />
          </div>
          <div className="padding-right">
            <input
              type="number"
              value={padding.right}
              onChange={(e) => handleSpacingChange('padding', 'right', e.target.value)}
            />
          </div>
          <div className="padding-bottom">
            <input
              type="number"
              value={padding.bottom}
              onChange={(e) => handleSpacingChange('padding', 'bottom', e.target.value)}
            />
          </div>
          <div className="padding-left">
            <input
              type="number"
              value={padding.left}
              onChange={(e) => handleSpacingChange('padding', 'left', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacingEditor;
