import React from 'react';
import DraggableWeb3Elements from '../../Elements/DraggableElements/DraggableWeb3Elements';

const MintingPanel = () => {
  return (
    <div>
      <div className="bento-display-elements" style={{ marginTop: '16px' }}>
        <DraggableWeb3Elements configuration="mintingSection" isEditing={false} showDescription={true} />
      </div>
    </div>
  );
};

export default MintingPanel;
