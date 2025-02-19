import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/TypographyEditor.css";

const TypographyEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  // Utility: Convert "rgb(r,g,b)" to "#rrggbb"
  function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g).map(Number);
    return `#${result.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  }

  // Utility: Convert any CSS font size (px, rem, em, vw, vh) to px
  function convertToPx(element, fontSizeStr) {
    if (fontSizeStr.endsWith("px")) {
      return parseFloat(fontSizeStr);
    } else if (fontSizeStr.endsWith("rem")) {
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      return parseFloat(fontSizeStr) * rootFontSize;
    } else if (fontSizeStr.endsWith("em")) {
      const parentFontSize = parseFloat(
        getComputedStyle(element.parentElement || document.documentElement)
          .fontSize
      );
      return parseFloat(fontSizeStr) * parentFontSize;
    } else if (fontSizeStr.endsWith("vw")) {
      const vw = window.innerWidth / 100;
      return parseFloat(fontSizeStr) * vw;
    } else if (fontSizeStr.endsWith("vh")) {
      const vh = window.innerHeight / 100;
      return parseFloat(fontSizeStr) * vh;
    }
    // Default fallback
    return parseFloat(fontSizeStr) || 16;
  }

  // Local state for the typography controls
  const [styles, setStyles] = useState({
    fontSize: "",
    fontFamily: "Arial",
    fontWeight: "normal",
    color: "#217BF4",
    textAlign: "left",
    textDecoration: "none",
  });

  // When a new element is selected, read its computed styles into local state
  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);
        const pixelFontSize = convertToPx(element, computedStyles.fontSize);
        const hexColor = rgbToHex(computedStyles.color);

        setStyles({
          fontSize: pixelFontSize,
          fontFamily: computedStyles.fontFamily || "Arial",
          fontWeight: computedStyles.fontWeight || "normal",
          color: hexColor || "#217BF4",
          textAlign: computedStyles.textAlign || "left",
          textDecoration: computedStyles.textDecoration || "none",
        });
      }
    }
  }, [selectedElement]);

  // Update both local state and the global context
  const handleStyleChange = (styleKey, value) => {
    setStyles((prev) => ({ ...prev, [styleKey]: value }));
    updateStyles(selectedElement.id, { [styleKey]: value });
  };

  if (!selectedElement) return null;

  return (
    <div className="typography-editor">
      {/* Font Family */}
      <div className="editor-group">
        <label>Font Family</label>
        <select
          value={styles.fontFamily}
          onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>

      {/* Font Weight + Size */}
      <div className="editor-regroup">
        <div className="editor-group">
          <label>Weight</label>
          <select
            value={styles.fontWeight}
            onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Lighter</option>
            <option value="bolder">Bolder</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Extra Bold (700)</option>
          </select>
        </div>

        <div className="editor-group">
          <label>Size</label>
          <input
            className="size-input"
            type="number"
            value={styles.fontSize !== "" ? parseFloat(styles.fontSize) : ""}
            onChange={(e) => handleStyleChange("fontSize", e.target.value + "px")}
          />
        </div>
      </div>

      {/* Color Picker + Hex Value in ONE input bar */}
      <div className="editor-group">
        <label>Color</label>
        <div className="color-group-combined">
          <input
            type="color"
            value={styles.color}
            onChange={(e) => handleStyleChange("color", e.target.value)}
          />
          <input
            type="text"
            value={styles.color}
            readOnly
            className="color-hex"
          />
        </div>
      </div>

      {/* Text Decoration */}
      <div className="editor-group">
        <label>Text Decoration</label>
        <div className="text-decoration-group">
          <button
            className={styles.textDecoration === "italic" ? "active" : ""}
            onClick={() => handleStyleChange("textDecoration", "italic")}
          >
            <span className="material-symbols-outlined">format_italic</span>
          </button>
          <hr className="custom-rule" />

          <button
            className={styles.textDecoration === "underline" ? "active" : ""}
            onClick={() => handleStyleChange("textDecoration", "underline")}
          >
            <span className="material-symbols-outlined">format_underlined</span>
          </button>
          <hr className="custom-rule" />

          <button
            className={styles.textDecoration === "line-through" ? "active" : ""}
            onClick={() => handleStyleChange("textDecoration", "line-through")}
          >
            <span className="material-symbols-outlined">strikethrough_s</span>
          </button>
          <hr className="custom-rule" />

          <button
            className={styles.textDecoration === "none" ? "active" : ""}
            onClick={() => handleStyleChange("textDecoration", "none")}
          >
            <span className="material-symbols-outlined">format_clear</span>
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="editor-group">
        <label>Text Align</label>
        <div className="text-align-group">
          <button
            className={styles.textAlign === "left" ? "active" : ""}
            onClick={() => handleStyleChange("textAlign", "left")}
          >
            <span className="material-symbols-outlined">format_align_left</span>
          </button>
          <hr className="custom-rule" />

          <button
            className={styles.textAlign === "center" ? "active" : ""}
            onClick={() => handleStyleChange("textAlign", "center")}
          >
            <span className="material-symbols-outlined">format_align_center</span>
          </button>
          <hr className="custom-rule" />

          <button
            className={styles.textAlign === "right" ? "active" : ""}
            onClick={() => handleStyleChange("textAlign", "right")}
          >
            <span className="material-symbols-outlined">format_align_right</span>
          </button>
          <hr className="custom-rule" />

          <button
            className={styles.textAlign === "justify" ? "active" : ""}
            onClick={() => handleStyleChange("textAlign", "justify")}
          >
            <span className="material-symbols-outlined">format_align_justify</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypographyEditor;
