import React, { useState } from 'react';
import DraggableFooter from '../../Elements/DraggableLayout/DraggableFooter';

const FooterPanel = ({ contentListWidth, searchQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State to manage collapse/expand

  const footerConfigurations = [
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'customTemplateFooter', 
      label: 'Simple Footer',
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'detailedFooter', 
      label: 'Detailed Footer',
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'templateFooter', 
      label: 'Advanced Footer',
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'defiFooter', 
      label: 'DeFi Footer',
    },
  ];

  // Filter footer configurations based on search query
  const filteredFooters = footerConfigurations.filter((footer) =>
    footer.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
        <div className="bento-display-elements" style={{ marginTop: '16px' }}>
          {filteredFooters.map(({ configuration, label, imgSrc, description }) => (
            <DraggableFooter
              key={configuration}
              configuration={configuration}
              label={label}
              isEditing={false}
              showDescription={true}
              contentListWidth={contentListWidth}
              imgSrc={imgSrc}
              description={description}
            />
          ))}
          {filteredFooters.length === 0 && <p>No footers found.</p>}
        </div>
    </div>
  );
};

export default FooterPanel;
