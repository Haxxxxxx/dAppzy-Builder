import React from 'react';
import { useDrag } from 'react-dnd';
import { structureConfigurations } from '../../configs/structureConfigurations';
import { registryByConfig } from '../../configs/sectionRegistry';

/**
 * Unified sidebar card for layout sections (Navbar, Hero, CTA, Footer, etc.).
 * Renders a consistent preview image + label + optional description,
 * and is draggable onto the canvas.
 *
 * At drag time, resolves the full config (children, styles) from
 * structureConfigurations so that ContentList.handleDrop can use
 * buildSectionTree instead of per-config creation logic.
 */
const LayoutCard = ({ type, configuration, label, description, imgSrc }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: () => {
      const config = structureConfigurations[configuration] || {};
      const entry = registryByConfig[configuration];
      return {
        type: entry?.type || type,
        configuration,
        label: label || config.label || configuration,
        children: config.children || [],
        styles: config.styles || {},
        settings: config.settings || {},
        structure: configuration,
      };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, configuration, label]);

  return (
    <div
      ref={drag}
      className="layout-card"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img
        src={imgSrc || '/img/previewcomponent.png'}
        alt={label}
        className="layout-card-img"
        loading="lazy"
        onError={(e) => { e.target.src = '/img/previewcomponent.png'; }}
      />
      <strong className="element-name">{label}</strong>
      {description && <p className="element-description">{description}</p>}
    </div>
  );
};

export default LayoutCard;
