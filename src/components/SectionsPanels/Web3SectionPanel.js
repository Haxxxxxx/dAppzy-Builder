import React from 'react';
import DraggableWeb3Elements from '../../Elements/DraggableLayout/DraggableMinting';

const Web3SectionPanel = ({ searchQuery }) => {
  const web3Configurations = [
    { imgSrc: './previewcomponent.png', configuration: 'mintingSection', label: 'Minting Section' },
    // { imgSrc: './walletIntegration.png', configuration: 'walletIntegration', label: 'Wallet Integration' },
    // { imgSrc: './tokenomicsSection.png', configuration: 'tokenomicsSection', label: 'Tokenomics Section' },
  ];

  // Filter web3 configurations based on search query
  const filteredWeb3Configurations = web3Configurations.filter((web3) =>
    web3.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredWeb3Configurations.map(({ configuration, label, imgSrc }) => (
        <DraggableWeb3Elements
          key={configuration}
          configuration={configuration}
          label={label}
          isEditing={false}
          showDescription={true}
          imgSrc={imgSrc} // Pass the image source correctly
        />
      ))}
      {filteredWeb3Configurations.length === 0 && <p>No web3 sections found.</p>}
    </div>
  );
};

export default Web3SectionPanel;
