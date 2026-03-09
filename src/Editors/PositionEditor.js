import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/PositionEditor.css";

const PositionEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [position, setPosition] = useState("static");
  const [top, setTop] = useState("");
  const [right, setRight] = useState("");
  const [bottom, setBottom] = useState("");
  const [left, setLeft] = useState("");
  const [zIndex, setZIndex] = useState("");

  useEffect(() => {
    if (selectedElement) {
      const s = selectedElement.styles || {};
      setPosition(s.position || "static");
      setTop(s.top || "");
      setRight(s.right || "");
      setBottom(s.bottom || "");
      setLeft(s.left || "");
      setZIndex(s.zIndex !== undefined ? String(s.zIndex) : "");
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handlePositionChange = (value) => {
    setPosition(value);
    const updates = { position: value };
    if (value === "static") {
      updates.top = "";
      updates.right = "";
      updates.bottom = "";
      updates.left = "";
      setTop("");
      setRight("");
      setBottom("");
      setLeft("");
    }
    updateStyles(selectedElement.id, updates);
  };

  const handleOffsetChange = (prop, value, setter) => {
    setter(value);
    updateStyles(selectedElement.id, { [prop]: value ? value + "px" : "" });
  };

  const handleZIndexChange = (value) => {
    setZIndex(value);
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
        <div className="position-offsets">
          <div className="position-field">
            <label>Top</label>
            <input type="number" value={top} placeholder="auto" onChange={(e) => handleOffsetChange("top", e.target.value, setTop)} />
          </div>
          <div className="position-field">
            <label>Right</label>
            <input type="number" value={right} placeholder="auto" onChange={(e) => handleOffsetChange("right", e.target.value, setRight)} />
          </div>
          <div className="position-field">
            <label>Bottom</label>
            <input type="number" value={bottom} placeholder="auto" onChange={(e) => handleOffsetChange("bottom", e.target.value, setBottom)} />
          </div>
          <div className="position-field">
            <label>Left</label>
            <input type="number" value={left} placeholder="auto" onChange={(e) => handleOffsetChange("left", e.target.value, setLeft)} />
          </div>
        </div>
      )}

      <div className="editor-group">
        <label>Z-Index</label>
        <input type="number" value={zIndex} placeholder="auto" onChange={(e) => handleZIndexChange(e.target.value)} />
      </div>
    </div>
  );
};

export default PositionEditor;
