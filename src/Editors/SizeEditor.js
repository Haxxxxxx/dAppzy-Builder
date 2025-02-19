import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/SizeEditor.css";

// Parses a dimension string (e.g. "300px" => { value: "300", unit: "px" }, "auto", "none", etc.)
function parseDimension(dim) {
  if (!dim || dim === "auto" || dim === "none") {
    return { value: "", unit: dim };
  }
  const match = dim.match(/^([\d.]+)([a-z%]+)$/i);
  if (match) {
    return { value: match[1], unit: match[2] };
  }
  return { value: parseFloat(dim) || "", unit: "px" };
}

// Builds the final dimension string from value + unit
function buildDimension(value, unit) {
  if (unit === "auto" || unit === "none") return unit;
  if (value === "") return "";
  return value + unit;
}

const SizeEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [width, setWidth] = useState({ value: "", unit: "px" });
  const [height, setHeight] = useState({ value: "", unit: "px" });

  const [minWidth, setMinWidth] = useState({ value: "", unit: "px" });
  const [minHeight, setMinHeight] = useState({ value: "", unit: "px" });

  const [maxWidth, setMaxWidth] = useState({ value: "", unit: "none" });
  const [maxHeight, setMaxHeight] = useState({ value: "", unit: "none" });

  // Overflow: "visible" or "hidden"
  const [overflow, setOverflow] = useState("visible");

  useEffect(() => {
    if (!selectedElement) return;
    const element = document.getElementById(selectedElement.id);
    if (!element) return;

    const cs = getComputedStyle(element);

    // Parse existing widths/heights
    setWidth(parseDimension(cs.width));
    setHeight(parseDimension(cs.height));

    setMinWidth(parseDimension(cs.minWidth));
    setMinHeight(parseDimension(cs.minHeight));

    setMaxWidth(parseDimension(cs.maxWidth));
    setMaxHeight(parseDimension(cs.maxHeight));

    // Overflow
    setOverflow(cs.overflow || "visible");
  }, [selectedElement]);

  if (!selectedElement) return null;
  const { id } = selectedElement;

  // Unit options: px, %, em, etc.
  const unitOptions = ["px", "%", "em", "rem", "vw", "vh", "auto", "none"];

  // Handlers for width
  const handleWidthValueChange = (e) => {
    const newVal = e.target.value;
    setWidth((prev) => ({ ...prev, value: newVal }));
    updateStyles(id, { width: buildDimension(newVal, width.unit) });
  };
  const handleWidthUnitChange = (e) => {
    const newUnit = e.target.value;
    setWidth((prev) => ({ ...prev, unit: newUnit }));
    updateStyles(id, { width: buildDimension(width.value, newUnit) });
  };

  // Handlers for height
  const handleHeightValueChange = (e) => {
    const newVal = e.target.value;
    setHeight((prev) => ({ ...prev, value: newVal }));
    updateStyles(id, { height: buildDimension(newVal, height.unit) });
  };
  const handleHeightUnitChange = (e) => {
    const newUnit = e.target.value;
    setHeight((prev) => ({ ...prev, unit: newUnit }));
    updateStyles(id, { height: buildDimension(height.value, newUnit) });
  };

  // Handlers for minWidth
  const handleMinWidthValueChange = (e) => {
    const newVal = e.target.value;
    setMinWidth((prev) => ({ ...prev, value: newVal }));
    updateStyles(id, { minWidth: buildDimension(newVal, minWidth.unit) });
  };
  const handleMinWidthUnitChange = (e) => {
    const newUnit = e.target.value;
    setMinWidth((prev) => ({ ...prev, unit: newUnit }));
    updateStyles(id, { minWidth: buildDimension(minWidth.value, newUnit) });
  };

  // Handlers for minHeight
  const handleMinHeightValueChange = (e) => {
    const newVal = e.target.value;
    setMinHeight((prev) => ({ ...prev, value: newVal }));
    updateStyles(id, { minHeight: buildDimension(newVal, minHeight.unit) });
  };
  const handleMinHeightUnitChange = (e) => {
    const newUnit = e.target.value;
    setMinHeight((prev) => ({ ...prev, unit: newUnit }));
    updateStyles(id, { minHeight: buildDimension(minHeight.value, newUnit) });
  };

  // Handlers for maxWidth
  const handleMaxWidthValueChange = (e) => {
    const newVal = e.target.value;
    setMaxWidth((prev) => ({ ...prev, value: newVal }));
    updateStyles(id, { maxWidth: buildDimension(newVal, maxWidth.unit) });
  };
  const handleMaxWidthUnitChange = (e) => {
    const newUnit = e.target.value;
    setMaxWidth((prev) => ({ ...prev, unit: newUnit }));
    updateStyles(id, { maxWidth: buildDimension(maxWidth.value, newUnit) });
  };

  // Handlers for maxHeight
  const handleMaxHeightValueChange = (e) => {
    const newVal = e.target.value;
    setMaxHeight((prev) => ({ ...prev, value: newVal }));
    updateStyles(id, { maxHeight: buildDimension(newVal, maxHeight.unit) });
  };
  const handleMaxHeightUnitChange = (e) => {
    const newUnit = e.target.value;
    setMaxHeight((prev) => ({ ...prev, unit: newUnit }));
    updateStyles(id, { maxHeight: buildDimension(maxHeight.value, newUnit) });
  };

  // Overflow: two separate buttons for visible vs hidden
  const setOverflowVisible = () => {
    setOverflow("visible");
    updateStyles(id, { overflow: "visible" });
  };
  const setOverflowHidden = () => {
    setOverflow("hidden");
    updateStyles(id, { overflow: "hidden" });
  };

  return (
    <div className="size-editor">
      {/* Row 1: Width / Height */}
      <div className="size-row">
        {/* Width */}
        <div className="editor-group">
          <label>Width</label>
          <div className="size-input-group">
            <input
              type="number"
              value={width.value}
              onChange={handleWidthValueChange}
              placeholder="0"
              className="size-input"
              disabled={width.unit === "auto" || width.unit === "none"}
            />
            <select
              value={width.unit}
              onChange={handleWidthUnitChange}
              className="unit-select"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Height */}
        <div className="editor-group">
          <label>Height</label>
          <div className="size-input-group">
            <input
              type="number"
              value={height.value}
              onChange={handleHeightValueChange}
              placeholder="0"
              className="size-input"
              disabled={height.unit === "auto" || height.unit === "none"}
            />
            <select
              value={height.unit}
              onChange={handleHeightUnitChange}
              className="unit-select"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 2: Min Width / Min Height */}
      <div className="size-row">
        {/* Min Width */}
        <div className="editor-group">
          <label>Min Width</label>
          <div className="size-input-group">
            <input
              type="number"
              value={minWidth.value}
              onChange={handleMinWidthValueChange}
              placeholder="0"
              className="size-input"
              disabled={minWidth.unit === "auto" || minWidth.unit === "none"}
            />
            <select
              value={minWidth.unit}
              onChange={handleMinWidthUnitChange}
              className="unit-select"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Min Height */}
        <div className="editor-group">
          <label>Min Height</label>
          <div className="size-input-group">
            <input
              type="number"
              value={minHeight.value}
              onChange={handleMinHeightValueChange}
              placeholder="0"
              className="size-input"
              disabled={minHeight.unit === "auto" || minHeight.unit === "none"}
            />
            <select
              value={minHeight.unit}
              onChange={handleMinHeightUnitChange}
              className="unit-select"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Max Width / Max Height */}
      <div className="size-row">
        {/* Max Width */}
        <div className="editor-group">
          <label>Max Width</label>
          <div className="size-input-group">
            <input
              type="number"
              value={maxWidth.value}
              onChange={handleMaxWidthValueChange}
              placeholder="none"
              className="size-input"
              disabled={maxWidth.unit === "auto" || maxWidth.unit === "none"}
            />
            <select
              value={maxWidth.unit}
              onChange={handleMaxWidthUnitChange}
              className="unit-select"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Max Height */}
        <div className="editor-group">
          <label>Max Height</label>
          <div className="size-input-group">
            <input
              type="number"
              value={maxHeight.value}
              onChange={handleMaxHeightValueChange}
              placeholder="none"
              className="size-input"
              disabled={maxHeight.unit === "auto" || maxHeight.unit === "none"}
            />
            <select
              value={maxHeight.unit}
              onChange={handleMaxHeightUnitChange}
              className="unit-select"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 4: Overflow - 2 Buttons for Visible / Hidden */}
      <div className="size-row overflow-row">
        <label>Overflow</label>
        <div className="overflow-buttons">
          <button
            className={`overflow-btn ${overflow === "visible" ? "active" : ""}`}
            onClick={setOverflowVisible}
          >
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button
            className={`overflow-btn ${overflow === "hidden" ? "active" : ""}`}
            onClick={setOverflowHidden}
          >
            <span className="material-symbols-outlined">visibility_off</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeEditor;
