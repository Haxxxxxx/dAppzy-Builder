// BorderEditor.js
import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/BorderEditor.css";

const BorderEditor = () => {
  const { selectedElement, updateStyles, elements } = useContext(EditableContext);

  // Local states for border radius plus width, style, and color.
  const [borderRadius, setBorderRadius] = useState("");
  const [borderWidth, setBorderWidth] = useState(""); // stored as a number string (without "px")
  const [borderStyle, setBorderStyle] = useState("");
  const [borderColor, setBorderColor] = useState("");
  
  // Active sides: by default, "all" means the entire element.
  const [activeSides, setActiveSides] = useState(["all"]);

  // Helper: Strip alpha channel if needed.
  function sanitizeHexColor(color) {
    if (/^#[0-9A-Fa-f]{8}$/.test(color)) {
      return color.slice(0, 7);
    }
    return color;
  }

  // On element selection, load existing border styles.
  useEffect(() => {
    if (!selectedElement) return;
    const element = elements.find((el) => el.id === selectedElement.id);
    if (!element) return;
    const {
      borderRadius = "0px",
      // Global properties:
      borderWidth: globalWidth = "0px",
      borderStyle: globalStyle = "none",
      borderColor: globalColor = "#000000",
      // Side-specific properties:
      borderTopWidth = "0px",
      borderRightWidth = "0px",
      borderBottomWidth = "0px",
      borderLeftWidth = "0px",
      borderTopStyle = "none",
      borderRightStyle = "none",
      borderBottomStyle = "none",
      borderLeftStyle = "none",
      borderTopColor = "#000000",
      borderRightColor = "#000000",
      borderBottomColor = "#000000",
      borderLeftColor = "#000000",
    } = element.styles || {};

    // Set border radius (universal)
    setBorderRadius(borderRadius.replace("px", ""));

    // For the "all" case, if no border was applied yet, leave inputs blank.
    if (activeSides.includes("all")) {
      const widthVal = globalWidth.replace("px", "");
      const styleVal = globalStyle;
      // Only update if a border is already applied.
      if (widthVal !== "0" && widthVal !== "") {
        setBorderWidth(widthVal);
        setBorderStyle(styleVal);
        setBorderColor(globalColor);
      } else {
        setBorderWidth("");
        setBorderStyle("");
        setBorderColor("#000000");
      }
    } else {
      // For individual sides, compare values.
      const sidesWithoutAll = activeSides.filter((s) => s !== "all");
      const widths = sidesWithoutAll.map(side => {
        let w = "";
        switch (side) {
          case "top": w = borderTopWidth; break;
          case "right": w = borderRightWidth; break;
          case "bottom": w = borderBottomWidth; break;
          case "left": w = borderLeftWidth; break;
          default: w = globalWidth;
        }
        w = w.replace("px", "");
        return (w === "0" || w === "") ? "1" : w;
      });
      const allWidthsSame = widths.every(w => w === widths[0]);
      setBorderWidth(allWidthsSame ? widths[0] : "");

      const stylesArr = sidesWithoutAll.map(side => {
        switch (side) {
          case "top": return borderTopStyle;
          case "right": return borderRightStyle;
          case "bottom": return borderBottomStyle;
          case "left": return borderLeftStyle;
          default: return globalStyle;
        }
      });
      const allStylesSame = stylesArr.every(s => s === stylesArr[0]);
      setBorderStyle(allStylesSame ? (stylesArr[0] === "none" || stylesArr[0] === "" ? "" : stylesArr[0]) : "");

      const colors = sidesWithoutAll.map(side => {
        switch (side) {
          case "top": return borderTopColor;
          case "right": return borderRightColor;
          case "bottom": return borderBottomColor;
          case "left": return borderLeftColor;
          default: return globalColor;
        }
      });
      const allColorsSame = colors.every(c => c === colors[0]);
      setBorderColor(allColorsSame ? colors[0] : "#000000");
    }
  }, [selectedElement, elements, activeSides]);

  // We do NOT auto-update styles on activeSides change if no value is set.
  useEffect(() => {
    if (!selectedElement) return;
    if (activeSides.includes("all")) {
      if (borderWidth && borderStyle) {
        updateStyles(selectedElement.id, {
          borderWidth: borderWidth + "px",
          borderStyle: borderStyle,
          borderColor: borderColor || "#000000"
        });
      }
    } else {
      if (borderWidth && borderStyle) {
        applyBorderToSides("borderWidth", borderWidth + "px");
        applyBorderToSides("borderStyle", borderStyle);
        applyBorderToSides("borderColor", borderColor || "#000000");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSides]);

  if (!selectedElement) return null;
  const { id } = selectedElement;

  // Applies a style property to all active sides.
  function applyBorderToSides(styleKey, value) {
    if (activeSides.includes("all")) {
      updateStyles(id, { [styleKey]: value });
      return;
    }
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
    let newVal = e.target.value;
    // Only apply default of 1 if user explicitly changes style to "solid".
    if (!newVal && borderStyle === "solid") {
      newVal = "1";
    }
    setBorderWidth(newVal);
    if (newVal) {
      applyBorderToSides("borderWidth", newVal + "px");
    }
  };

  const handleBorderStyleChange = (e) => {
    let newStyle = e.target.value;
    setBorderStyle(newStyle);
    // If the user selects "solid" and no width is set, default to 1px.
    if (newStyle === "solid" && (!borderWidth || borderWidth === "0")) {
      setBorderWidth("1");
      applyBorderToSides("borderWidth", "1px");
    }
    // Only update if a style is selected.
    if (newStyle) {
      applyBorderToSides("borderStyle", newStyle);
    }
  };

  const handleBorderColorChange = (e) => {
    let newColor = sanitizeHexColor(e.target.value);
    setBorderColor(newColor);
    if (newColor) {
      applyBorderToSides("borderColor", newColor);
    }
  };

  // Clear all border properties.
  const handleResetBorders = () => {
    if (!selectedElement) return;
    updateStyles(id, {
      borderWidth: "0px",
      borderStyle: "none",
      borderColor: "#000000",
      borderTopWidth: "0px",
      borderRightWidth: "0px",
      borderBottomWidth: "0px",
      borderLeftWidth: "0px",
      borderTopStyle: "none",
      borderRightStyle: "none",
      borderBottomStyle: "none",
      borderLeftStyle: "none",
      borderTopColor: "#000000",
      borderRightColor: "#000000",
      borderBottomColor: "#000000",
      borderLeftColor: "#000000",
      borderRadius: "0px"
    });
    setBorderWidth("");
    setBorderStyle("none");
    setBorderColor("#000000");
    setBorderRadius("");
    setActiveSides(["all"]);
  };

  // Toggle a side in the activeSides array.
  function toggleSide(side) {
    if (side === "all") {
      if (activeSides.includes("all")) {
        setActiveSides([]);
      } else {
        setActiveSides(["all"]);
      }
      return;
    }
    const sidesWithoutAll = activeSides.filter((s) => s !== "all");
    if (sidesWithoutAll.includes(side)) {
      setActiveSides(sidesWithoutAll.filter((s) => s !== side));
    } else {
      // When adding a new side, apply the current settings to that side.
      setActiveSides([...sidesWithoutAll, side]);
      let width = borderWidth ? borderWidth + "px" : (borderStyle === "solid" ? "1px" : "0px");
      let style = borderStyle || "solid";
      let color = borderColor || "#000000";
      let updateObj = {};
      switch (side) {
        case "top":
          updateObj.borderTopWidth = width;
          updateObj.borderTopStyle = style;
          updateObj.borderTopColor = color;
          break;
        case "right":
          updateObj.borderRightWidth = width;
          updateObj.borderRightStyle = style;
          updateObj.borderRightColor = color;
          break;
        case "bottom":
          updateObj.borderBottomWidth = width;
          updateObj.borderBottomStyle = style;
          updateObj.borderBottomColor = color;
          break;
        case "left":
          updateObj.borderLeftWidth = width;
          updateObj.borderLeftStyle = style;
          updateObj.borderLeftColor = color;
          break;
        default:
      }
      updateStyles(id, updateObj);
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
            min={0}
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
              <select value={borderStyle} onChange={handleBorderStyleChange}>
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
      {/* RESET BUTTON */}
      <div className="border-actions">
        <button onClick={handleResetBorders}>
          Reset Borders
        </button>
      </div>
    </div>
  );
};

export default BorderEditor;
