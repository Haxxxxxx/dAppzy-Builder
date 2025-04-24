import React, { useState, useEffect} from 'react';
import FooterPanel from '../SectionsPanels/FooterPanel';
import NavbarPanel from '../SectionsPanels/NavbarPanel';
import DraggableElement from '../../Elements/DraggableElements/DraggableElement';
import '../css/Sidebar.css';
import HeroPanel from '../SectionsPanels/HeroPanel';
import CTAPanel from '../SectionsPanels/CTAPanel';
import Web3SectionPanel from '../SectionsPanels/Web3SectionPanel';
import TypographyElements from './ElementsMapping/TypographyElements';
import StructureElements from './ElementsMapping/StructureElements';
import BasicElements from './ElementsMapping/BasicElements';
import Web3Elements from './ElementsMapping/Web3Elements';
import AdvancedElements from './ElementsMapping/AdvancedElements';
import FormElements from './ElementsMapping/FormElements';
import MediaElements from './ElementsMapping/MediaElements';
import ContentSectionsPanel from '../SectionsPanels/ContentSectionsPanel';

const NewElementPanel = ({ contentListWidth, viewMode, searchQuery }) => {
  // Define default expanded state based on view mode.
  const defaultExpanded =
       {
          Navbar: true,
          Hero: true,
          cta: true,
          Footer: true,
          ContentSection: true,
          'Web3 Sections': true,
          Structure: true,
          Basic: true,
          Typography: true,
          Media: true,
          Forms: true,
          'Web 3 Blocks': true,
        };

  const [expandedSections, setExpandedSections] = useState(defaultExpanded);
  useEffect(() => {
    console.log("Expanded sections:", expandedSections);
  }, []);
  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Elements categories
  const elements = {
    Structure: StructureElements,
    Basic: BasicElements,
    'Web 3 Blocks': Web3Elements,
    Typography: TypographyElements,
    Media: MediaElements,
    // Advanced: AdvancedElements,
    Forms: FormElements,
  };

  // Layout-based panels if viewMode is 'layout'
  const layoutSections = [
    { name: 'Navbar', component: <NavbarPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
    { name: 'Hero', component: <HeroPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
    { name: 'cta', component: <CTAPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
    { name: 'Footer', component: <FooterPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
    { name: 'ContentSection', component: <ContentSectionsPanel contentListWidth={contentListWidth} searchQuery={searchQuery}/>},
    { name: 'Web3 Sections', component: <Web3SectionPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
  ];

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
    // Display layout menu
    return (
      <div>
        {layoutSections.map(({ name, component }) => (
          <div key={name} className="content-section">
            <h4 onClick={() => toggleSection(name)} style={{ cursor: 'pointer' }}>
              {name} <span>{expandedSections[name] ? '▼' : '▶'}</span>
            </h4>
            {expandedSections[name] && <div className="bento-display-layout">{component}</div>}
            <hr />
          </div>
        ))}
      </div>
    );
  }

  // Default: Display elements menu
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
    </div>
  );
};

export default NewElementPanel;
