import React, { useContext, useCallback } from "react";
import { EditableContext } from "../context/EditableContext";
import ColorPicker from "../components/ColorPicker";
import "./css/TypographyEditor.css";

const FONT_UNITS = ["px", "rem", "em", "vw", "%"];

// Parse a CSS font-size value into { value, unit }
const parseFontSize = (fontSize) => {
  if (!fontSize) return { value: 16, unit: "px" };
  const match = fontSize.match(/^([\d.]+)\s*(px|rem|em|vw|%)$/);
  if (match) return { value: parseFloat(match[1]), unit: match[2] };
  const num = parseFloat(fontSize);
  return { value: isNaN(num) ? 16 : num, unit: "px" };
};

// Convert font-size numeric value when switching units
const convertFontValue = (numericValue, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return numericValue;
  if (fromUnit === "px" && toUnit === "rem") return parseFloat((numericValue / 16).toFixed(3));
  if (fromUnit === "rem" && toUnit === "px") return Math.round(numericValue * 16);
  return numericValue;
};

const SYSTEM_FONTS = [
  "Arial",
  "Courier New",
  "Georgia",
  "Helvetica",
  "system-ui",
  "Times New Roman",
  "Verdana",
];

const GOOGLE_FONTS = [
  "DM Sans",
  "Inter",
  "Lato",
  "Merriweather",
  "Montserrat",
  "Nunito",
  "Open Sans",
  "Oswald",
  "Playfair Display",
  "Plus Jakarta Sans",
  "Poppins",
  "PT Sans",
  "Raleway",
  "Roboto",
  "Roboto Condensed",
  "Roboto Mono",
  "Rubik",
  "Source Code Pro",
  "Source Sans Pro",
  "Space Grotesk",
  "Work Sans",
];

/** Inject a Google Fonts <link> into <head> if not already present. */
function loadGoogleFont(fontName) {
  const href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

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

  // Read styles directly from the live selectedElement (explicit values),
  // falling back to DOM computed styles for inherited properties.
  const elStyles = selectedElement?.styles || {};

  // Read from explicit element styles with sensible defaults — no DOM reads
  const styles = {
    fontSize: elStyles.fontSize || "16px",
    fontFamily: elStyles.fontFamily || "Arial",
    fontWeight: ({ normal: "400", bold: "700", lighter: "300", bolder: "700" }[elStyles.fontWeight] || elStyles.fontWeight) || "400",
    fontStyle: elStyles.fontStyle || "normal",
    color: elStyles.color || "#217BF4",
    textAlign: elStyles.textAlign || "left",
    textDecoration: elStyles.textDecoration || "none",
    lineHeight: elStyles.lineHeight || "normal",
    letterSpacing: elStyles.letterSpacing || "0px",
    textTransform: elStyles.textTransform || "none",
  };

  // Update global context — live selectedElement re-derives automatically
  const handleStyleChange = (styleKey, value) => {
    updateStyles(selectedElement.id, { [styleKey]: value });
  };

  // Parsed font-size for the unit selector
  const { value: fontSizeValue, unit: fontSizeUnit } = parseFontSize(styles.fontSize);

  const handleFontSizeChange = (numericValue) => {
    const val = fontSizeUnit === "px" ? Math.round(numericValue) : numericValue;
    handleStyleChange("fontSize", `${val}${fontSizeUnit}`);
  };

  const handleFontUnitChange = (newUnit) => {
    const converted = convertFontValue(fontSizeValue, fontSizeUnit, newUnit);
    const val = newUnit === "px" ? Math.round(converted) : converted;
    handleStyleChange("fontSize", `${val}${newUnit}`);
  };

  /** When the user picks a font, load the Google Font stylesheet if needed. */
  const handleFontFamilyChange = useCallback(
    (fontName) => {
      if (GOOGLE_FONTS.includes(fontName)) {
        loadGoogleFont(fontName);
      }
      handleStyleChange("fontFamily", fontName);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedElement?.id]
  );

  if (!selectedElement) return null;

  return (
    <div className="typography-editor">
      {/* Font Family */}
      <div className="editor-group">
        <label>Font Family</label>
        <select
          value={styles.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
        >
          <optgroup label="System Fonts">
            {SYSTEM_FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </optgroup>
          <optgroup label="Google Fonts">
            {GOOGLE_FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </optgroup>
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
            <option value="100">100 (Thin)</option>
            <option value="200">200 (Extra Light)</option>
            <option value="300">300 (Light)</option>
            <option value="400">400 (Regular)</option>
            <option value="500">500 (Medium)</option>
            <option value="600">600 (Semi Bold)</option>
            <option value="700">700 (Bold)</option>
            <option value="800">800 (Extra Bold)</option>
            <option value="900">900 (Black)</option>
          </select>
        </div>

        <div className="editor-group">
          <label>Size</label>
          <div className="font-size-with-unit">
            <input
              className="size-input"
              type="number"
              step={fontSizeUnit === "px" ? 1 : 0.1}
              value={fontSizeValue}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            />
            <select
              className="unit-select"
              value={fontSizeUnit}
              onChange={(e) => handleFontUnitChange(e.target.value)}
            >
              {FONT_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Color Picker + Hex Value */}
      <div className="editor-group">
        <label>Color</label>
        <ColorPicker
          value={styles.color}
          onChange={(color) => handleStyleChange("color", color)}
        />
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
              handleStyleChange("lineHeight", val === "" ? "normal" : val);
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
            <span style={{ fontSize: '14px', fontWeight: 500 }}>&mdash;</span>
          </button>
          <hr className="custom-rule" />
          <button
            className={styles.textTransform === "capitalize" ? "active" : ""}
            onClick={() => handleStyleChange("textTransform", "capitalize")}
            title="Capitalize"
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
        </div>
      </div>
    </div>
  );
};

export default TypographyEditor;
