import React from 'react';
import DraggableElement from '../../Elements/Structure/DraggableElement';
import '../css/Sidebar.css';

import elementIconPaths from '../../Mapping/elementIconPaths';

const Web3ElementPanel = ({ searchQuery }) => {
  const web3Elements = [
    {
      category: 'Blockchain Elements',
      items: [
        {
          type: 'connectWalletButton',
          label: 'Wallet Connect',
          description: 'Integrate wallet connection functionality.',
          icon: elementIconPaths.connectWalletButton,
        },
        {
          type: 'transactionButton',
          label: 'Transaction Button',
          description: 'Trigger on-chain transactions.',
          icon: elementIconPaths.transactionButton,

        },
      ],
    },
    {
      category: 'Decentralized Identity',
      items: [],
    },
    {
      category: 'Storage and File Management',
      items: [],
    },
  ];

  // Filter Web3 elements based on search query
  const filteredWeb3Elements = web3Elements
    .map(({ category, items }) => ({
      category,
      items: items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div>
      {filteredWeb3Elements.map(({ category, items }) => (
        <div key={category} className="content-section">
          <div className="bento-display-elements">
            {items.map((item) => (
              <DraggableElement
                key={item.type}
                type={item.type}
                label={item.label}
                description={item.description}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Web3ElementPanel;
