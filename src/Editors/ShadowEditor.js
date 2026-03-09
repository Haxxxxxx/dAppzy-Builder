import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import { useDebouncedStyle } from "./useDebouncedStyle";
import "./css/ShadowEditor.css";

function parseShadow(shadowStr) {
  if (!shadowStr || shadowStr === "none") {
    return { x: 0, y: 0, blur: 0, spread: 0, color: "#000000", inset: false };
  }
  const inset = shadowStr.includes("inset");
  const cleaned = shadowStr.replace("inset", "").trim();
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

const ShadowEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const debouncedUpdate = useDebouncedStyle(updateStyles);
  const [shadow, setShadow] = useState({ x: 0, y: 0, blur: 4, spread: 0, color: "#000000", inset: false });

  useEffect(() => {
    if (selectedElement) {
      const styles = selectedElement.styles || {};
      setShadow(parseShadow(styles.boxShadow));
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const update = (key, value) => {
    const next = { ...shadow, [key]: value };
    setShadow(next);
    const str = `${next.inset ? "inset " : ""}${next.x}px ${next.y}px ${next.blur}px ${next.spread}px ${next.color}`;
    debouncedUpdate(selectedElement.id, { boxShadow: str });
  };

  const clearShadow = () => {
    setShadow({ x: 0, y: 0, blur: 0, spread: 0, color: "#000000", inset: false });
    updateStyles(selectedElement.id, { boxShadow: "none" });
  };

  return (
    <div className="shadow-editor">
      <div className="shadow-grid">
        <div className="shadow-field">
          <label>X</label>
          <input type="number" value={shadow.x} onChange={(e) => update("x", Number(e.target.value))} />
        </div>
        <div className="shadow-field">
          <label>Y</label>
          <input type="number" value={shadow.y} onChange={(e) => update("y", Number(e.target.value))} />
        </div>
        <div className="shadow-field">
          <label>Blur</label>
          <input type="number" min="0" value={shadow.blur} onChange={(e) => update("blur", Number(e.target.value))} />
        </div>
        <div className="shadow-field">
          <label>Spread</label>
          <input type="number" value={shadow.spread} onChange={(e) => update("spread", Number(e.target.value))} />
        </div>
      </div>
      <div className="shadow-color-row">
        <input type="color" value={shadow.color.startsWith("#") ? shadow.color : "#000000"} onChange={(e) => update("color", e.target.value)} />
        <input type="text" value={shadow.color} readOnly className="color-hex" />
        <button className={shadow.inset ? "active" : ""} onClick={() => update("inset", !shadow.inset)} title="Inset shadow">
          Inset
        </button>
      </div>
      <button className="shadow-clear" onClick={clearShadow}>Clear Shadow</button>
    </div>
  );
};

export default ShadowEditor;
