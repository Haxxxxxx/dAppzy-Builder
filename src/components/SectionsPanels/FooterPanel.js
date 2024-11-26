// FooterPanel.js
import React from 'react';
import DraggableFooter from '../../Elements/Structure/DraggableFooter';

const FooterPanel = ({ contentListWidth }) => {
  return (
    <div>
      <h3>Create New Footer</h3>
      <div className='bento-display-elements' style={{ marginTop: '16px' }}>
        {/* Split footer components into individual ones */}
        <DraggableFooter configuration="simple" isEditing={false} showDescription={true} contentListWidth={contentListWidth}
        />
        <DraggableFooter configuration="detailed" isEditing={false} showDescription={true} contentListWidth={contentListWidth}
        />
        {/* Add new footer based on provided template */}
        <DraggableFooter configuration="template" isEditing={false} showDescription={true} contentListWidth={contentListWidth}
        />
      </div>
    </div>
  );
};

export default FooterPanel;