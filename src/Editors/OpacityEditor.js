import React, { useContext } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/OpacityEditor.css";

const OpacityEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  if (!selectedElement) return null;

  // Read directly from live selectedElement — no local state needed
  const s = selectedElement.styles || {};
  const opacity = s.opacity !== undefined ? Number(s.opacity) : 1;

  const handleChange = (value) => {
    const clamped = Math.min(1, Math.max(0, Number(value)));
    updateStyles(selectedElement.id, { opacity: clamped });
  };

  return (
    <div className="opacity-editor">
      <div className="opacity-row">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(e) => handleChange(e.target.value)}
          className="opacity-slider"
        />
        <span className="opacity-value">{Math.round(opacity * 100)}%</span>
      </div>
    </div>
  );
};

export default OpacityEditor;
