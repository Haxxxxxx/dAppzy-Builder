import React, { useState } from 'react';
import DraggableNavbar from '../../Elements/DraggableLayout/DraggableNavbar';

const NavbarPanel = ({ contentListWidth, searchQuery }) => {

  const navbarConfigurations = [
    { imgSrc: './img/previsu-custom-navbar.png', configuration: 'customTemplateNavbar', label: 'Custom Navbar' },
    { imgSrc: './img/previsu-two-columns-navbar.png', configuration: 'twoColumn', label: 'Two Columns' },
    { imgSrc: './img/previsu-defi-navbar.png', configuration: 'defiNavbar', label: 'DeFi Navbar' },
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
