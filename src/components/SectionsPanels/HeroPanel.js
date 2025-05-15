import React from 'react';
import DraggableHero from '../../Elements/DraggableLayout/DraggableHero';
import '../css/Sidebar.css'
const HeroPanel = ({ contentListWidth, searchQuery, handlePanelToggle, handleOpenMediaPanel }) => {

  const heroConfigurations = [
    { imgSrc: './img/previsu-basic-hero.png', configuration: 'heroOne', label: 'Basic Hero' },
    { imgSrc: './img/previsu-small-hero.png', configuration: 'heroTwo', label: 'Small Hero' },
    { imgSrc: './img/previsu-advanced-hero.png', configuration: 'heroThree', label: 'Advanced Hero' },
  ];

  // Filter hero configurations based on search query
  const filteredHeroes = heroConfigurations.filter((hero) =>
    hero.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredHeroes.map(({ configuration, label, imgSrc }) => (
        <DraggableHero
          key={configuration}
          configuration={configuration}
          label={label}
          isEditing={false}
          showDescription={true}
          contentListWidth={contentListWidth}
          imgSrc={imgSrc}
          handlePanelToggle={handlePanelToggle}
          handleOpenMediaPanel={handleOpenMediaPanel}
        />
      ))}
      {filteredHeroes.length === 0 && <p>No heroes found.</p>}
    </div>
  );
};

export default HeroPanel;
