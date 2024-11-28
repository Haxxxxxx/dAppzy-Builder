import React from 'react';
import DraggableMintingSection from '../../Elements/Structure/DraggableMintingSection';

const MintingPanel = () => {
  return (
    <div>
      <h3>Create New Minting Section</h3>
      <div className="bento-display-elements" style={{ marginTop: '16px' }}>
        <DraggableMintingSection configuration="mintingSection" isEditing={false} showDescription={true} />
      </div>
    </div>
  );
};

export default MintingPanel;
