// CTAPanel.js
import React from 'react';
import DraggableCTA from '../../Elements/DraggableLayout/DraggableCTA';

const CTAPanel = ({ contentListWidth, searchQuery, handlePanelToggle, handleOpenMediaPanel }) => {
  const CTAConfigurations = [
    { 
      imgSrc: './img/previsu-advanced-cta.png', 
      configuration: 'ctaOne', 
      type: 'cta',
      id: 'advanced-cta',
      label: 'Advanced CTA',
      description: 'A sophisticated call-to-action section with multiple elements and animations',
      category: 'cta'
    },
    { 
      imgSrc: './img/previsu-quick-cta.png', 
      configuration: 'ctaTwo', 
      type: 'cta',
      id: 'quick-cta',
      label: 'Quick CTA',
      description: 'A streamlined call-to-action section for immediate user engagement',
      category: 'cta'
    }
  ];

  // Filter CTA configurations based on search query
  const filteredCTA = CTAConfigurations.filter((cta) =>
    cta.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cta.description && cta.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredCTA.map((config) => (
        <DraggableCTA
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
      {filteredCTA.length === 0 && <p>No CTAs found.</p>}
    </div>
  );
};

export default CTAPanel;
