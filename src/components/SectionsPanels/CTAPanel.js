// CTAPanel.js
import React, { useState } from 'react';
import DraggableCTA from '../../Elements/Structure/DraggableCTA';

const CTAPanel = ({ contentListWidth, searchQuery }) => {
    const [isExpanded, setIsExpanded] = useState(false); // State to manage collapse/expand
  
    const CTAConfigurations = [
      { imgSrc: './previewcomponent.png', configuration: 'CTAOne', label: 'CTA One' },
      { imgSrc: './previewcomponent.png', configuration: 'CTATwo', label: 'CTA Two' },
    ];
  
    // Filter hero configurations based on search query
    const filteredCTA = CTAConfigurations.filter((CTA) =>
      CTA.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  return (
    <div>
      
        <div className="bento-display-elements" style={{ marginTop: '16px' }}>
          {filteredCTA.map(({ configuration, label, imgSrc }) => (
            <DraggableCTA
              key={configuration}
              configuration={configuration}
              label={label}
              isEditing={false}
              showDescription={true}
              contentListWidth={contentListWidth}
              imgSrc={imgSrc} // Pass the image source correctly
            />
          ))}
          {filteredCTA.length === 0 && <p>No heroes found.</p>}
        </div>
    </div>
  );
};


export default CTAPanel;
