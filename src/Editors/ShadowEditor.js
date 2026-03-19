import React, { useContext } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/ShadowEditor.css";

const DEFAULT_SHADOW = { x: 0, y: 0, blur: 0, spread: 0, color: "#000000", inset: false };

function parseSingleShadow(shadowStr) {
  if (!shadowStr || shadowStr === "none") {
    return { ...DEFAULT_SHADOW };
  }
  const trimmed = shadowStr.trim();
  const inset = trimmed.includes("inset");
  const cleaned = trimmed.replace("inset", "").trim();
  // Extract color (hex, rgb, rgba)
  const colorMatch = cleaned.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/);
  const color = colorMatch ? colorMatch[0] : "#000000";
  const withoutColor = cleaned.replace(color, "").trim();
  const parts = withoutColor.split(/\s+/).map(parseFloat).filter((n) => !isNaN(n));
  return {
    x: parts[0] || 0,
    y: parts[1] || 0,
    blur: parts[2] || 0,
    spread: parts[3] || 0,
    color,
    inset,
  };
}

/**
 * Split a box-shadow string on commas, but not inside rgb()/rgba() parens.
 */
function splitShadows(str) {
  if (!str || str === "none") return [];
  const results = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      results.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) results.push(current.trim());
  return results;
}

function parseShadows(shadowStr) {
  const parts = splitShadows(shadowStr);
  if (parts.length === 0) return [{ ...DEFAULT_SHADOW }];
  return parts.map(parseSingleShadow);
}

function buildSingleShadow(s) {
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
}

function buildShadows(shadows) {
  if (!shadows || shadows.length === 0) return "none";
  return shadows.map(buildSingleShadow).join(", ");
}

const ShadowEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  if (!selectedElement) return null;

  // Read directly from live selectedElement — no local state needed
  const s = selectedElement.styles || {};
  const shadows = parseShadows(s.boxShadow);

  const updateShadow = (index, key, value) => {
    const next = shadows.map((sh, i) => (i === index ? { ...sh, [key]: value } : sh));
    updateStyles(selectedElement.id, { boxShadow: buildShadows(next) });
  };

  const addShadow = () => {
    const next = [...shadows, { ...DEFAULT_SHADOW }];
    updateStyles(selectedElement.id, { boxShadow: buildShadows(next) });
  };

  const removeShadow = (index) => {
    const next = shadows.filter((_, i) => i !== index);
    updateStyles(selectedElement.id, { boxShadow: buildShadows(next) });
  };

  const clearShadow = () => {
    updateStyles(selectedElement.id, { boxShadow: "none" });
  };

  // Build the combined box-shadow string for the preview
  const previewShadow = buildShadows(shadows);

  return (
    <div className="shadow-editor">
      <div className="shadow-preview-wrapper">
        <div
          className="shadow-preview-box"
          style={{ boxShadow: previewShadow }}
        />
      </div>
      {shadows.map((shadow, idx) => (
        <div className="shadow-layer" key={idx}>
          {shadows.length > 1 && (
            <div className="shadow-layer-header">
              <span className="shadow-layer-label">Shadow {idx + 1}</span>
              <button
                className="shadow-layer-remove"
                onClick={() => removeShadow(idx)}
                title="Remove shadow"
              >
                &times;
              </button>
            </div>
          )}
          <div className="shadow-grid">
            <div className="shadow-field">
              <label>X</label>
              <input type="number" value={shadow.x} onChange={(e) => updateShadow(idx, "x", Number(e.target.value))} />
            </div>
            <div className="shadow-field">
              <label>Y</label>
              <input type="number" value={shadow.y} onChange={(e) => updateShadow(idx, "y", Number(e.target.value))} />
            </div>
            <div className="shadow-field">
              <label>Blur</label>
              <input type="number" min="0" value={shadow.blur} onChange={(e) => updateShadow(idx, "blur", Number(e.target.value))} />
            </div>
            <div className="shadow-field">
              <label>Spread</label>
              <input type="number" value={shadow.spread} onChange={(e) => updateShadow(idx, "spread", Number(e.target.value))} />
            </div>
          </div>
          <div className="shadow-color-row">
            <input type="color" value={shadow.color.startsWith("#") ? shadow.color : "#000000"} onChange={(e) => updateShadow(idx, "color", e.target.value)} />
            <input type="text" value={shadow.color} readOnly className="color-hex" />
            <button className={shadow.inset ? "active" : ""} onClick={() => updateShadow(idx, "inset", !shadow.inset)} title="Inset shadow">
              Inset
            </button>
          </div>
        </div>
      ))}
      <button className="shadow-add" onClick={addShadow}>+ Add Shadow</button>
      <button className="shadow-clear" onClick={clearShadow}>Clear All Shadows</button>
    </div>
  );
};

export default ShadowEditor;
