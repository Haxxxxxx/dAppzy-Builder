import React from 'react';
import DraggableMinting from '../../Elements/DraggableLayout/DraggableMinting';
import DraggableDeFi from '../../Elements/DraggableLayout/DraggableDeFi';

const Web3SectionPanel = ({ searchQuery }) => {
  const web3Configurations = [
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'mintingSection',
      type: 'mintingSection',
      id: 'minting-section',
      label: 'Minting Section',
      description: 'A complete NFT minting section with collection details and preview'
    },
    { 
      imgSrc: './img/previewcomponent.png', 
      configuration: 'defiSection',
      type: 'defiSection',
      id: 'defi-dashboard',
      label: 'DeFi Section',
      description: 'A complete DeFi dashboard with swap, stake, and lending capabilities'
    }
  ];

  // Filter web3 configurations based on search query
  const filteredWeb3Configurations = web3Configurations.filter((web3) =>
    web3.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    web3.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDraggableComponent = (config) => {
    switch (config.type) {
      case 'mintingSection':
        return (
          <DraggableMinting
            key={config.id}
            configuration={config.configuration}
            type={config.type}
            id={config.id}
            label={config.label}
            description={config.description}
            isEditing={false}
            showDescription={true}
            imgSrc={config.imgSrc}
          />
        );
      case 'defiSection':
        return (
          <DraggableDeFi
            key={config.id}
            configuration={config.configuration}
            type={config.type}
            id={config.id}
            label={config.label}
            description={config.description}
            isEditing={false}
            showDescription={true}
            imgSrc={config.imgSrc}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredWeb3Configurations.map((config) => renderDraggableComponent(config))}
      {filteredWeb3Configurations.length === 0 && <p>No web3 sections found.</p>}
    </div>
  );
};

export default Web3SectionPanel;
