// src/components/ElementsMapping/Web3Sections.js

import elementIconPaths from '../../../Mapping/elementIconPaths';
const Web3Elements = [
  {
    type: 'connectWalletButton',  // an internal key
    label: 'Connect Wallet',
    description: 'connectWalletButton',
    icon: elementIconPaths.connectWalletButton, // or your chosen icon
  },
  {
    type: 'transactionButton',
    label: 'blinks',
    description: 'Displays a gallery of NFTs',
    icon: elementIconPaths.transactionButton ,
  },
];

export default Web3Elements;
