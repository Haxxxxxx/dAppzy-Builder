import React, { useContext } from "react";
import { EditableContext } from "../context/EditableContext";
import "./css/TransformEditor.css";

function parseTransform(str) {
  const defaults = { rotate: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0 };
  if (!str || str === "none") return defaults;
  const extract = (name) => {
    const match = str.match(new RegExp(`${name}\\(([^)]+)\\)`));
    return match ? parseFloat(match[1]) : undefined;
  };
  return {
    rotate: extract("rotate") ?? defaults.rotate,
    scaleX: extract("scaleX") ?? extract("scale") ?? defaults.scaleX,
    scaleY: extract("scaleY") ?? extract("scale") ?? defaults.scaleY,
    skewX: extract("skewX") ?? defaults.skewX,
    skewY: extract("skewY") ?? defaults.skewY,
    translateX: extract("translateX") ?? defaults.translateX,
    translateY: extract("translateY") ?? defaults.translateY,
  };
}

function composeTransform(t) {
  const parts = [];
  if (t.rotate !== 0) parts.push(`rotate(${t.rotate}deg)`);
  if (t.scaleX !== 1 || t.scaleY !== 1) parts.push(`scaleX(${t.scaleX}) scaleY(${t.scaleY})`);
  if (t.skewX !== 0 || t.skewY !== 0) parts.push(`skewX(${t.skewX}deg) skewY(${t.skewY}deg)`);
  if (t.translateX !== 0 || t.translateY !== 0) parts.push(`translateX(${t.translateX}px) translateY(${t.translateY}px)`);
  return parts.length ? parts.join(" ") : "none";
}

const TransformEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);

  if (!selectedElement) return null;

  // Read directly from live selectedElement — no local state needed
  const s = selectedElement.styles || {};
  const transform = parseTransform(s.transform);

  const update = (key, value) => {
    const next = { ...transform, [key]: Number(value) };
    updateStyles(selectedElement.id, { transform: composeTransform(next) });
  };

  const reset = () => {
    updateStyles(selectedElement.id, { transform: "none" });
  };

  return (
    <div className="transform-editor">
      <div className="transform-row">
        <div className="transform-field">
          <label>Rotate</label>
          <div className="input-with-suffix">
            <input type="number" value={transform.rotate} onChange={(e) => update("rotate", e.target.value)} />
            <span className="suffix">deg</span>
          </div>
        </div>
      </div>

      <div className="transform-row">
        <div className="transform-field">
          <label>Scale X</label>
          <input type="number" step="0.1" value={transform.scaleX} onChange={(e) => update("scaleX", e.target.value)} />
        </div>
        <div className="transform-field">
          <label>Scale Y</label>
          <input type="number" step="0.1" value={transform.scaleY} onChange={(e) => update("scaleY", e.target.value)} />
        </div>
      </div>

      <div className="transform-row">
        <div className="transform-field">
          <label>Skew X</label>
          <div className="input-with-suffix">
            <input type="number" value={transform.skewX} onChange={(e) => update("skewX", e.target.value)} />
            <span className="suffix">deg</span>
          </div>
        </div>
        <div className="transform-field">
          <label>Skew Y</label>
          <div className="input-with-suffix">
            <input type="number" value={transform.skewY} onChange={(e) => update("skewY", e.target.value)} />
            <span className="suffix">deg</span>
          </div>
        </div>
      </div>

      <div className="transform-row">
        <div className="transform-field">
          <label>Move X</label>
          <div className="input-with-suffix">
            <input type="number" value={transform.translateX} onChange={(e) => update("translateX", e.target.value)} />
            <span className="suffix">px</span>
          </div>
        </div>
        <div className="transform-field">
          <label>Move Y</label>
          <div className="input-with-suffix">
            <input type="number" value={transform.translateY} onChange={(e) => update("translateY", e.target.value)} />
            <span className="suffix">px</span>
          </div>
        </div>
      </div>

      <button className="transform-reset" onClick={reset}>Reset Transform</button>
    </div>
  );
};

export default TransformEditor;
