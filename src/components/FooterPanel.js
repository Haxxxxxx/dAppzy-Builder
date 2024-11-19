// NavbarPanel.js
import React from 'react';
import DraggableFooter from '../Elements/Structure/DraggableFooter';

const FooterPanel = () => {
  return (
    <div>
      <h3>Create New Footer</h3>
      <div style={{ marginTop: '16px' }}>
        {/* Set 'showDescription' prop to true */}
        <DraggableFooter configuration="simple" isEditing={false} showDescription={true} />
        <DraggableFooter configuration="detailed" isEditing={false} showDescription={true} />
      </div>
    </div>
  );
};

export default FooterPanel;
