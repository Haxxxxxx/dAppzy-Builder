import React from 'react';
import DraggableHero from '../../Elements/Structure/DraggableHero';
import '../css/Sidebar.css'
const HeroPanel = ({ contentListWidth, searchQuery }) => {

  const heroConfigurations = [
    { imgSrc: './previewcomponent.png', configuration: 'heroOne', label: 'Hero One' },
    { imgSrc: './previewcomponent.png', configuration: 'heroTwo', label: 'Hero Two' },
    { imgSrc: './previewcomponent.png', configuration: 'heroThree', label: 'Hero Three' },
  ];

  // Filter hero configurations based on search query
  const filteredHeroes = heroConfigurations.filter((hero) =>
    hero.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
     
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
    </div>
  );
};

export default HeroPanel;
