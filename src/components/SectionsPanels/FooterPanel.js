import React from 'react';
import DraggableFooter from '../../Elements/DraggableLayout/DraggableFooter';

const FooterPanel = ({ contentListWidth, searchQuery, handlePanelToggle, handleOpenMediaPanel }) => {
  const footerConfigurations = [
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'simpleFooter', 
      type: 'footer',
      id: 'simple-footer',
      label: 'Simple Footer',
      description: 'A clean and minimal footer with essential links and information',
      category: 'footer'
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'detailedFooter', 
      type: 'footer',
      id: 'detailed-footer',
      label: 'Detailed Footer',
      description: 'A comprehensive footer with multiple sections and detailed information',
      category: 'footer'
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'advancedFooter', 
      type: 'footer',
      id: 'advanced-footer',
      label: 'Advanced Footer',
      description: 'A feature-rich footer with advanced layout and interactive elements',
      category: 'footer'
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'defiFooter', 
      type: 'footer',
      id: 'defi-footer',
      label: 'DeFi Footer',
      description: 'A specialized footer for DeFi applications with relevant links and information',
      category: 'footer'
    }
  ];

  // Filter footer configurations based on search query
  const filteredFooters = footerConfigurations.filter((footer) =>
    footer.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (footer.description && footer.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredFooters.map((config) => (
        <DraggableFooter
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
      {filteredFooters.length === 0 && <p>No footers found.</p>}
    </div>
  );
};

export default FooterPanel;
