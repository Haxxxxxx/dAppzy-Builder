// Single source of truth for DeFi module type metadata.
// Import from here instead of hardcoding labels across settings/rendering files.

export const DEFI_MODULE_TYPES = {
  aggregator: {
    label: 'Pool Aggregator',
    description: 'Access multiple DeFi protocols through a single interface',
    defaultStats: [
      { label: 'Connected Wallet', value: 'Not Connected' },
      { label: 'Total Pools', value: '--' },
      { label: 'Total Value Locked', value: '--' },
      { label: 'Best APY', value: '--' },
    ],
    defaultSettings: {
      showStats: true,
      showButton: true,
      customColor: '#2A2A3C',
      supportedChains: [],
      selectedTokens: [],
    },
  },
  simulation: {
    label: 'Investment Simulator',
    description: 'Simulate different investment strategies',
    defaultStats: [
      { label: 'Investment Range', value: '$10,000' },
      { label: 'Supported Assets', value: '20+' },
      { label: 'Historical Data', value: '5 Years' },
    ],
    defaultSettings: {
      showStats: true,
      showButton: true,
      customColor: '#2A2A3C',
      simulationBalance: 10000,
      timeRange: '5Y',
    },
  },
  bridge: {
    label: 'Cross-Chain Bridge',
    description: 'Transfer assets between different blockchains',
    defaultStats: [
      { label: 'Supported Chains', value: '--' },
      { label: 'Transfer Time', value: '--' },
      { label: 'Security Score', value: '--' },
    ],
    defaultSettings: {
      showStats: true,
      showButton: true,
      customColor: '#2A2A3C',
    },
  },
};

export const getModuleLabel = (type) => DEFI_MODULE_TYPES[type]?.label || type;
export const getModuleDefaults = (type) => DEFI_MODULE_TYPES[type] || DEFI_MODULE_TYPES.aggregator;
export const DEFI_MODULE_TYPE_LIST = Object.keys(DEFI_MODULE_TYPES);
