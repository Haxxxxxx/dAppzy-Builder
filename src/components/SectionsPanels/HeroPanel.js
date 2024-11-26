// HeroPanel.js
import React from 'react';
import DraggableHero from '../../Elements/Structure/DraggableHero';

const HeroPanel = () => {
    return (
      <div>
        <h3>Create New Hero Section</h3>
        <div className='bento-display-elements' style={{ marginTop: '16px' }}>
          {/* Split hero components into individual ones */}
          <DraggableHero configuration="heroOne" isEditing={false} showDescription={true} />
          <DraggableHero configuration="heroTwo" isEditing={false} showDescription={true} />
          <DraggableHero configuration="heroThree" isEditing={false} showDescription={true} />

        </div>
      </div>
    );
  };
  

export default HeroPanel;
