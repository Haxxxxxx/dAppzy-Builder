// NavbarPanel.js
import React from 'react';
import DraggableNavbar from '../Elements/Structure/DraggableNavbar';

const NavbarPanel = () => {
  return (
    <div>
      <h3>Create New Navbar</h3>
      <div style={{ marginTop: '16px' }}>
        {/* Set 'showDescription' prop to true */}
        <DraggableNavbar configuration="twoColumn" isEditing={false} showDescription={true} />
        <DraggableNavbar configuration="threeColumn" isEditing={false} showDescription={true} />
      </div>
    </div>
  );
};

export default NavbarPanel;
