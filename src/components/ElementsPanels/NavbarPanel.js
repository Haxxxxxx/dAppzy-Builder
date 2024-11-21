import React, {useEffect} from 'react';
import DraggableNavbar from '../../Elements/Structure/DraggableNavbar';

const NavbarPanel = ({ contentListWidth }) => {
  useEffect(() => {
    console.log('NavbarPanel contentListWidth:', contentListWidth);
  }, [contentListWidth]);

  return (
    <div>
      <h3>Create New Navbar</h3>
      <div className='bento-display-elements' style={{ marginTop: '16px' }}>
        <DraggableNavbar
          configuration="twoColumn"
          isEditing={false}
          showDescription={true}
          contentListWidth={contentListWidth}
        />
        <DraggableNavbar
          configuration="threeColumn"
          isEditing={false}
          showDescription={true}
          contentListWidth={contentListWidth}
        />
        <DraggableNavbar
          configuration="customTemplate"
          isEditing={false}
          showDescription={true}
          contentListWidth={contentListWidth}
        />
      </div>
    </div>
  );
};


export default NavbarPanel;
