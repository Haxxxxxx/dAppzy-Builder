// src/components/ElementsMapping/Web3Sections.js

import elementIconPaths from '../../../Mapping/elementIconPaths';
const Web3Sections = [
  {
    type: 'mintingSection',  // an internal key
    label: 'Minting Panel',
    description: 'A panel that allows token minting',
    icon: elementIconPaths.minting || '/img/minting.svg', // or your chosen icon
  },
  {
    type: 'nftGallery',
    label: 'NFT Gallery',
    description: 'Displays a gallery of NFTs',
    icon: elementIconPaths.nftGallery || '/img/nft-gallery.svg',
  },
  // add more if needed
];

export default Web3Sections;
