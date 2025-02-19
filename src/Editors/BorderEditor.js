import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/BorderEditor.css";

const BorderEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Local states for border radius (universal) plus 
  // width, style, color that can unify multiple sides
  const [borderRadius, setBorderRadius] = useState("");
  const [borderWidth, setBorderWidth] = useState("");   // string or ""
  const [borderStyle, setBorderStyle] = useState("");   // e.g. "solid", "none", or ""
  const [borderColor, setBorderColor] = useState("");   // e.g. "#217BF4", or ""

  // Which sides are active: "all", "top", "right", "bottom", "left"
  const [activeSides, setActiveSides] = useState(["all"]);

  // This function strips alpha from an 8-digit hex if your browser color input rejects it
  function sanitizeHexColor(color) {
    if (/^#[0-9A-Fa-f]{8}$/.test(color)) {
      return color.slice(0, 7); // remove alpha channel
    }
    return color;
  }

  // For each side, we store the style keys:
  // - borderTopWidth, borderTopStyle, borderTopColor
  // - borderRightWidth, ...
  // etc.

  useEffect(() => {
    if (!selectedElement) return;

    const element = elements.find((el) => el.id === selectedElement.id);
    if (!element) return;

    // Read element styles or fallback to default
    const {
      borderRadius = "0px",
      // global
      borderWidth: globalWidth = "0px",
      borderStyle: globalStyle = "none",
      borderColor: globalColor = "#000000",

      // side widths
      borderTopWidth = "0px",
      borderRightWidth = "0px",
      borderBottomWidth = "0px",
      borderLeftWidth = "0px",

      // side styles
      borderTopStyle = "none",
      borderRightStyle = "none",
      borderBottomStyle = "none",
      borderLeftStyle = "none",

      // side colors
      borderTopColor = "#000000",
      borderRightColor = "#000000",
      borderBottomColor = "#000000",
      borderLeftColor = "#000000",
    } = element.styles || {};

    // 1) Border Radius: always universal
    setBorderRadius(borderRadius.replace("px", ""));

    // Gather arrays for width, style, color across active sides
    const sidesWithoutAll = activeSides.filter((s) => s !== "all");

    function getSideWidth(side) {
      switch (side) {
        case "top": return borderTopWidth;
        case "right": return borderRightWidth;
        case "bottom": return borderBottomWidth;
        case "left": return borderLeftWidth;
        default: return globalWidth;
      }
    }
    function getSideStyle(side) {
      switch (side) {
        case "top": return borderTopStyle;
        case "right": return borderRightStyle;
        case "bottom": return borderBottomStyle;
        case "left": return borderLeftStyle;
        default: return globalStyle;
      }
    }
    function getSideColor(side) {
      switch (side) {
        case "top": return borderTopColor;
        case "right": return borderRightColor;
        case "bottom": return borderBottomColor;
        case "left": return borderLeftColor;
        default: return globalColor;
      }
    }

    // If "all" is active, we read global properties
    if (activeSides.includes("all")) {
      setBorderWidth(globalWidth.replace("px", ""));
      setBorderStyle(globalStyle);
      setBorderColor(globalColor);
    } else if (sidesWithoutAll.length > 0) {
      // We have 1-4 sides (but not "all").
      // Gather each side's value, see if they match.

      // --- A) Width ---
      const widths = sidesWithoutAll.map(side => getSideWidth(side).replace("px", ""));
      const allWidthsSame = widths.every(w => w === widths[0]);
      setBorderWidth(allWidthsSame ? widths[0] : ""); // blank => "mixed"

      // --- B) Style ---
      const styles = sidesWithoutAll.map(side => getSideStyle(side));
      const allStylesSame = styles.every(s => s === styles[0]);
      setBorderStyle(allStylesSame ? styles[0] : "");

      // --- C) Color ---
      const colors = sidesWithoutAll.map(side => getSideColor(side));
      const allColorsSame = colors.every(c => c === colors[0]);
      setBorderColor(allColorsSame ? colors[0] : "#000000");
      // or setBorderColor(allColorsSame ? colors[0] : "") to show "MIXED"
    } else {
      // no sides selected => everything blank or zero
      setBorderWidth("0");
      setBorderStyle("none");
      setBorderColor("#000000");
    }
  }, [selectedElement, elements, activeSides]);

  // Quick exit if no element
  if (!selectedElement) return null;
  const { id } = selectedElement;

  /* 
     This function applies the style to every side in activeSides. 
     If "all" is active, we set the global style instead.
  */
  function applyBorderToSides(styleKey, value) {
    if (activeSides.includes("all")) {
      // Just set the global property
      updateStyles(id, { [styleKey]: value });
      return;
    }

    // Otherwise, build an updates object for each side
    const updates = {};
    const sidesWithoutAll = activeSides.filter((s) => s !== "all");

    sidesWithoutAll.forEach(side => {
      switch (side) {
        case "top":
          if (styleKey === "borderWidth") updates.borderTopWidth = value;
          if (styleKey === "borderStyle") updates.borderTopStyle = value;
          if (styleKey === "borderColor") updates.borderTopColor = value;
          break;
        case "right":
          if (styleKey === "borderWidth") updates.borderRightWidth = value;
          if (styleKey === "borderStyle") updates.borderRightStyle = value;
          if (styleKey === "borderColor") updates.borderRightColor = value;
          break;
        case "bottom":
          if (styleKey === "borderWidth") updates.borderBottomWidth = value;
          if (styleKey === "borderStyle") updates.borderBottomStyle = value;
          if (styleKey === "borderColor") updates.borderBottomColor = value;
          break;
        case "left":
          if (styleKey === "borderWidth") updates.borderLeftWidth = value;
          if (styleKey === "borderStyle") updates.borderLeftStyle = value;
          if (styleKey === "borderColor") updates.borderLeftColor = value;
          break;
        default:
        // do nothing
      }
    });

    updateStyles(id, updates);
  }

  // --------------- EVENT HANDLERS ---------------
  const handleBorderRadiusChange = (e) => {
    const val = e.target.value;
    setBorderRadius(val);
    updateStyles(id, { borderRadius: val + "px" });
  };

  const handleBorderWidthChange = (e) => {
    const newVal = e.target.value;
    setBorderWidth(newVal);
    applyBorderToSides("borderWidth", newVal + "px");
  };

  const handleBorderStyleChange = (e) => {
    const newStyle = e.target.value;
    setBorderStyle(newStyle);
    applyBorderToSides("borderStyle", newStyle);
  };

  const handleBorderColorChange = (e) => {
    let newColor = sanitizeHexColor(e.target.value);
    setBorderColor(newColor);
    applyBorderToSides("borderColor", newColor);
  };

  // A helper to clear all border props, both global and side-specific
  const handleResetBorders = () => {
    if (!selectedElement) return;

    const { id } = selectedElement;

    // Provide any “clean slate” defaults you prefer:
    // If you have no radius changes, you can omit it.
    updateStyles(id, {
      // Global properties:
      borderWidth: "0px",
      borderStyle: "none",
      borderColor: "#000000",

      // Side-specific widths:
      borderTopWidth: "0px",
      borderRightWidth: "0px",
      borderBottomWidth: "0px",
      borderLeftWidth: "0px",

      // Side-specific styles:
      borderTopStyle: "none",
      borderRightStyle: "none",
      borderBottomStyle: "none",
      borderLeftStyle: "none",

      // Side-specific colors:
      borderTopColor: "#000000",
      borderRightColor: "#000000",
      borderBottomColor: "#000000",
      borderLeftColor: "#000000",

      // If you have other properties like “borderRadius,” you can reset them too:
      borderRadius: "0px"
    });

    // Also reset local states if you like:
    setBorderWidth("");
    setBorderStyle("none");
    setBorderColor("#000000");
    setBorderRadius("");

    // Optionally reset activeSides to ["all"] or []
    setActiveSides(["all"]);
  };


  // Toggle a side in the `activeSides` array
  function toggleSide(side) {
    if (side === "all") {
      if (activeSides.includes("all")) {
        setActiveSides([]);
      } else {
        setActiveSides(["all"]);
      }
      return;
    }
    // remove "all" if present
    const sidesWithoutAll = activeSides.filter((s) => s !== "all");
    if (sidesWithoutAll.includes(side)) {
      // already active => turn it off
      setActiveSides(sidesWithoutAll.filter((s) => s !== side));
    } else {
      // turn it on
      setActiveSides([...sidesWithoutAll, side]);
    }
  }

  function isActive(side) {
    return activeSides.includes(side);
  }

  // --------------- RENDER ---------------
  return (
    <div className="border-editor">
      {/* RADIUS SECTION */}
      <div className="border-radius-section">
        <label>Radius</label>
        <div className="input-with-suffix">
          <input
            type="number"
            value={borderRadius}
            onChange={handleBorderRadiusChange}
          />
          <span className="suffix">PX</span>
        </div>
      </div>

      {/* BORDERS SECTION */}
      <div className="borders-section">
        <div className="border-sides-selection">
          <label>Borders</label>
          <div className="border-sides">
            <button
              className={`side-button top ${isActive("top") ? "active" : ""}`}
              title="Top border"
              onClick={() => toggleSide("top")}
            />
            <div className="middle-row">
              <button
                className={`side-button left ${isActive("left") ? "active" : ""}`}
                title="Left border"
                onClick={() => toggleSide("left")}
              />
              <button
                className={`side-button center ${isActive("all") ? "active" : ""}`}
                title="All sides"
                onClick={() => toggleSide("all")}
              />
              <button
                className={`side-button right ${isActive("right") ? "active" : ""}`}
                title="Right border"
                onClick={() => toggleSide("right")}
              />
            </div>
            <button
              className={`side-button bottom ${isActive("bottom") ? "active" : ""}`}
              title="Bottom border"
              onClick={() => toggleSide("bottom")}
            />
          </div>
        </div>

        <div className="border-config-row">
          <div className="border-props">
            {/* Style */}
            <div className="border-style-group">
              <label>Style</label>
              <select
                value={borderStyle}
                onChange={handleBorderStyleChange}
              >
                {/* If blank => "mixed" => user sets new style => unify */}
                <option value="">(Mixed)</option>
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="dotted">Dotted</option>
                <option value="dashed">Dashed</option>
                <option value="double">Double</option>
                <option value="groove">Groove</option>
                <option value="ridge">Ridge</option>
                <option value="inset">Inset</option>
                <option value="outset">Outset</option>
              </select>
            </div>

            {/* Width */}
            <div className="border-width-group">
              <label>Width</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min="0"
                  value={borderWidth}
                  onChange={handleBorderWidthChange}
                />
                <span className="suffix">PX</span>
              </div>
            </div>

            {/* Color */}
            <div className="border-color-group">
              <label>Color</label>
              <div className="color-group">
                <input
                  type="color"
                  value={borderColor}
                  onChange={handleBorderColorChange}
                />
                <input
                  type="text"
                  readOnly
                  value={borderColor}
                  className="color-hex"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* -------------- RESET BUTTON -------------- */}
      <div className="border-actions">
        <button onClick={handleResetBorders}>
          Reset Borders
        </button>
      </div>

    </div>
  );
};

export default BorderEditor;
