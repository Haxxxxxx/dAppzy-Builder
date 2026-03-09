import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/TransitionEditor.css";

const PROPERTIES = ["all", "opacity", "transform", "background-color", "color", "border", "box-shadow"];
const TIMINGS = ["ease", "ease-in", "ease-out", "ease-in-out", "linear"];

function parseTransition(str) {
  if (!str || str === "none") {
    return { property: "all", duration: 0.3, timing: "ease", delay: 0 };
  }
  const parts = str.trim().split(/\s+/);
  return {
    property: PROPERTIES.includes(parts[0]) ? parts[0] : "all",
    duration: parts[1] ? parseFloat(parts[1]) : 0.3,
    timing: parts[2] && TIMINGS.includes(parts[2]) ? parts[2] : "ease",
    delay: parts[3] ? parseFloat(parts[3]) : 0,
  };
}

function buildTransition(t) {
  if (t.duration === 0 && t.delay === 0) return "none";
  return `${t.property} ${t.duration}s ${t.timing} ${t.delay}s`;
}

const TransitionEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const [transition, setTransition] = useState(parseTransition(null));

  useEffect(() => {
    if (selectedElement) {
      setTransition(parseTransition(selectedElement.styles?.transition));
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const update = (key, value) => {
    const next = { ...transition, [key]: value };
    setTransition(next);
    updateStyles(selectedElement.id, { transition: buildTransition(next) });
  };

  const remove = () => {
    const defaults = parseTransition(null);
    defaults.duration = 0;
    defaults.delay = 0;
    setTransition(defaults);
    updateStyles(selectedElement.id, { transition: "none" });
  };

  return (
    <div className="transition-editor">
      <div className="transition-row">
        <div className="transition-field">
          <label>Property</label>
          <select value={transition.property} onChange={(e) => update("property", e.target.value)}>
            {PROPERTIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="transition-field">
          <label>Timing</label>
          <select value={transition.timing} onChange={(e) => update("timing", e.target.value)}>
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
              onChange={(e) => update("duration", Number(e.target.value))}
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
              onChange={(e) => update("delay", Number(e.target.value))}
            />
            <span className="suffix">s</span>
          </div>
        </div>
      </div>
      <button className="transition-remove" onClick={remove}>Remove Transition</button>
    </div>
  );
};

export default TransitionEditor;
