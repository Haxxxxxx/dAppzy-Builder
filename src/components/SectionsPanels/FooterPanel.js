import React, { useState } from 'react';
import DraggableFooter from '../../Elements/DraggableLayout/DraggableFooter';

const FooterPanel = ({ contentListWidth, searchQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State to manage collapse/expand

  const footerConfigurations = [
    { imgSrc: './img/previewcomponent.png', configuration: 'template', label: 'Template Footer' },
    { imgSrc: './img/previewcomponent.png', configuration: 'simple', label: 'Simple Footer' },
    { imgSrc: './img/previewcomponent.png', configuration: 'detailed', label: 'Detailed Footer' },
  ];

  // Filter footer configurations based on search query
  const filteredFooters = footerConfigurations.filter((footer) =>
    footer.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
        <div className="bento-display-elements" style={{ marginTop: '16px' }}>
          {filteredFooters.map(({ configuration, label, imgSrc }) => (
            <DraggableFooter
              key={configuration}
              configuration={configuration}
              label={label}
              isEditing={false}
              showDescription={true}
              contentListWidth={contentListWidth}
              imgSrc={imgSrc} // Pass the image source correctly
            />
          ))}
          {filteredFooters.length === 0 && <p>No footers found.</p>}
        </div>
    </div>
  );
};

export default FooterPanel;
