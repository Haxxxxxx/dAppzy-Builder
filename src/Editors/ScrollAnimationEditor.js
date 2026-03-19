import React, { useContext } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/ScrollAnimationEditor.css";

const ANIMATION_TYPES = [
  { value: "none", label: "None" },
  { value: "fadeIn", label: "Fade In" },
  { value: "fadeInUp", label: "Fade In Up" },
  { value: "fadeInDown", label: "Fade In Down" },
  { value: "fadeInLeft", label: "Fade In Left" },
  { value: "fadeInRight", label: "Fade In Right" },
  { value: "zoomIn", label: "Zoom In" },
  { value: "zoomOut", label: "Zoom Out" },
];

const ScrollAnimationEditor = () => {
  const { selectedElement, updateElementProperties } = useContext(EditableContext);

  if (!selectedElement) return null;

  const anim = selectedElement.scrollAnimation || { type: "none", duration: 600, delay: 0, once: true };

  const update = (key, value) => {
    const next = { ...anim, [key]: value };
    // If type set to "none", clear the animation data
    if (key === "type" && value === "none") {
      updateElementProperties(selectedElement.id, { scrollAnimation: null });
      return;
    }
    updateElementProperties(selectedElement.id, { scrollAnimation: next });
  };

  const remove = () => {
    updateElementProperties(selectedElement.id, { scrollAnimation: null });
  };

  return (
    <div className="scroll-animation-editor">
      <div className="scroll-anim-row">
        <div className="scroll-anim-field">
          <label>Animation</label>
          <select value={anim.type} onChange={(e) => update("type", e.target.value)}>
            {ANIMATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      {anim.type !== "none" && (
        <>
          <div className="scroll-anim-row">
            <div className="scroll-anim-field">
              <label>Duration</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min="100"
                  max="5000"
                  step="50"
                  value={anim.duration}
                  onChange={(e) => update("duration", Number(e.target.value))}
                />
                <span className="suffix">ms</span>
              </div>
            </div>
            <div className="scroll-anim-field">
              <label>Delay</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="50"
                  value={anim.delay}
                  onChange={(e) => update("delay", Number(e.target.value))}
                />
                <span className="suffix">ms</span>
              </div>
            </div>
          </div>
          <div className="scroll-anim-row">
            <div className="scroll-anim-field scroll-anim-trigger">
              <label>Trigger</label>
              <div className="scroll-anim-toggle-row">
                <button
                  type="button"
                  className={`scroll-anim-toggle-btn ${anim.once !== false ? "active" : ""}`}
                  onClick={() => update("once", true)}
                >
                  Once
                </button>
                <button
                  type="button"
                  className={`scroll-anim-toggle-btn ${anim.once === false ? "active" : ""}`}
                  onClick={() => update("once", false)}
                >
                  Every time
                </button>
              </div>
            </div>
          </div>
          <button className="scroll-anim-remove" onClick={remove}>Remove Animation</button>
        </>
      )}
    </div>
  );
};

export default ScrollAnimationEditor;
