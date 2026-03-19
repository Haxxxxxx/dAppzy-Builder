import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/PositionEditor.css";

const OFFSET_UNITS = ["px", "%", "vh", "vw", "rem"];

// Parse a CSS offset value (e.g. "16px", "5%", "10vh") into { value, unit }
function parseOffsetValue(val) {
  if (!val) return { value: "", unit: "px" };
  const str = String(val).trim();
  const match = str.match(/^(-?[\d.]+)\s*([a-z%]+)$/i);
  if (match) return { value: parseFloat(match[1]), unit: match[2] };
  const num = parseFloat(str);
  return { value: isNaN(num) ? "" : num, unit: "px" };
}

// Detect the most common unit across the four offset values
function detectOffsetUnit(sides) {
  const units = sides.map((s) => parseOffsetValue(s).unit);
  const counts = {};
  for (const u of units) counts[u] = (counts[u] || 0) + 1;
  let best = "px";
  let max = 0;
  for (const [u, c] of Object.entries(counts)) {
    if (c > max) { max = c; best = u; }
  }
  return best;
}

const PositionEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const [offsetUnit, setOffsetUnit] = useState("px");

  // Sync unit from element styles when selection changes
  useEffect(() => {
    if (!selectedElement) return;
    const s = selectedElement.styles || {};
    setOffsetUnit(detectOffsetUnit([s.top, s.right, s.bottom, s.left]));
  }, [selectedElement]);

  if (!selectedElement) return null;

  // Read directly from live selectedElement — no local state needed
  const s = selectedElement.styles || {};
  const position = s.position || "static";
  const top = parseOffsetValue(s.top).value;
  const right = parseOffsetValue(s.right).value;
  const bottom = parseOffsetValue(s.bottom).value;
  const left = parseOffsetValue(s.left).value;
  const zIndex = s.zIndex !== undefined && s.zIndex !== "" ? String(s.zIndex) : "";

  const handlePositionChange = (value) => {
    const updates = { position: value };
    if (value === "static") {
      updates.top = "";
      updates.right = "";
      updates.bottom = "";
      updates.left = "";
    }
    updateStyles(selectedElement.id, updates);
  };

  const handleOffsetChange = (prop, value) => {
    updateStyles(selectedElement.id, { [prop]: value !== "" ? value + offsetUnit : "" });
  };

  const handleOffsetUnitChange = (e) => {
    const newUnit = e.target.value;
    setOffsetUnit(newUnit);
    // Re-apply all four offsets with the new unit
    const updates = {};
    for (const [prop, val] of [["top", top], ["right", right], ["bottom", bottom], ["left", left]]) {
      updates[prop] = val !== "" ? `${val}${newUnit}` : "";
    }
    updateStyles(selectedElement.id, updates);
  };

  const handleZIndexChange = (value) => {
    updateStyles(selectedElement.id, { zIndex: value === "" ? "" : Number(value) });
  };

  const showOffsets = position !== "static";

  return (
    <div className="position-editor">
      <div className="editor-group">
        <label>Position</label>
        <select value={position} onChange={(e) => handlePositionChange(e.target.value)}>
          <option value="static">Static</option>
          <option value="relative">Relative</option>
          <option value="absolute">Absolute</option>
          <option value="fixed">Fixed</option>
          <option value="sticky">Sticky</option>
        </select>
      </div>

      {showOffsets && (
        <>
          <div className="position-offset-unit">
            <label>Offset Unit</label>
            <select value={offsetUnit} onChange={handleOffsetUnitChange}>
              {OFFSET_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="position-offsets">
            <div className="position-field">
              <label>Top</label>
              <input type="number" value={top} placeholder="auto" onChange={(e) => handleOffsetChange("top", e.target.value)} />
            </div>
            <div className="position-field">
              <label>Right</label>
              <input type="number" value={right} placeholder="auto" onChange={(e) => handleOffsetChange("right", e.target.value)} />
            </div>
            <div className="position-field">
              <label>Bottom</label>
              <input type="number" value={bottom} placeholder="auto" onChange={(e) => handleOffsetChange("bottom", e.target.value)} />
            </div>
            <div className="position-field">
              <label>Left</label>
              <input type="number" value={left} placeholder="auto" onChange={(e) => handleOffsetChange("left", e.target.value)} />
            </div>
          </div>
        </>
      )}

      <div className="editor-group">
        <label>Z-Index</label>
        <input type="number" value={zIndex} placeholder="auto" onChange={(e) => handleZIndexChange(e.target.value)} />
      </div>
    </div>
  );
};

export default PositionEditor;
