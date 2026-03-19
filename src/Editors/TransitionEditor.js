import React, { useContext } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/TransitionEditor.css";

const PROPERTIES = [
  "all", "opacity", "transform", "background-color", "color", "border",
  "box-shadow", "width", "height", "padding", "margin", "border-radius",
  "font-size", "gap",
];
const TIMINGS = ["ease", "ease-in", "ease-out", "ease-in-out", "linear"];

const DEFAULT_TRANSITION = { property: "all", duration: 0.3, timing: "ease", delay: 0 };

function parseSingleTransition(str) {
  if (!str || str === "none") {
    return { ...DEFAULT_TRANSITION };
  }
  const parts = str.trim().split(/\s+/);
  return {
    property: PROPERTIES.includes(parts[0]) ? parts[0] : "all",
    duration: parts[1] ? parseFloat(parts[1]) : 0.3,
    timing: parts[2] && TIMINGS.includes(parts[2]) ? parts[2] : "ease",
    delay: parts[3] ? parseFloat(parts[3]) : 0,
  };
}

function parseTransitions(str) {
  if (!str || str === "none") return [{ ...DEFAULT_TRANSITION }];
  const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return [{ ...DEFAULT_TRANSITION }];
  return parts.map(parseSingleTransition);
}

function buildSingleTransition(t) {
  if (t.duration === 0 && t.delay === 0) return "none";
  return `${t.property} ${t.duration}s ${t.timing} ${t.delay}s`;
}

function buildTransitions(transitions) {
  if (!transitions || transitions.length === 0) return "none";
  const built = transitions.map(buildSingleTransition).filter((s) => s !== "none");
  return built.length > 0 ? built.join(", ") : "none";
}

const TransitionEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  if (!selectedElement) return null;

  // Read directly from live selectedElement — no local state needed
  const s = selectedElement.styles || {};
  const transitions = parseTransitions(s.transition);

  const updateTransition = (index, key, value) => {
    const next = transitions.map((t, i) => (i === index ? { ...t, [key]: value } : t));
    updateStyles(selectedElement.id, { transition: buildTransitions(next) });
  };

  const addTransition = () => {
    const next = [...transitions, { ...DEFAULT_TRANSITION }];
    updateStyles(selectedElement.id, { transition: buildTransitions(next) });
  };

  const removeTransition = (index) => {
    const next = transitions.filter((_, i) => i !== index);
    updateStyles(selectedElement.id, { transition: buildTransitions(next) });
  };

  const removeAll = () => {
    updateStyles(selectedElement.id, { transition: "none" });
  };

  return (
    <div className="transition-editor">
      {transitions.map((transition, idx) => (
        <div className="transition-layer" key={idx}>
          {transitions.length > 1 && (
            <div className="transition-layer-header">
              <span className="transition-layer-label">Transition {idx + 1}</span>
              <button
                className="transition-layer-remove"
                onClick={() => removeTransition(idx)}
                title="Remove transition"
              >
                &times;
              </button>
            </div>
          )}
          <div className="transition-row">
            <div className="transition-field">
              <label>Property</label>
              <select value={transition.property} onChange={(e) => updateTransition(idx, "property", e.target.value)}>
                {PROPERTIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="transition-field">
              <label>Timing</label>
              <select value={transition.timing} onChange={(e) => updateTransition(idx, "timing", e.target.value)}>
                {TIMINGS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="transition-row">
            <div className="transition-field">
              <label>Duration</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={transition.duration}
                  onChange={(e) => updateTransition(idx, "duration", Number(e.target.value))}
                />
                <span className="suffix">s</span>
              </div>
            </div>
            <div className="transition-field">
              <label>Delay</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={transition.delay}
                  onChange={(e) => updateTransition(idx, "delay", Number(e.target.value))}
                />
                <span className="suffix">s</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button className="transition-add" onClick={addTransition}>+ Add Transition</button>
      <button className="transition-remove" onClick={removeAll}>Remove All Transitions</button>
    </div>
  );
};

export default TransitionEditor;
