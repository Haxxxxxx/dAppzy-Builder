import React from 'react';
import LayoutCard from './LayoutCard';
import { getByCategory } from '../../configs/sectionRegistry';

/**
 * Generic section panel — replaces NavbarPanel, HeroPanel, CTAPanel,
 * ContentSectionsPanel, FooterPanel, and Web3SectionPanel which were
 * byte-for-byte identical except for the category and empty text.
 */
const SectionPanel = ({ category, emptyText = 'No sections found.', searchQuery }) => {
  const entries = React.useMemo(() => getByCategory(category), [category]);

  const filtered = entries.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="layout-card-grid">
      {filtered.map((c) => (
        <LayoutCard key={c.configuration} {...c} />
      ))}
      {filtered.length === 0 && <p className="sidebar-empty-hint">{emptyText}</p>}
    </div>
  );
};

export default SectionPanel;
