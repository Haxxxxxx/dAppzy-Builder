import React from 'react';
import DraggableContentSections from '../../Elements/DraggableLayout/DraggableContentSections';
import '../css/Sidebar.css';

const ContentSectionsPanel = ({ contentListWidth, searchQuery }) => {
  const sectionConfigurations = [
    { imgSrc: './img/previewcomponent.png', configuration: 'sectionOne', label: 'Feature Section' },
    { imgSrc: './img/previewcomponent.png', configuration: 'sectionTwo', label: 'Content Grid' },
    { imgSrc: './img/previewcomponent.png', configuration: 'sectionThree', label: 'Testimonial Section' },
    { imgSrc: './img/previewcomponent.png', configuration: 'sectionFour', label: 'Pricing Section' },
  ];

  // Filter section configurations based on the search query
  const filteredSections = sectionConfigurations.filter((section) =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredSections.map(({ configuration, label, imgSrc }) => (
        <DraggableContentSections
          key={configuration}
          configuration={configuration}
          label={label}
          isEditing={false}
          contentListWidth={contentListWidth}
          imgSrc={imgSrc}
          showDescription={true}

        />
      ))}
      {filteredSections.length === 0 && <p>No sections found.</p>}
    </div>
  );
};

export default ContentSectionsPanel;
