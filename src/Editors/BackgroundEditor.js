import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/BackgroundEditor.css"; // <-- Make sure to import the CSS file

const BackgroundEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [globalPadding, setGlobalPadding] = useState("");
  const [globalMargin, setGlobalMargin] = useState("");

  // Convert "rgb(r,g,b)" to "#rrggbb"
  const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g).map(Number);
    return `#${result.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  };

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);
        const bgColor = computedStyles.backgroundColor;
        setBackgroundColor(rgbToHex(bgColor));

        // For simplicity, let’s just read top padding/margin
        const paddingTop = computedStyles.paddingTop;
        const marginTop = computedStyles.marginTop;

        setGlobalPadding(parseFloat(paddingTop) || 0);
        setGlobalMargin(parseFloat(marginTop) || 0);
      }
    }
  }, [selectedElement]);

  const handleChange = (key, value) => {
    // Update local state
    if (key === "backgroundColor") {
      setBackgroundColor(value);
    } else if (key === "padding") {
      setGlobalPadding(value);
    } else if (key === "margin") {
      setGlobalMargin(value);
    }

    // Convert numeric fields to `px`, color remains as hex
    const styleValue = key === "backgroundColor" ? value : `${value}px`;
    updateStyles(selectedElement.id, { [key]: styleValue });
  };

  if (!selectedElement) return null;

  return (
    <div className="background-editor">
      {/* COLOR PICKER */}
      <div className="editor-group">
        <label>Color</label>
        <div className="color-group">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
          />
          <input
            type="text"
            value={backgroundColor}
            readOnly
            className="color-hex"
          />
        </div>
      </div>

      <button className="add-image-button">
        Add an Image
        <span>+</span>
      </button>


    </div>
  );
};

export default BackgroundEditor;
