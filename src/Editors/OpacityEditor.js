import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import { useDebouncedStyle } from "./useDebouncedStyle";
import "./css/OpacityEditor.css";

const OpacityEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const debouncedUpdate = useDebouncedStyle(updateStyles);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (selectedElement) {
      const val = selectedElement.styles?.opacity;
      setOpacity(val !== undefined ? Number(val) : 1);
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleChange = (value) => {
    const clamped = Math.min(1, Math.max(0, Number(value)));
    setOpacity(clamped);
    debouncedUpdate(selectedElement.id, { opacity: clamped });
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
