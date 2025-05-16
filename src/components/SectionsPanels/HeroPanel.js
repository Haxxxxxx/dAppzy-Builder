import React from 'react';
import DraggableHero from '../../Elements/DraggableLayout/DraggableHero';
import '../css/Sidebar.css'

const HeroPanel = ({ contentListWidth, searchQuery, handlePanelToggle, handleOpenMediaPanel }) => {
  const heroConfigurations = [
    { 
      imgSrc: './img/previsu-basic-hero.png', 
      configuration: 'heroOne', 
      type: 'hero',
      id: 'basic-hero',
      label: 'Basic Hero',
      description: 'A clean and simple hero section with essential elements',
      category: 'hero'
    },
    { 
      imgSrc: './img/previsu-small-hero.png', 
      configuration: 'heroTwo', 
      type: 'hero',
      id: 'small-hero',
      label: 'Small Hero',
      description: 'A compact hero section for focused messaging',
      category: 'hero'
    },
    { 
      imgSrc: './img/previsu-advanced-hero.png', 
      configuration: 'heroThree', 
      type: 'hero',
      id: 'advanced-hero',
      label: 'Advanced Hero',
      description: 'A feature-rich hero section with multiple interactive elements',
      category: 'hero'
    }
  ];

  // Filter hero configurations based on search query
  const filteredHeroes = heroConfigurations.filter((hero) =>
    hero.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (hero.description && hero.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredHeroes.map((config) => (
        <DraggableHero
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
      {filteredHeroes.length === 0 && <p>No heroes found.</p>}
    </div>
  );
};

export default HeroPanel;
