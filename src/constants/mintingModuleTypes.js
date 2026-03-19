// Single source of truth for Minting module type metadata.
// Mirrors defiModuleTypes.js pattern for consistency.

import { PLACEHOLDER_IMAGES } from '../configs/assetUrls';

export const MINTING_MODULE_TYPES = {
  minting: {
    label: 'NFT Minting',
    description: 'Mint NFTs from a collection with quantity selector',
    defaultStats: [
      { label: 'Total Supply', value: '10,000' },
      { label: 'Minted', value: '0' },
      { label: 'Price', value: '1.5 SOL' },
      { label: 'Time Left', value: '24:00:00' },
    ],
    defaultSettings: {
      showStats: true,
      showButton: true,
      customColor: '#2A2A3C',
      maxQuantity: 10,
      buttonLabel: 'Mint',
    },
  },
  gallery: {
    label: 'Rarest Items Gallery',
    description: 'Showcase rare or featured items from the collection',
    defaultStats: [],
    defaultItems: [
      { type: 'rare-item', content: PLACEHOLDER_IMAGES.builder },
      { type: 'rare-item', content: PLACEHOLDER_IMAGES.builder },
      { type: 'rare-item', content: PLACEHOLDER_IMAGES.builder },
      { type: 'rare-item', content: PLACEHOLDER_IMAGES.builder },
    ],
    defaultSettings: {
      showTitle: true,
      showDescription: true,
      customColor: '#2A2A3C',
      columnMinWidth: '200px',
    },
  },
  documents: {
    label: 'Documents',
    description: 'Display collection documents and metadata',
    defaultStats: [],
    defaultItems: [
      { type: 'document-item', content: PLACEHOLDER_IMAGES.builder },
      { type: 'document-item', content: PLACEHOLDER_IMAGES.builder },
      { type: 'document-item', content: PLACEHOLDER_IMAGES.builder },
    ],
    defaultSettings: {
      showTitle: true,
      showDescription: true,
      customColor: '#2A2A3C',
      columnMinWidth: '150px',
    },
  },
};

export const getMintingModuleLabel = (type) => MINTING_MODULE_TYPES[type]?.label || type;
export const getMintingModuleDefaults = (type) => MINTING_MODULE_TYPES[type] || MINTING_MODULE_TYPES.minting;
export const MINTING_MODULE_TYPE_LIST = Object.keys(MINTING_MODULE_TYPES);
