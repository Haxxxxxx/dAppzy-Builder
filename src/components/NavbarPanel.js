import React from 'react';
import DraggableNavbar from '../Elements/Structure/DraggableNavbar';

const NavbarPanel = () => {
  return (
    <div>
      <h3>Create New Navbar</h3>
      <div style={{ marginTop: '16px' }}>
        <DraggableNavbar configuration="twoColumn" isEditing={false} showDescription={true} />
        <DraggableNavbar configuration="threeColumn" isEditing={false} showDescription={true} />
        {/* New Custom Template Navbar */}
        <DraggableNavbar configuration="customTemplate" isEditing={false} showDescription={true} />
      </div>
    </div>
  );
};

export default NavbarPanel;
