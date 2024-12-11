import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";

const BackgroundEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [globalPadding, setGlobalPadding] = useState("");
  const [globalMargin, setGlobalMargin] = useState("");

  useEffect(() => {
    if (selectedElement) {
      const element = document.getElementById(selectedElement.id);
      if (element) {
        const computedStyles = getComputedStyle(element);
        const bgColor = computedStyles.backgroundColor;
        // Convert rgb(...) to hex if needed
        const hexColor = rgbToHex(bgColor);
        setBackgroundColor(hexColor);

        // You can similarly get margin or padding from computed styles
        // For simplicity, let's assume top margin and padding
        const padding = computedStyles.paddingTop;
        const margin = computedStyles.marginTop;

        // Remove units (e.g., "16px") and convert to number
        setGlobalPadding(parseFloat(padding) || 0);
        setGlobalMargin(parseFloat(margin) || 0);
      }
    }
  }, [selectedElement]);

  const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g).map(Number);
    return `#${result.map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  const handleChange = (key, value) => {
    // Update local state
    if (key === "backgroundColor") setBackgroundColor(value);
    if (key === "padding") setGlobalPadding(value);
    if (key === "margin") setGlobalMargin(value);

    // Update the actual styles of the selected element
    // Append "px" for padding/margin if it's a number
    const styleValue = key === "backgroundColor" ? value : value + "px";
    updateStyles(selectedElement.id, { [key]: styleValue });
  };

  if (!selectedElement) return null;

  return (
    <div className="background-editor">
      <div className="editor-group">
        <label>Background Color</label>
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
      <div className="editor-group">
        <label>Global Padding (Top)</label>
        <input
          type="number"
          value={globalPadding}
          onChange={(e) => handleChange("padding", e.target.value)}
        />
      </div>
      <div className="editor-group">
        <label>Global Margin (Top)</label>
        <input
          type="number"
          value={globalMargin}
          onChange={(e) => handleChange("margin", e.target.value)}
        />
      </div>
    </div>
  );
};

export default BackgroundEditor;
