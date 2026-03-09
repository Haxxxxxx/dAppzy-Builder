import React, { useContext, useState, useEffect } from "react";
import { EditableContext } from "../context/EditableContext";
import { useDebouncedStyle } from "./useDebouncedStyle";
import "./css/FilterEditor.css";

const FILTER_DEFAULTS = {
  blur: { default: 0, min: 0, max: 20, step: 1, unit: "px", label: "Blur" },
  brightness: { default: 1, min: 0, max: 2, step: 0.1, unit: "", label: "Brightness" },
  contrast: { default: 1, min: 0, max: 2, step: 0.1, unit: "", label: "Contrast" },
  saturate: { default: 1, min: 0, max: 3, step: 0.1, unit: "", label: "Saturate" },
  grayscale: { default: 0, min: 0, max: 1, step: 0.1, unit: "", label: "Grayscale" },
  "hue-rotate": { default: 0, min: 0, max: 360, step: 1, unit: "deg", label: "Hue Rotate" },
  sepia: { default: 0, min: 0, max: 1, step: 0.1, unit: "", label: "Sepia" },
};

function parseFilter(filterStr) {
  const values = {};
  Object.keys(FILTER_DEFAULTS).forEach((key) => {
    values[key] = FILTER_DEFAULTS[key].default;
  });
  if (!filterStr || filterStr === "none") return values;

  const regex = /(blur|brightness|contrast|saturate|grayscale|hue-rotate|sepia)\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(filterStr)) !== null) {
    values[match[1]] = parseFloat(match[2]);
  }
  return values;
}

function buildFilter(values) {
  const parts = [];
  Object.keys(FILTER_DEFAULTS).forEach((key) => {
    const def = FILTER_DEFAULTS[key];
    if (values[key] !== def.default) {
      parts.push(`${key}(${values[key]}${def.unit})`);
    }
  });
  return parts.length > 0 ? parts.join(" ") : "none";
}

const FilterEditor = () => {
  const { selectedElement, updateStyles } = useContext(EditableContext);
  const debouncedUpdate = useDebouncedStyle(updateStyles);
  const [filters, setFilters] = useState(() => parseFilter(""));

  useEffect(() => {
    if (selectedElement) {
      setFilters(parseFilter(selectedElement.styles?.filter));
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleChange = (key, value) => {
    const next = { ...filters, [key]: Number(value) };
    setFilters(next);
    debouncedUpdate(selectedElement.id, { filter: buildFilter(next) });
  };

  const handleReset = () => {
    const defaults = parseFilter("");
    setFilters(defaults);
    updateStyles(selectedElement.id, { filter: "none" });
  };

  return (
    <div className="filter-editor">
      {Object.entries(FILTER_DEFAULTS).map(([key, config]) => (
        <div className="filter-row" key={key}>
          <label>{config.label}</label>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={filters[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="filter-slider"
          />
          <span className="filter-value">
            {config.unit === "deg"
              ? `${filters[key]}°`
              : config.unit === "px"
              ? `${filters[key]}px`
              : Math.round(filters[key] * 100) + "%"}
          </span>
        </div>
      ))}
      <button className="filter-reset" onClick={handleReset}>
        Reset Filters
      </button>
    </div>
  );
};

export default FilterEditor;
