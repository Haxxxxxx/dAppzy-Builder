import React from 'react';
import DraggableWeb3Elements from '../../Elements/Structure/DraggableWeb3Elements';

const MintingPanel = () => {
  return (
    <div>
      <h3>Create New Minting Section</h3>
      <div className="bento-display-elements" style={{ marginTop: '16px' }}>
        <DraggableWeb3Elements configuration="mintingSection" isEditing={false} showDescription={true} />
      </div>
    </div>
  );
};

export default MintingPanel;
