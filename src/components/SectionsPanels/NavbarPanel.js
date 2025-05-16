import React from 'react';
import DraggableNavbar from '../../Elements/DraggableLayout/DraggableNavbar';

const NavbarPanel = ({ contentListWidth, searchQuery, handlePanelToggle, handleOpenMediaPanel }) => {
  const navbarConfigurations = [
    { 
      imgSrc: './img/previsu-custom-navbar.png', 
      configuration: 'customTemplateNavbar', 
      type: 'navbar',
      id: 'custom-navbar',
      label: 'Custom Navbar',
      description: 'A fully customizable navigation bar with logo and menu items',
      category: 'navbar'
    },
    { 
      imgSrc: './img/previsu-two-columns-navbar.png', 
      configuration: 'twoColumn', 
      type: 'navbar',
      id: 'two-column-navbar',
      label: 'Two Columns',
      description: 'A two-column navigation layout with enhanced visual hierarchy',
      category: 'navbar'
    },
    { 
      imgSrc: './img/previsu-defi-navbar.png', 
      configuration: 'defiNavbar', 
      type: 'navbar',
      id: 'defi-navbar',
      label: 'DeFi Navbar',
      description: 'Specialized navigation bar for DeFi applications with wallet connection',
      category: 'navbar'
    }
  ];

  // Filter navbar configurations based on search query
  const filteredNavbars = navbarConfigurations.filter((navbar) =>
    navbar.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (navbar.description && navbar.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredNavbars.map((config) => (
        <DraggableNavbar
          key={config.id}
          configuration={config.configuration}
          type={config.type}
          id={config.id}
          label={config.label}
          description={config.description}
          isEditing={false}
          showDescription={true}
          contentListWidth={contentListWidth}
          imgSrc={config.imgSrc}
          handlePanelToggle={handlePanelToggle}
          handleOpenMediaPanel={handleOpenMediaPanel}
        />
      ))}
      {filteredNavbars.length === 0 && <p>No navbars found.</p>}
    </div>
  );
};

export default NavbarPanel;
