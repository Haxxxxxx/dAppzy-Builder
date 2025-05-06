import React from 'react';
import DraggableHero from '../../Elements/DraggableLayout/DraggableHero';
import '../css/Sidebar.css'
const HeroPanel = ({ contentListWidth, searchQuery }) => {

  const heroConfigurations = [
    { imgSrc: './img/previewcomponent.png', configuration: 'heroOne', label: 'Basic Hero' },
    { imgSrc: './img/previewcomponent.png', configuration: 'heroTwo', label: 'Small Hero' },
    { imgSrc: './img/previewcomponent.png', configuration: 'heroThree', label: 'Advanced Hero' },
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
          imgSrc={imgSrc} // Pass the image source correctly
        />
      ))}
      {filteredHeroes.length === 0 && <p>No heroes found.</p>}
    </div>
  );
};

export default HeroPanel;
