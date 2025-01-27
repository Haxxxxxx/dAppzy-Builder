// src/components/ElementsMapping/Web3Sections.js

import elementIconPaths from '../../../Mapping/elementIconPaths';
const Web3Elements = [
  {
    type: 'connectWalletButton',  // an internal key
    label: 'connectWalletButton',
    description: 'connectWalletButton',
    icon: elementIconPaths.connectWalletButton, // or your chosen icon
  },
  {
    type: 'transactionButton',
    label: 'transactionButton',
    description: 'Displays a gallery of NFTs',
    icon: elementIconPaths.transactionButton ,
  },
  // add more if needed
];

export default Web3Elements;
