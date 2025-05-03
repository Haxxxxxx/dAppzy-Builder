import React, { useState } from 'react';
import DraggableNavbar from '../../Elements/DraggableLayout/DraggableNavbar';

const NavbarPanel = ({ contentListWidth, searchQuery }) => {

  const navbarConfigurations = [
    { imgSrc: './img/previewcomponent.png', configuration: 'customTemplate', label: 'Custom Navbar' },
    { imgSrc: './img/previewcomponent.png', configuration: 'twoColumn', label: 'Two Column Navbar' },
    { imgSrc: './img/previewcomponent.png', configuration: 'threeColumn', label: 'Three Column Navbar' },
    { imgSrc: './img/previewcomponent.png', configuration: 'defiNavbar', label: 'DeFi Navbar' },
  ];

  // Filter navbar configurations based on search query
  const filteredNavbars = navbarConfigurations.filter((navbar) =>
    navbar.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (

    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredNavbars.map(({ configuration, label, imgSrc }) => (
        <DraggableNavbar
          key={configuration}
          configuration={configuration}
          label={label}
          isEditing={false}
          showDescription={true}
          contentListWidth={contentListWidth}
          imgSrc={imgSrc} // Pass the image source correctly
        />
      ))}
      {filteredNavbars.length === 0 && <p>No navbars found.</p>}
    </div>
  );
};

export default NavbarPanel;
