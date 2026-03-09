import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/TypographyEditor.css";

const TypographyEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  // Utility: Convert "rgb(r,g,b)" to "#rrggbb"
  function rgbToHex(rgb) {
    const matches = rgb.match(/\d+/g);
    if (!matches) return rgb;
    const result = matches.map(Number);
    return `#${result.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  }

  // Utility: Convert any CSS font size (px, rem, em, vw, vh) to px, then round it.
  function convertToPx(element, fontSizeStr) {
    let size;
    if (fontSizeStr.endsWith("px")) {
      size = parseFloat(fontSizeStr);
    } else if (fontSizeStr.endsWith("rem")) {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      size = parseFloat(fontSizeStr) * rootFontSize;
    } else if (fontSizeStr.endsWith("em")) {
      const parentFontSize = parseFloat(getComputedStyle(element.parentElement || document.documentElement).fontSize);
      size = parseFloat(fontSizeStr) * parentFontSize;
    } else if (fontSizeStr.endsWith("vw")) {
      const vw = window.innerWidth / 100;
      size = parseFloat(fontSizeStr) * vw;
    } else if (fontSizeStr.endsWith("vh")) {
      const vh = window.innerHeight / 100;
      size = parseFloat(fontSizeStr) * vh;
    } else {
      size = parseFloat(fontSizeStr) || 16;
    }
    return Math.round(size);
  }

  // Local state for typography controls.
  const [styles, setStyles] = useState({
    fontSize: "",
    fontFamily: "Arial",
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#217BF4",
    textAlign: "left",
    textDecoration: "none",
    lineHeight: "normal",
    letterSpacing: "0px",
    textTransform: "none",
  });

  // When a new element is selected, read its computed styles into local state.
  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);
        const pixelFontSize = convertToPx(element, computedStyles.fontSize);
        const hexColor = rgbToHex(computedStyles.color);
        setStyles({
          fontSize: pixelFontSize + "px",
          fontFamily: computedStyles.fontFamily || "Arial",
          fontWeight: computedStyles.fontWeight || "normal",
          fontStyle: computedStyles.fontStyle || "normal",
          color: hexColor || "#217BF4",
          textAlign: computedStyles.textAlign || "left",
          textDecoration: computedStyles.textDecoration.includes("underline")
            ? "underline"
            : computedStyles.textDecoration.includes("line-through")
              ? "line-through"
              : "none",
          lineHeight: computedStyles.lineHeight || "normal",
          letterSpacing: computedStyles.letterSpacing === "normal" ? "0px" : computedStyles.letterSpacing || "0px",
          textTransform: computedStyles.textTransform || "none",
        });
      }
    }
  }, [selectedElement]);

  // Update both local state and global context.
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
            onChange={(e) =>
              // Round the value before appending "px"
              handleStyleChange("fontSize", Math.round(e.target.value) + "px")
            }
          />
        </div>
      </div>

      {/* Color Picker + Hex Value */}
      <div className="editor-group">
        <label>Color</label>
        <div className="color-group-combined">
          <input
            type="color"
            value={styles.color}
            onChange={(e) => handleStyleChange("color", e.target.value)}
          />
          <input type="text" value={styles.color} readOnly className="color-hex" />
        </div>
      </div>

      {/* Text Decoration */}
      <div className="editor-group">
        <label>Text Decoration</label>
        <div className="text-decoration-group">
          {/* Italic toggle: clicking again toggles it off */}
          <button
            className={styles.fontStyle === "italic" ? "active" : ""}
            onClick={() =>
              handleStyleChange("fontStyle", styles.fontStyle === "italic" ? "normal" : "italic")
            }
          >
            <span className="material-symbols-outlined">format_italic</span>
          </button>
          <hr className="custom-rule" />
          {/* Underline toggle: toggles on/off */}
          <button
            className={styles.textDecoration === "underline" ? "active" : ""}
            onClick={() =>
              handleStyleChange(
                "textDecoration",
                styles.textDecoration === "underline" ? "none" : "underline"
              )
            }
          >
            <span className="material-symbols-outlined">format_underlined</span>
          </button>
          <hr className="custom-rule" />
          {/* Line-through toggle: toggles on/off */}
          <button
            className={styles.textDecoration === "line-through" ? "active" : ""}
            onClick={() =>
              handleStyleChange(
                "textDecoration",
                styles.textDecoration === "line-through" ? "none" : "line-through"
              )
            }
          >
            <span className="material-symbols-outlined">strikethrough_s</span>
          </button>
          <hr className="custom-rule" />
          {/* Clear: resets both textDecoration and fontStyle */}
          <button
            className={styles.textDecoration === "none" && styles.fontStyle === "normal" ? "active" : ""}
            onClick={() => {
              handleStyleChange("textDecoration", "none");
              handleStyleChange("fontStyle", "normal");
            }}
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

      {/* Line Height + Letter Spacing */}
      <div className="editor-regroup">
        <div className="editor-group">
          <label>Line Height</label>
          <input
            className="size-input"
            type="number"
            step="0.1"
            min="0"
            value={styles.lineHeight === "normal" ? "" : parseFloat(styles.lineHeight)}
            placeholder="auto"
            onChange={(e) => {
              const val = e.target.value;
              handleStyleChange("lineHeight", val === "" ? "normal" : val + "px");
            }}
          />
        </div>
        <div className="editor-group">
          <label>Letter Spacing</label>
          <input
            className="size-input"
            type="number"
            step="0.5"
            value={parseFloat(styles.letterSpacing) || 0}
            onChange={(e) =>
              handleStyleChange("letterSpacing", e.target.value + "px")
            }
          />
        </div>
      </div>

      {/* Text Transform */}
      <div className="editor-group">
        <label>Text Transform</label>
        <div className="text-align-group">
          <button
            className={styles.textTransform === "none" ? "active" : ""}
            onClick={() => handleStyleChange("textTransform", "none")}
            title="None"
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Aa</span>
          </button>
          <hr className="custom-rule" />
          <button
            className={styles.textTransform === "uppercase" ? "active" : ""}
            onClick={() => handleStyleChange("textTransform", "uppercase")}
            title="Uppercase"
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>AA</span>
          </button>
          <hr className="custom-rule" />
          <button
            className={styles.textTransform === "lowercase" ? "active" : ""}
            onClick={() => handleStyleChange("textTransform", "lowercase")}
            title="Lowercase"
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>aa</span>
          </button>
          <hr className="custom-rule" />
          <button
            className={styles.textTransform === "capitalize" ? "active" : ""}
            onClick={() => handleStyleChange("textTransform", "capitalize")}
            title="Capitalize"
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Aa</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypographyEditor;
