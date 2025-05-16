import React from 'react';
import DraggableContentSections from '../../Elements/DraggableLayout/DraggableContentSections';
import '../css/Sidebar.css';

const ContentSectionsPanel = ({ contentListWidth, searchQuery, handlePanelToggle, handleOpenMediaPanel }) => {
  const sectionConfigurations = [
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'sectionOne', 
      type: 'section',
      id: 'feature-section',
      label: 'Feature Section',
      category: 'section'
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'sectionTwo', 
      type: 'section',
      id: 'content-grid',
      label: 'Content Grid',
      category: 'section'
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'sectionThree', 
      type: 'section',
      id: 'testimonial-section',
      label: 'Testimonial Section',
      category: 'section'
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'sectionFour', 
      type: 'section',
      id: 'pricing-section',
      label: 'Pricing Section',
      category: 'section'
    }
  ];

  // Filter section configurations based on the search query
  const filteredSections = sectionConfigurations.filter((section) =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (section.description && section.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredSections.map((config) => (
        <DraggableContentSections
          key={config.id}
          configuration={config.configuration}
          type={config.type}
          id={config.id}
          label={config.label}
          description={config.description}
          isEditing={false}
          showDescription={true}
          contentListWidth={contentListWidth}
          imgSrc={config.imgSrc}
          handlePanelToggle={handlePanelToggle}
          handleOpenMediaPanel={handleOpenMediaPanel}
        />
      ))}
      {filteredSections.length === 0 && <p>No sections found.</p>}
    </div>
  );
};

export default ContentSectionsPanel;
