import React, { useEffect } from 'react';
import DraggableElement from '../../Elements/Structure/DraggableElement';
import '../css/Sidebar.css';

const Web3ElementPanel = ({ contentListWidth}) => {
  useEffect(() => {
    console.log(contentListWidth);
  }, [contentListWidth]);

  return (
    <div>
      <div className="panel-header">Web3 Elements</div>

      {/* Blockchain Elements Section */}
      <div className="content-section">
        <h4>Blockchain Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="connectWalletButton" label="Wallet Connect" description="Integrate wallet connection functionality." />
          <DraggableElement type="transactionButton" label="Transaction Button" description="Trigger on-chain transactions." />
          <DraggableElement type="tokenDisplay" label="Token Display" description="Display token balances or prices." />
          <DraggableElement type="nftGrid" label="NFT Grid" description="Display a collection of NFTs in a grid format." />
          <DraggableElement type="contractInteraction" label="Contract Interaction" description="Execute smart contract methods." />
        </div>
      </div>

      {/* Decentralized Identity Section */}
      <div className="content-section">
        <h4>Decentralized Identity</h4>
        <div className="bento-display-elements">
          <DraggableElement type="didDisplay" label="DID Display" description="Show decentralized identity information." />
          <DraggableElement type="profileBadge" label="Profile Badge" description="Display user profile linked to DID." />
          <DraggableElement type="credentialList" label="Credential List" description="Show verifiable credentials." />
        </div>
      </div>

      {/* Storage and File Management Section */}
      <div className="content-section">
        <h4>Storage and File Management</h4>
        <div className="bento-display-elements">
          <DraggableElement type="ipfsUploader" label="IPFS Uploader" description="Upload files to IPFS." />
          <DraggableElement type="ipfsViewer" label="IPFS Viewer" description="Display files stored on IPFS." />
          <DraggableElement type="arweaveUploader" label="Arweave Uploader" description="Upload files to Arweave." />
          <DraggableElement type="arweaveViewer" label="Arweave Viewer" description="Display files stored on Arweave." />
        </div>
      </div>

      {/* Governance and DAO Elements */}
      <div className="content-section">
        <h4>Governance and DAOs</h4>
        <div className="bento-display-elements">
          <DraggableElement type="votingModule" label="Voting Module" description="Add on-chain voting functionality." />
          <DraggableElement type="proposalList" label="Proposal List" description="Display DAO proposals and statuses." />
          <DraggableElement type="membershipBadge" label="Membership Badge" description="Show DAO membership badges." />
        </div>
      </div>

      {/* Analytics and Data Visualization Section */}
      <div className="content-section">
        <h4>Analytics and Data Visualization</h4>
        <div className="bento-display-elements">
          <DraggableElement type="blockchainStats" label="Blockchain Stats" description="Display live blockchain statistics." />
          <DraggableElement type="tokenChart" label="Token Chart" description="Visualize token price changes." />
          <DraggableElement type="transactionHistory" label="Transaction History" description="Display recent user transactions." />
        </div>
      </div>

      {/* Smart Contract Elements Section */}
      <div className="content-section">
        <h4>Smart Contract Elements</h4>
        <div className="bento-display-elements">
          <DraggableElement type="contractMethodCaller" label="Method Caller" description="Interact with a specific contract method." />
          <DraggableElement type="contractEventListener" label="Event Listener" description="Listen for smart contract events." />
          <DraggableElement type="contractDataDisplay" label="Data Display" description="Show data fetched from a smart contract." />
        </div>
      </div>
    </div>
  );

};

export default Web3ElementPanel;
