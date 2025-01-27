import React, { useEffect, useState } from 'react';
import FooterPanel from '../SectionsPanels/FooterPanel';
import NavbarPanel from '../SectionsPanels/NavbarPanel';
import DraggableElement from '../../Elements/DraggableElements/DraggableElement';
import '../css/Sidebar.css';
import HeroPanel from '../SectionsPanels/HeroPanel';
import CTAPanel from '../SectionsPanels/CTAPanel';
import Web3ElementPanel from '../SectionsPanels/Web3ElementPanel';

import TypographyElements from './ElementsMapping/TypographyElements';
import StructureElements from './ElementsMapping/StructureElements';
import BasicElements from './ElementsMapping/BasicElements';
import Web3Elements from './ElementsMapping/Web3Elements';
import AdvancedElements from './ElementsMapping/AdvancedElements';
import FormElements from './ElementsMapping/FormElements';
import MediaElements from './ElementsMapping/MediaElements';

const NewElementPanel = ({ contentListWidth, viewMode, searchQuery }) => {
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    console.log(contentListWidth);
  }, [contentListWidth]);

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Combine standard HTML elements + Web3Sections as categories
  const elements = {
    'Structure': StructureElements,
    'Basic': BasicElements,
    'Web 3 Blocks': Web3Elements,
    'Typography': TypographyElements,
    'Media': MediaElements,
    'Advanced':AdvancedElements,
    'Forms':FormElements,

  };

  // Layout-based panels if viewMode is 'layout'
  const layoutSections = [
    { name: 'Navbar', component: <NavbarPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
    { name: 'Hero', component: <HeroPanel searchQuery={searchQuery} /> },
    { name: 'CTA', component: <CTAPanel searchQuery={searchQuery} /> },
    { name: 'Footer', component: <FooterPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
    { name: 'web3 sections', component: <Web3ElementPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
  ];

  // Filter the "elements" object
  const filteredElements = Object.entries(elements)
    .map(([category, items]) => ({
      category,
      items: items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  if (viewMode === 'layout') {
    // If in "layout" mode, show layoutSections
    const filteredLayoutSections = layoutSections.filter(({ name }) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div>
        {filteredLayoutSections.map(({ name, component }) => (
          <div key={name} className="content-section">
            <h4 onClick={() => toggleSection(name)} style={{ cursor: 'pointer' }}>
              {name}
              <span>{expandedSections[name] ? '▼' : '▶'}</span>
            </h4>
            {expandedSections[name] && (
              <div className="bento-display-elements">{component}</div>
            )}
            <hr />
          </div>
        ))}
      </div>
    );
  }

  // Otherwise, show all "elements" categories (including Web3)
  return (
    <div>
      {filteredElements.map(({ category, items }) => (
        <div key={category} className="content-section">
          <h4 onClick={() => toggleSection(category)} className="toggle-header">
            <span>{category}</span>
            <span>{expandedSections[category] ? '▼' : '▶'}</span>
          </h4>
          {expandedSections[category] && (
            <div className="bento-display-elements">
              {items.map((item) => (
                <DraggableElement
                  key={item.type}
                  type={item.type}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                />
              ))}
            </div>
          )}
          <hr />
        </div>
      ))}

      {/* If you still want a separate Web3 Elements panel (like your Web3ElementPanel),
          you could leave that here OR remove it if everything is now in Draggable form */}
      <div className="content-section">
        <h4 onClick={() => toggleSection('Web3 Elements')} className="toggle-header">
          Web3 Elements
          <span>{expandedSections['Web3 Elements'] ? '▼' : '▶'}</span>
        </h4>
        {expandedSections['Web3 Elements'] && (
          <div className="bento-display-elements">
            <Web3ElementPanel
              searchQuery={searchQuery}
              contentListWidth={contentListWidth}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewElementPanel;
