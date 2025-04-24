import React, { useContext, useRef, useEffect, useState } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';
import { Image, Span, Button, DeFiModule } from '../../SelectableElements';
import { mintingSectionStyles } from './DefaultWeb3Styles';
import useElementDrop from '../../../utils/useElementDrop';

// Default modules with specific functionality
const defaultModules = [
  {
    id: 'defiModule1',
    type: 'defiModule',
    moduleType: 'aggregator',
    content: {
      title: 'DeFi Aggregator',
      description: 'Access multiple DeFi protocols through a single interface',
      stats: [
        { label: 'Connected Wallet', value: 'Not Connected' },
        { label: 'Total Pools', value: 'Loading...' },
        { label: 'Total Value Locked', value: '$0' },
        { label: 'Best APY', value: 'Not Connected' }
      ],
      settings: {
        showStats: true,
        showButton: true,
        customColor: '#2A2A3C'
      },
      functionality: {
        type: 'aggregator',
        actions: []
      },
      enabled: true
    }
  },
  {
    id: 'defiModule2',
    type: 'defiModule',
    moduleType: 'simulation',
    content: {
      title: 'Investment Simulator',
      description: 'Simulate different investment strategies',
      stats: [
        { label: 'Investment Range', value: '$10,000' },
        { label: 'Supported Assets', value: '20+' },
        { label: 'Historical Data', value: '5 Years' }
      ],
      settings: {
        showStats: true,
        showButton: true,
        customColor: '#2A2A3C'
      },
      functionality: {
        type: 'simulation',
        actions: []
      },
      enabled: true
    }
  },
  {
    id: 'defiModule3',
    type: 'defiModule',
    moduleType: 'bridge',
    content: {
      title: 'Cross-Chain Bridge',
      description: 'Transfer assets between different blockchains',
      stats: [
        { label: 'Supported Chains', value: 'Select Chain' },
        { label: 'Transfer Time', value: 'Select Chain' },
        { label: 'Security Score', value: '0.1%' }
      ],
      settings: {
        showStats: true,
        showButton: true,
        customColor: '#2A2A3C'
      },
      functionality: {
        type: 'bridge',
        actions: []
      },
      enabled: true
    }
  }
];

// Mock data for testing
const mockPools = [
  { name: 'USDC-USDT', apy: 5.2, tvl: 1000000, tokenA: 'USDC', tokenB: 'USDT' },
  { name: 'SOL-USDC', apy: 8.5, tvl: 2500000, tokenA: 'SOL', tokenB: 'USDC' },
  { name: 'ETH-USDC', apy: 6.8, tvl: 1800000, tokenA: 'ETH', tokenB: 'USDC' }
];

const mockPositions = [
  { poolId: 'USDC-USDT', amount: 1000, earnings: 50 },
  { poolId: 'SOL-USDC', amount: 500, earnings: 25 }
];

const mockHistoricalData = {
  investments: [1000, 2000, 3000],
  portfolio: {
    currentValue: 5000,
    dailyChange: 2.5,
    weeklyChange: 5.8,
    monthlyChange: 12.3
  }
};

const mockMarketAnalysis = {
  supportedAssets: ['USDC', 'USDT', 'SOL', 'ETH', 'BTC'],
  strategies: [
    { name: 'Conservative', minApy: 3.5, maxApy: 5.0, riskLevel: 'Low' },
    { name: 'Balanced', minApy: 5.0, maxApy: 8.0, riskLevel: 'Medium' },
    { name: 'Aggressive', minApy: 8.0, maxApy: 12.0, riskLevel: 'High' }
  ]
};

const mockBridgeData = {
  supportedChains: ['Ethereum', 'Solana', 'Polygon'],
  transferTimes: [5, 8, 10],
  securityScores: [0.95, 0.92, 0.89],
  transfers: [
    { sourceChain: 'Ethereum', destinationChain: 'Solana', amount: 1000, status: 'Completed' },
    { sourceChain: 'Solana', destinationChain: 'Polygon', amount: 500, status: 'Pending' }
  ],
  fees: {
    ethereum: 0.001,
    solana: 0.0005,
    polygon: 0.0003
  }
};

// API endpoints
const RAYDIUM_API = 'https://api.raydium.io/v2';
const ORCA_API = 'https://api.orca.so/v1';
const SABER_API = 'https://api.saber.so/v1';
const DEFI_HISTORY_API = 'https://api.defi-history.com/v1';
const DEFI_MARKET_API = 'https://api.defi-market.com/v1';
const WORMHOLE_API = 'https://api.wormhole.com/v1';
const ALLBRIDGE_API = 'https://api.allbridge.com/v1';

// Fallback data
const fallbackPools = [
  { name: 'USDC-USDT', apy: 5.2, tvl: 1000000, tokenA: 'USDC', tokenB: 'USDT' },
  { name: 'SOL-USDC', apy: 8.5, tvl: 2500000, tokenA: 'SOL', tokenB: 'USDC' },
  { name: 'ETH-USDC', apy: 6.8, tvl: 1800000, tokenA: 'ETH', tokenB: 'USDC' }
];

const fallbackPositions = [
  { poolId: 'USDC-USDT', amount: 1000, earnings: 50 },
  { poolId: 'SOL-USDC', amount: 500, earnings: 25 }
];

const fallbackHistoricalData = {
  investments: [1000, 2000, 3000],
  portfolio: {
    currentValue: 5000,
    dailyChange: 2.5,
    weeklyChange: 5.8,
    monthlyChange: 12.3
  }
};

const fallbackMarketAnalysis = {
  supportedAssets: ['USDC', 'USDT', 'SOL', 'ETH', 'BTC'],
  strategies: [
    { name: 'Conservative', minApy: 3.5, maxApy: 5.0, riskLevel: 'Low' },
    { name: 'Balanced', minApy: 5.0, maxApy: 8.0, riskLevel: 'Medium' },
    { name: 'Aggressive', minApy: 8.0, maxApy: 12.0, riskLevel: 'High' }
  ]
};

const fallbackBridgeData = {
  supportedChains: ['Ethereum', 'Solana', 'Polygon'],
  transferTimes: [5, 8, 10],
  securityScores: [0.95, 0.92, 0.89],
  transfers: [
    { sourceChain: 'Ethereum', destinationChain: 'Solana', amount: 1000, status: 'Completed' },
    { sourceChain: 'Solana', destinationChain: 'Polygon', amount: 500, status: 'Pending' }
  ],
  fees: {
    ethereum: 0.001,
    solana: 0.0005,
    polygon: 0.0003
  }
};

const DeFiSection = React.memo(({
  handleSelect,
  uniqueId,
  onDropItem,
  handleOpenMediaPanel,
  type = 'defiSection'
}) => {
  const { elements, setSelectedElement, updateContent, addNewElement } = useContext(EditableContext);
  const { walletAddress, balance, isConnected, isLoading, walletId } = useWalletContext();
  const [defiData, setDefiData] = useState({
    totalPools: 'Loading...',
    totalValueLocked: '$0',
    bestAPY: 'Not Connected',
    investmentRange: '$10,000',
    supportedAssets: '20+',
    historicalData: '5 Years',
    supportedChains: 'Select Chain',
    transferTime: 'Select Chain',
    securityScore: '0.1%'
  });
  const sectionRef = useRef(null);
  const { isOverCurrent, drop } = useElementDrop({
    id: uniqueId,
    elementRef: sectionRef,
    onDropItem,
  });

  // Memoize child elements
  const childElements = React.useMemo(() => {
    const filtered = elements?.filter((el) => el.parentId === uniqueId) || [];
    return filtered;
  }, [elements, uniqueId]);

  // Memoize helper functions
  const getChildByType = React.useCallback((type) => {
    return childElements?.find((child) => child.type === type) || null;
  }, [childElements]);

  const getChildrenByType = React.useCallback((type) => {
    return childElements?.filter((child) => child.type === type) || [];
  }, [childElements]);

  // Memoize retrieved elements
  const logo = React.useMemo(() => getChildByType('logo'), [getChildByType]);
  const title = React.useMemo(() => getChildByType('title'), [getChildByType]);
  const description = React.useMemo(() => getChildByType('description'), [getChildByType]);
  const modules = React.useMemo(() => getChildrenByType('defiModule') || [], [getChildrenByType]);

  // Memoize parseModuleContent
  const parseModuleContent = React.useCallback((module) => {
    try {
      if (!module?.content) {
        const moduleIndex = modules?.findIndex(m => m.id === module.id) || -1;
        const moduleType = ['aggregator', 'simulation', 'bridge'][moduleIndex] || 'default';
        const defaultModule = defaultModules.find(m => m.moduleType === moduleType);
        
        if (defaultModule) {
          return defaultModule.content;
        }
      }

      const parsedContent = typeof module.content === 'string' 
        ? JSON.parse(module.content) 
        : module.content;
      
      // Ensure stats is in array format
      if (parsedContent.stats && !Array.isArray(parsedContent.stats)) {
        parsedContent.stats = Object.entries(parsedContent.stats).map(([label, value]) => ({
          label,
          value
        }));
      }
      
      return parsedContent;
    } catch (e) {
      console.error('Error parsing module content:', e);
      const moduleIndex = modules?.findIndex(m => m.id === module.id) || -1;
      const moduleType = ['aggregator', 'simulation', 'bridge'][moduleIndex] || 'default';
      const defaultModule = defaultModules.find(m => m.moduleType === moduleType);
      
      return defaultModule ? defaultModule.content : {
        title: moduleType === 'aggregator' ? 'DeFi Aggregator' :
               moduleType === 'simulation' ? 'Investment Simulator' :
               moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
        stats: moduleType === 'aggregator' ? [
          { label: 'Connected Wallet', value: 'Not Connected' },
          { label: 'Total Pools', value: 'Loading...' },
          { label: 'Total Value Locked', value: '$0' },
          { label: 'Best APY', value: 'Not Connected' }
        ] : moduleType === 'simulation' ? [
          { label: 'Investment Range', value: '$10,000' },
          { label: 'Supported Assets', value: '20+' },
          { label: 'Historical Data', value: '5 Years' }
        ] : moduleType === 'bridge' ? [
          { label: 'Supported Chains', value: 'Select Chain' },
          { label: 'Transfer Time', value: 'Select Chain' },
          { label: 'Security Score', value: '0.1%' }
        ] : [],
        settings: {
          showStats: true,
          showButton: true,
          customColor: '#2A2A3C'
        },
        functionality: {
          type: moduleType,
          actions: []
        },
        enabled: true
      };
    }
  }, [modules]);

  // Debug logs for wallet connection changes
  useEffect(() => {
    console.log('Wallet connection state changed:', { isConnected, walletId, walletAddress });
  }, [isConnected, walletId, walletAddress]);

  // Update DeFi data when wallet connection changes
  useEffect(() => {
    console.log('Checking wallet connection for data fetch:', { isConnected, walletId, walletAddress });
    
    if (isConnected && walletId && walletAddress) {
      console.log('Wallet connected, fetching DeFi data for:', { walletId, walletAddress });
      fetchDefiData(walletId);
    } else {
      console.log('Resetting DeFi data - wallet not connected or missing data:', { isConnected, walletId, walletAddress });
      // Reset to default values when disconnected
      setDefiData({
        totalPools: 'Not Connected',
        totalValueLocked: '$0',
        bestAPY: 'Not Connected',
        investmentRange: '$10,000',
        supportedAssets: '20+',
        historicalData: '5 Years',
        supportedChains: 'Select Chain',
        transferTime: 'Select Chain',
        securityScore: '0.1%'
      });
    }
  }, [isConnected, walletId, walletAddress]);

  const fetchDefiData = async (walletId) => {
    console.log('Starting DeFi data fetch for wallet:', walletId);
    try {
      // Fetch real data from various sources
      const [
        aggregatorData,
        simulationData,
        bridgeData
      ] = await Promise.all([
        fetchAggregatorData(walletId),
        fetchSimulationData(walletId),
        fetchBridgeData(walletId)
      ]);

      const newDefiData = {
        // Aggregator Module Data
        totalPools: aggregatorData.totalPools,
        totalValueLocked: aggregatorData.totalValueLocked,
        bestAPY: aggregatorData.bestAPY,
        userStakedAmount: aggregatorData.userStakedAmount,
        userEarnings: aggregatorData.userEarnings,
        topPerformingPools: aggregatorData.topPools,
        
        // Simulation Module Data
        investmentRange: simulationData.investmentRange,
        supportedAssets: simulationData.supportedAssets,
        historicalData: simulationData.historicalData,
        userPortfolio: simulationData.portfolio,
        recommendedStrategies: simulationData.strategies,
        
        // Bridge Module Data
        supportedChains: bridgeData.supportedChains,
        transferTime: bridgeData.transferTime,
        securityScore: bridgeData.securityScore,
        recentTransfers: bridgeData.recentTransfers,
        bridgeFees: bridgeData.fees
      };

      console.log('Updating DeFi data with real data:', newDefiData);
      setDefiData(newDefiData);

      // Update module content with new data
      const modules = elements?.filter(el => el.type === 'defiModule') || [];
      if (modules.length > 0) {
        console.log('Updating module content with new data for modules:', modules);
        modules.forEach(module => {
          try {
            // Initialize default content if empty
            let moduleContent;
            if (!module.content || module.content === '') {
              const moduleIndex = modules.indexOf(module);
              const moduleType = ['aggregator', 'simulation', 'bridge'][moduleIndex] || 'default';
              
              moduleContent = {
                id: module.id,
                moduleType: moduleType,
                title: moduleType === 'aggregator' ? 'DeFi Aggregator' :
                       moduleType === 'simulation' ? 'Investment Simulator' :
                       moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
                stats: [],
                settings: {
                  showStats: true,
                  showButton: true,
                  customColor: '#2A2A3C'
                },
                functionality: {
                  type: moduleType,
                  actions: []
                }
              };
            } else {
              moduleContent = typeof module.content === 'string' ? JSON.parse(module.content) : module.content;
            }
            
            const moduleType = moduleContent.moduleType || 'default';
            
            let updatedContent = {
              ...moduleContent,
              stats: []
            };

            // Customize stats based on module type
            switch (moduleType) {
              case 'aggregator':
                updatedContent.stats = [
                  { label: 'Connected Wallet', value: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` },
                  { label: 'Total Pools', value: newDefiData.totalPools },
                  { label: 'Total Value Locked', value: newDefiData.totalValueLocked },
                  { label: 'Best APY', value: newDefiData.bestAPY },
                  { label: 'Your Staked Amount', value: newDefiData.userStakedAmount },
                  { label: 'Your Earnings', value: newDefiData.userEarnings }
                ];
                updatedContent.topPools = newDefiData.topPerformingPools;
                break;

              case 'simulation':
                updatedContent.stats = [
                  { label: 'Portfolio Value', value: newDefiData.userPortfolio.totalValue },
                  { label: '24h Change', value: newDefiData.userPortfolio.dailyChange },
                  { label: '7d Change', value: newDefiData.userPortfolio.weeklyChange },
                  { label: '30d Change', value: newDefiData.userPortfolio.monthlyChange },
                  { label: 'Supported Assets', value: newDefiData.supportedAssets },
                  { label: 'Historical Data', value: newDefiData.historicalData }
                ];
                updatedContent.strategies = newDefiData.recommendedStrategies;
                break;

              case 'bridge':
                updatedContent.stats = [
                  { label: 'Supported Chains', value: newDefiData.supportedChains },
                  { label: 'Transfer Time', value: newDefiData.transferTime },
                  { label: 'Security Score', value: newDefiData.securityScore },
                  { label: 'ETH Bridge Fee', value: newDefiData.bridgeFees.ethereum },
                  { label: 'SOL Bridge Fee', value: newDefiData.bridgeFees.solana },
                  { label: 'MATIC Bridge Fee', value: newDefiData.bridgeFees.polygon }
                ];
                updatedContent.recentTransfers = newDefiData.recentTransfers;
                break;

              default:
                updatedContent.stats = moduleContent.stats || [];
            }

            updateContent(module.id, JSON.stringify(updatedContent));
            console.log('Updated module content for:', module.id);
          } catch (error) {
            console.error('Error updating module content:', error);
            // Set error state for the module
            const errorContent = {
              id: module.id,
              moduleType: module.configuration?.moduleType || 'default',
              title: 'Error Module',
              stats: [
                { label: 'Error', value: 'Failed to load module data' }
              ],
              settings: {
                showStats: true,
                showButton: false,
                customColor: '#ff0000'
              }
            };
            updateContent(module.id, JSON.stringify(errorContent));
          }
        });
      } else {
        console.log('No DeFi modules found to update');
      }
    } catch (error) {
      console.error('Error fetching DeFi data:', error);
      // Set error states
      setDefiData({
        totalPools: 'Error',
        totalValueLocked: 'Error',
        bestAPY: 'Error',
        investmentRange: 'Error',
        supportedAssets: 'Error',
        historicalData: 'Error',
        supportedChains: 'Error',
        transferTime: 'Error',
        securityScore: 'Error'
      });
    }
  };

  // Helper function to fetch aggregator data
  const fetchAggregatorData = async (walletId) => {
    try {
      // Fetch data from various DeFi protocols
      const [raydiumData, orcaData, saberData] = await Promise.all([
        fetchRaydiumData(walletId),
        fetchOrcaData(walletId),
        fetchSaberData(walletId)
      ]);

      // Combine and process data from different protocols
      const allPools = [...raydiumData.pools, ...orcaData.pools, ...saberData.pools];
      const userPositions = [...raydiumData.positions, ...orcaData.positions, ...saberData.positions];

      return {
        totalPools: allPools.length.toString(),
        totalValueLocked: formatUSD(calculateTotalValueLocked(allPools)),
        bestAPY: findBestAPY(allPools),
        userStakedAmount: formatUSD(calculateUserStakedAmount(userPositions)),
        userEarnings: formatUSD(calculateUserEarnings(userPositions)),
        topPools: getTopPerformingPools(allPools)
      };
    } catch (error) {
      console.error('Error fetching aggregator data:', error);
      throw error;
    }
  };

  // Helper function to fetch simulation data
  const fetchSimulationData = async (walletId) => {
    try {
      // Fetch historical data and market analysis
      const [historicalData, marketAnalysis] = await Promise.all([
        fetchHistoricalData(walletId),
        fetchMarketAnalysis()
      ]);

      return {
        investmentRange: calculateInvestmentRange(historicalData),
        supportedAssets: getSupportedAssets(marketAnalysis),
        historicalData: formatHistoricalDataRange(historicalData),
        portfolio: calculatePortfolioMetrics(historicalData),
        strategies: generateRecommendedStrategies(marketAnalysis, historicalData)
      };
    } catch (error) {
      console.error('Error fetching simulation data:', error);
      throw error;
    }
  };

  // Helper function to fetch bridge data
  const fetchBridgeData = async (walletId) => {
    try {
      // Fetch data from various bridge protocols
      const [wormholeData, allbridgeData] = await Promise.all([
        fetchWormholeData(walletId),
        fetchAllbridgeData(walletId)
      ]);

      return {
        supportedChains: getSupportedChains([wormholeData, allbridgeData]),
        transferTime: calculateAverageTransferTime([wormholeData, allbridgeData]),
        securityScore: calculateSecurityScore([wormholeData, allbridgeData]),
        recentTransfers: getRecentTransfers(walletId, [wormholeData, allbridgeData]),
        fees: calculateBridgeFees([wormholeData, allbridgeData])
      };
    } catch (error) {
      console.error('Error fetching bridge data:', error);
      throw error;
    }
  };

  // Helper function to fetch data with retry and timeout
  const fetchWithRetry = async (url, options = {}, retries = 3, timeout = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  // Protocol-specific data fetching functions
  const fetchRaydiumData = async (walletId) => {
    try {
      const [poolsData, positionsData] = await Promise.all([
        fetchWithRetry(`${RAYDIUM_API}/pools`),
        fetchWithRetry(`${RAYDIUM_API}/positions/${walletId}`)
      ]);

      return {
        pools: poolsData.pools.map(pool => ({
          name: pool.name,
          apy: pool.apy,
          tvl: pool.tvl,
          tokenA: pool.tokenA,
          tokenB: pool.tokenB
        })),
        positions: positionsData.positions.map(pos => ({
          poolId: pos.poolId,
          amount: pos.amount,
          earnings: pos.earnings
        }))
      };
    } catch (error) {
      console.error('Error fetching Raydium data:', error);
      return {
        pools: fallbackPools,
        positions: fallbackPositions
      };
    }
  };

  const fetchOrcaData = async (walletId) => {
    try {
      const [poolsData, positionsData] = await Promise.all([
        fetchWithRetry(`${ORCA_API}/pools`),
        fetchWithRetry(`${ORCA_API}/positions/${walletId}`)
      ]);

      return {
        pools: poolsData.pools.map(pool => ({
          name: pool.name,
          apy: pool.apy,
          tvl: pool.tvl,
          tokenA: pool.tokenA,
          tokenB: pool.tokenB
        })),
        positions: positionsData.positions.map(pos => ({
          poolId: pos.poolId,
          amount: pos.amount,
          earnings: pos.earnings
        }))
      };
    } catch (error) {
      console.error('Error fetching Orca data:', error);
      return {
        pools: fallbackPools,
        positions: fallbackPositions
      };
    }
  };

  const fetchSaberData = async (walletId) => {
    try {
      const [poolsData, positionsData] = await Promise.all([
        fetchWithRetry(`${SABER_API}/pools`),
        fetchWithRetry(`${SABER_API}/positions/${walletId}`)
      ]);

      return {
        pools: poolsData.pools.map(pool => ({
          name: pool.name,
          apy: pool.apy,
          tvl: pool.tvl,
          tokenA: pool.tokenA,
          tokenB: pool.tokenB
        })),
        positions: positionsData.positions.map(pos => ({
          poolId: pos.poolId,
          amount: pos.amount,
          earnings: pos.earnings
        }))
      };
    } catch (error) {
      console.error('Error fetching Saber data:', error);
      return {
        pools: fallbackPools,
        positions: fallbackPositions
      };
    }
  };

  const fetchHistoricalData = async (walletId) => {
    try {
      const data = await fetchWithRetry(`${DEFI_HISTORY_API}/wallet/${walletId}`);
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return fallbackHistoricalData;
    }
  };

  const fetchMarketAnalysis = async () => {
    try {
      const data = await fetchWithRetry(`${DEFI_MARKET_API}/analysis`);
      return data;
    } catch (error) {
      console.error('Error fetching market analysis:', error);
      return fallbackMarketAnalysis;
    }
  };

  const fetchWormholeData = async (walletId) => {
    try {
      const data = await fetchWithRetry(`${WORMHOLE_API}/transfers/${walletId}`);
      return data;
    } catch (error) {
      console.error('Error fetching Wormhole data:', error);
      return fallbackBridgeData;
    }
  };

  const fetchAllbridgeData = async (walletId) => {
    try {
      const data = await fetchWithRetry(`${ALLBRIDGE_API}/transfers/${walletId}`);
      return data;
    } catch (error) {
      console.error('Error fetching Allbridge data:', error);
      return fallbackBridgeData;
    }
  };

  // Data processing helper functions
  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotalValueLocked = (pools) => {
    return pools.reduce((total, pool) => total + pool.tvl, 0);
  };

  const findBestAPY = (pools) => {
    const bestPool = pools.reduce((best, pool) => 
      pool.apy > best.apy ? pool : best
    );
    return `${bestPool.apy.toFixed(2)}%`;
  };

  const calculateUserStakedAmount = (positions) => {
    return positions.reduce((total, position) => total + position.amount, 0);
  };

  const calculateUserEarnings = (positions) => {
    return positions.reduce((total, position) => total + position.earnings, 0);
  };

  const getTopPerformingPools = (pools) => {
    return pools
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 3)
      .map(pool => ({
        name: pool.name,
        apy: `${pool.apy.toFixed(2)}%`,
        tvl: formatUSD(pool.tvl)
      }));
  };

  const calculateInvestmentRange = (historicalData) => {
    const minInvestment = Math.min(...historicalData.investments);
    const maxInvestment = Math.max(...historicalData.investments);
    return `${formatUSD(minInvestment)} - ${formatUSD(maxInvestment)}`;
  };

  const getSupportedAssets = (marketAnalysis) => {
    return marketAnalysis.supportedAssets.length.toString();
  };

  const formatHistoricalDataRange = (historicalData) => {
    const startDate = new Date(historicalData.startDate);
    const endDate = new Date(historicalData.endDate);
    const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
    return `${Math.round(years)} Years`;
  };

  const calculatePortfolioMetrics = (historicalData) => {
    const portfolio = historicalData.portfolio;
    return {
      totalValue: formatUSD(portfolio.currentValue),
      dailyChange: `${portfolio.dailyChange.toFixed(2)}%`,
      weeklyChange: `${portfolio.weeklyChange.toFixed(2)}%`,
      monthlyChange: `${portfolio.monthlyChange.toFixed(2)}%`
    };
  };

  const generateRecommendedStrategies = (marketAnalysis, historicalData) => {
    return marketAnalysis.strategies.map(strategy => ({
      name: strategy.name,
      apy: `${strategy.minApy.toFixed(2)}-${strategy.maxApy.toFixed(2)}%`,
      risk: strategy.riskLevel
    }));
  };

  const getSupportedChains = (bridgeData) => {
    const chains = new Set();
    bridgeData.forEach(data => {
      data.supportedChains.forEach(chain => chains.add(chain));
    });
    return Array.from(chains).join(', ');
  };

  const calculateAverageTransferTime = (bridgeData) => {
    const times = bridgeData.flatMap(data => data.transferTimes);
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    return `${Math.round(average)} minutes`;
  };

  const calculateSecurityScore = (bridgeData) => {
    const scores = bridgeData.map(data => data.securityScore);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return `${(average * 100).toFixed(1)}%`;
  };

  const getRecentTransfers = (walletId, bridgeData) => {
    const transfers = bridgeData.flatMap(data => data.transfers)
      .filter(transfer => transfer.walletId === walletId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    return transfers.map(transfer => ({
      from: transfer.sourceChain,
      to: transfer.destinationChain,
      amount: formatUSD(transfer.amount),
      status: transfer.status
    }));
  };

  const calculateBridgeFees = (bridgeData) => {
    const fees = {};
    bridgeData.forEach(data => {
      Object.entries(data.fees).forEach(([chain, fee]) => {
        fees[chain.toLowerCase()] = `${(fee * 100).toFixed(2)}%`;
      });
    });
    return fees;
  };

  // Handle module actions
  const handleModuleAction = async (moduleType, action, params = {}) => {
    if (!isConnected || !walletId) {
      console.error('Wallet not connected');
      return;
    }

    try {
      switch (moduleType) {
        case 'aggregator':
          await handleAggregatorAction(action, params);
          break;
        case 'simulation':
          await handleSimulationAction(action, params);
          break;
        case 'bridge':
          await handleBridgeAction(action, params);
          break;
        default:
          console.error('Unknown module type:', moduleType);
      }
    } catch (error) {
      console.error(`Error executing ${action} on ${moduleType}:`, error);
    }
  };

  // Handle aggregator module actions
  const handleAggregatorAction = async (action, params) => {
    switch (action) {
      case 'viewPools':
        // Implement view pools logic
        console.log('Viewing pools for wallet:', walletId);
        break;
      case 'stake':
        // Implement stake logic
        console.log('Staking for wallet:', walletId);
        break;
      case 'unstake':
        // Implement unstake logic
        console.log('Unstaking for wallet:', walletId);
        break;
      case 'claimRewards':
        // Implement claim rewards logic
        console.log('Claiming rewards for wallet:', walletId);
        break;
      default:
        console.error('Unknown aggregator action:', action);
    }
  };

  // Handle simulation module actions
  const handleSimulationAction = async (action, params) => {
    switch (action) {
      case 'buy':
        // Implement buy logic
        console.log('Buying assets for wallet:', walletId);
        break;
      case 'sell':
        // Implement sell logic
        console.log('Selling assets for wallet:', walletId);
        break;
      case 'viewPortfolio':
        // Implement view portfolio logic
        console.log('Viewing portfolio for wallet:', walletId);
        break;
      case 'analyzePerformance':
        // Implement analyze performance logic
        console.log('Analyzing performance for wallet:', walletId);
        break;
      default:
        console.error('Unknown simulation action:', action);
    }
  };

  // Handle bridge module actions
  const handleBridgeAction = async (action, params) => {
    switch (action) {
      case 'selectSourceChain':
        // Implement select source chain logic
        console.log('Selecting source chain for wallet:', walletId);
        break;
      case 'selectDestinationChain':
        // Implement select destination chain logic
        console.log('Selecting destination chain for wallet:', walletId);
        break;
      case 'selectToken':
        // Implement select token logic
        console.log('Selecting token for wallet:', walletId);
        break;
      case 'transfer':
        // Implement transfer logic
        console.log('Transferring for wallet:', walletId);
        break;
      default:
        console.error('Unknown bridge action:', action);
    }
  };

  // Memoize modulesToRender
  const modulesToRender = React.useMemo(() => {
    console.log('Rendering modules:', { modules, defaultModules });
    
    // If no modules exist or modules array is empty, create them from defaultModules
    if (!modules || modules.length === 0) {
      console.log('No modules found, creating default modules');
      return defaultModules.map(defaultModule => ({
        id: defaultModule.id,
        type: 'defiModule',
        content: {
          title: defaultModule.moduleType === 'aggregator' ? 'DeFi Aggregator' :
                 defaultModule.moduleType === 'simulation' ? 'Investment Simulator' :
                 defaultModule.moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
          description: defaultModule.moduleType === 'aggregator' ? 'Access multiple DeFi protocols through a single interface' :
                      defaultModule.moduleType === 'simulation' ? 'Simulate different investment strategies' :
                      defaultModule.moduleType === 'bridge' ? 'Transfer assets between different blockchains' : '',
          stats: defaultModule.moduleType === 'aggregator' ? [
            { label: 'Connected Wallet', value: 'Not Connected' },
            { label: 'Total Pools', value: 'Loading...' },
            { label: 'Total Value Locked', value: '$0' },
            { label: 'Best APY', value: 'Not Connected' }
          ] : defaultModule.moduleType === 'simulation' ? [
            { label: 'Investment Range', value: '$10,000' },
            { label: 'Supported Assets', value: '20+' },
            { label: 'Historical Data', value: '5 Years' }
          ] : defaultModule.moduleType === 'bridge' ? [
            { label: 'Supported Chains', value: 'Select Chain' },
            { label: 'Transfer Time', value: 'Select Chain' },
            { label: 'Security Score', value: '0.1%' }
          ] : []
        },
        styles: {
          backgroundColor: '#2A2A3C',
          padding: '1.5rem',
          borderRadius: '12px',
          color: '#fff'
        },
        configuration: {
          moduleType: defaultModule.moduleType,
          enabled: true,
          customColor: '#2A2A3C'
        }
      }));
    }

    // Process existing modules
    return modules.map((module) => {
      try {
        let parsedContent;
        
        // Handle content based on its type
        if (typeof module.content === 'string') {
          try {
            parsedContent = JSON.parse(module.content);
          } catch (e) {
            console.log('Module content is string but not JSON:', module.content);
            parsedContent = { title: module.content };
          }
        } else if (module.content && typeof module.content === 'object') {
          parsedContent = module.content;
        } else {
          parsedContent = {};
        }

        const moduleType = module.configuration?.moduleType || 'aggregator';
        
        // Ensure we have valid content structure
        const content = {
          title: parsedContent.title || (moduleType === 'aggregator' ? 'DeFi Aggregator' :
                 moduleType === 'simulation' ? 'Investment Simulator' :
                 moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title'),
          description: parsedContent.description || (moduleType === 'aggregator' ? 'Access multiple DeFi protocols through a single interface' :
                      moduleType === 'simulation' ? 'Simulate different investment strategies' :
                      moduleType === 'bridge' ? 'Transfer assets between different blockchains' : ''),
          stats: Array.isArray(parsedContent.stats) ? parsedContent.stats : moduleType === 'aggregator' ? [
            { label: 'Connected Wallet', value: isConnected ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : 'Not Connected' },
            { label: 'Total Pools', value: defiData?.totalPools || 'Loading...' },
            { label: 'Total Value Locked', value: defiData?.totalValueLocked || '$0' },
            { label: 'Best APY', value: defiData?.bestAPY || 'Not Connected' }
          ] : moduleType === 'simulation' ? [
            { label: 'Investment Range', value: defiData?.investmentRange || '$10,000' },
            { label: 'Supported Assets', value: defiData?.supportedAssets || '20+' },
            { label: 'Historical Data', value: defiData?.historicalData || '5 Years' }
          ] : moduleType === 'bridge' ? [
            { label: 'Supported Chains', value: defiData?.supportedChains || 'Select Chain' },
            { label: 'Transfer Time', value: defiData?.transferTime || 'Select Chain' },
            { label: 'Security Score', value: defiData?.securityScore || '0.1%' }
          ] : []
        };

        return {
          ...module,
          content,
          styles: {
            ...module.styles,
            backgroundColor: parsedContent?.settings?.customColor || '#2A2A3C',
            padding: '1.5rem',
            borderRadius: '12px',
            color: '#fff'
          },
          configuration: {
            ...module.configuration,
            moduleType,
            enabled: parsedContent?.enabled ?? true,
            customColor: parsedContent?.settings?.customColor || '#2A2A3C'
          }
        };
      } catch (error) {
        console.error('Error processing module:', error);
        const moduleType = module.configuration?.moduleType || 'aggregator';
        
        return {
          ...module,
          content: {
            title: moduleType === 'aggregator' ? 'DeFi Aggregator' :
                   moduleType === 'simulation' ? 'Investment Simulator' :
                   moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
            description: moduleType === 'aggregator' ? 'Access multiple DeFi protocols through a single interface' :
                        moduleType === 'simulation' ? 'Simulate different investment strategies' :
                        moduleType === 'bridge' ? 'Transfer assets between different blockchains' : '',
            stats: moduleType === 'aggregator' ? [
              { label: 'Connected Wallet', value: 'Not Connected' },
              { label: 'Total Pools', value: 'Loading...' },
              { label: 'Total Value Locked', value: '$0' },
              { label: 'Best APY', value: 'Not Connected' }
            ] : moduleType === 'simulation' ? [
              { label: 'Investment Range', value: '$10,000' },
              { label: 'Supported Assets', value: '20+' },
              { label: 'Historical Data', value: '5 Years' }
            ] : moduleType === 'bridge' ? [
              { label: 'Supported Chains', value: 'Select Chain' },
              { label: 'Transfer Time', value: 'Select Chain' },
              { label: 'Security Score', value: '0.1%' }
            ] : []
          },
          styles: {
            backgroundColor: '#2A2A3C',
            padding: '1.5rem',
            borderRadius: '12px',
            color: '#fff'
          },
          configuration: {
            moduleType,
            enabled: true,
            customColor: '#2A2A3C'
          }
        };
      }
    });
  }, [modules, defiData, isConnected, walletAddress]);

  const handleSectionSelect = React.useCallback((e) => {
    e.stopPropagation();
    if (handleSelect) {
      handleSelect(e);
    }
    const element = elements.find(el => el.id === uniqueId);
    setSelectedElement(element || { id: uniqueId, type: 'defiSection', styles: {} });
  }, [handleSelect, setSelectedElement, uniqueId, elements]);

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        drop(node);
      }}
      style={{
        ...mintingSectionStyles.section,
        border: isOverCurrent ? '2px dashed blue' : 'none',
        gridTemplateColumns: '1fr',
        backgroundColor: '#1D1C2B',
        padding: '2rem',
        borderRadius: '16px',
        position: 'relative',
      }}
      onClick={handleSectionSelect}
    >
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {logo && (
          <Image
            id={logo.id}
            src={logo.content}
            styles={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              marginBottom: '1rem'
            }}
            handleOpenMediaPanel={handleOpenMediaPanel}
          />
        )}
        {title && (
          <Span
            id={title.id}
            content={title.content}
            styles={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#fff',
              display: 'block',
              marginBottom: '1rem'
            }}
          />
        )}
        {description && (
          <Span
            id={description.id}
            content={description.content}
            styles={{
              fontSize: '1rem',
              color: '#ccc',
              display: 'block',
              marginBottom: '2rem'
            }}
          />
        )}
      </div>

      {/* Wallet Connection Notification */}
      {!isConnected && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '80%',
          zIndex: 10
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '0.5rem'
          }}>
            Wallet Not Connected
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#ccc',
            marginBottom: '1rem'
          }}>
            Please connect your wallet to view DeFi data and interact with this section
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#4CAF50',
            fontSize: '0.9rem'
          }}>
            <span>Tip:</span>
            <span>Add a Connect Wallet button to your page / Navbar to enable this section</span>
          </div>
        </div>
      )}

      {/* DeFi Modules Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        opacity: !isConnected ? 0.3 : 1,
        pointerEvents: !isConnected ? 'none' : 'auto',
        transition: 'opacity 0.3s ease'
      }}>
        {modulesToRender.map(module => (
          <DeFiModule
            key={module.id}
            id={module.id}
            content={module.content}
            styles={module.styles}
            configuration={module.configuration}
            handleSelect={handleSectionSelect}
            handleOpenMediaPanel={handleOpenMediaPanel}
          />
        ))}
      </div>
    </section>
  );
});

export default DeFiSection; 