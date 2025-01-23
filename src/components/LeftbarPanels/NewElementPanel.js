import React, { useEffect, useState } from 'react';
import FooterPanel from '../SectionsPanels/FooterPanel';
import NavbarPanel from '../SectionsPanels/NavbarPanel';
import DraggableElement from '../../Elements/Structure/DraggableElement';
import '../css/Sidebar.css';
import HeroPanel from '../SectionsPanels/HeroPanel';
import CTAPanel from '../SectionsPanels/CTAPanel';
import Web3ElementPanel from '../SectionsPanels/Web3ElementPanel';
import Web3SectionPanel from '../SectionsPanels/Web3SectionPanel';

const NewElementPanel = ({ contentListWidth, viewMode, searchQuery }) => {
  const [expandedSections, setExpandedSections] = useState({}); // State to manage expanded sections

  useEffect(() => {
    console.log(contentListWidth);
  }, [contentListWidth]);

  // Toggle expanded/collapsed state for a section
  const toggleSection = (sectionName) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [sectionName]: !prevState[sectionName],
    }));
  };

  const elements = {
    'Text Elements': [
      { type: 'paragraph', label: 'Paragraph', description: 'A block of text.' },
      { type: 'heading', label: 'Heading', description: 'A title or header element.' },
      { type: 'span', label: 'Span', description: 'An inline text element.' },
      { type: 'anchor', label: 'Anchor (Link)', description: 'A hyperlink element.' },
      { type: 'blockquote', label: 'Blockquote', description: 'A quoted block of text.' },
      { type: 'code', label: 'Code', description: 'A code snippet.' },
      { type: 'pre', label: 'Preformatted Text', description: 'Text with preserved formatting.' },
    ],
    'Container Elements': [
      { type: 'section', label: 'Section', description: 'A container element for layout.' },
      { type: 'div', label: 'Div', description: 'A generic container element.' },
      { type: 'table', label: 'Table', description: 'A table element for tabular data.' },
      { type: 'ul', label: 'Unordered List', description: 'A bullet point list.' },
      { type: 'ol', label: 'Ordered List', description: 'A numbered list.' },
      { type: 'fieldset', label: 'Fieldset', description: 'Groups related form elements.' },
    ],
    'Form Elements': [
      { type: 'input', label: 'Input', description: 'A basic input field.' },
      { type: 'form', label: 'Form', description: 'A container for form elements.' },
      { type: 'textarea', label: 'Textarea', description: 'A multi-line text input.' },
      { type: 'select', label: 'Select (Dropdown)', description: 'A dropdown menu.' },
      { type: 'label', label: 'Label', description: 'A label for form elements.' },
      { type: 'legend', label: 'Legend', description: 'A title for a fieldset.' },
    ],
    'Media Elements': [
      { type: 'image', label: 'Image', description: 'An image element.' },
      { type: 'video', label: 'Video', description: 'A video player element.' },
      { type: 'audio', label: 'Audio', description: 'An audio player element.' },
      { type: 'iframe', label: 'Iframe', description: 'An inline frame for external content.' },
    ],
    'Interactive Elements': [
      { type: 'button', label: 'Button', description: 'A clickable button.' },
      { type: 'progress', label: 'Progress', description: 'A progress bar indicator.' },
      { type: 'meter', label: 'Meter', description: 'A measurement value.' },
    ],
  };

  const layoutSections = [
    { name: 'Navbar', component: <NavbarPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
    { name: 'Hero', component: <HeroPanel searchQuery={searchQuery} /> },
    { name: 'CTA', component: <CTAPanel searchQuery={searchQuery} /> },
    { name: 'Footer', component: <FooterPanel contentListWidth={contentListWidth} searchQuery={searchQuery} /> },
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

  const filteredWeb3Elements = (
    <Web3ElementPanel searchQuery={searchQuery} contentListWidth={contentListWidth} />
  );

  if (viewMode === 'layout') {
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
        <div className="content-section">
          <h4 onClick={() => toggleSection('Web3 Sections')} style={{ cursor: 'pointer' }}>
            Web3 Sections 
            <span>{expandedSections['Web3 Sections'] ? '▼' : '▶'}</span>
          </h4>
          {expandedSections['Web3 Sections'] && (
            <div className="bento-display-elements">
              <Web3SectionPanel searchQuery={searchQuery} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {filteredElements.map(({ category, items }) => (
        <div key={category} className="content-section">
          <h4
            onClick={() => toggleSection(category)}
            className="toggle-header"
          >
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
                />
              ))}
            </div>
          )}
          <hr />
        </div>

      ))}
      <div className="content-section">
        <h4 onClick={() => toggleSection('Web3 Elements')} className="toggle-header"
        >
          Web3 Elements
          <span>{expandedSections['Web3 Elements']}</span>
          <span>{expandedSections['Web3 Elements'] ? '▼' : '▶'}</span>


        </h4>
        {expandedSections['Web3 Elements'] && (
          <div className="bento-display-elements">{filteredWeb3Elements}</div>
        )}
      </div>
    </div>
  );
};

export default NewElementPanel;
