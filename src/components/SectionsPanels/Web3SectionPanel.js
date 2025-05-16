import React from 'react';
import DraggableMinting from '../../Elements/DraggableLayout/DraggableMinting';
import DraggableDeFi from '../../Elements/DraggableLayout/DraggableDeFi';
import '../css/Sidebar.css';

const Web3SectionPanel = ({ contentListWidth, searchQuery, handlePanelToggle, handleOpenMediaPanel }) => {
  const web3Configurations = [
    { 
      imgSrc: './img/previsu-defi-dashboard.png', 
      configuration: 'defiSection',
      type: 'defiSection',
      id: 'defi-dashboard',
      label: 'DeFi Dashboard',
      description: 'A comprehensive DeFi dashboard section with real-time data display',
      category: 'web3'
    },
    {
      imgSrc: './img/previewcomponent.png', 
      configuration: 'mintingSection',
      type: 'mintingSection',
      id: 'minting-dashboard',
      label: 'Minting Section',
      description: 'A powerful minting section for NFT creation and management',
      category: 'web3'
    },
   
  ];

  // Filter web3 configurations based on search query
  const filteredWeb3Configurations = web3Configurations.filter((web3) =>
    web3.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (web3.description && web3.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bento-display-elements" style={{ marginTop: '16px' }}>
      {filteredWeb3Configurations.map((config) => {
        const Component = config.type === 'defiSection' ? DraggableDeFi : DraggableMinting;
        return (
          <Component
            key={config.id}
            configuration={config.configuration}
            type={config.type}
            id={config.id}
            label={config.label}
            description={config.description}
            isEditing={false}
            showDescription={true}
            contentListWidth={contentListWidth}
            imgSrc={config.imgSrc}
            handlePanelToggle={handlePanelToggle}
            handleOpenMediaPanel={handleOpenMediaPanel}
          />
        );
      })}
      {filteredWeb3Configurations.length === 0 && <p>No web3 sections found.</p>}
    </div>
  );
};

export default Web3SectionPanel;
