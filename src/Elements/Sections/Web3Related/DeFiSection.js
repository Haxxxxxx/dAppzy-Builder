import React, { useContext, useMemo, useRef, useEffect, forwardRef, useState } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';
import { Image, Span, Button, DeFiModule, Section, Div } from '../../SelectableElements';
import useElementDrop from '../../../utils/useElementDrop';
import useReorderDrop from '../../../utils/useReorderDrop';
import merge from 'lodash/merge';
import { renderElement } from '../../../utils/LeftBarUtils/RenderUtils';
import { Web3Configs } from '../../../configs/Web3/Web3Configs';
import { defaultDeFiStyles } from './defaultDeFiStyles';

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

// Create a forwardRef wrapper for Section
const SectionWithRef = forwardRef(({ children, ...props }, ref) => (
  <Section {...props} ref={ref}>
    {children}
  </Section>
));

const DeFiSection = forwardRef(({
  id,
  contentListWidth,
  children,
  onDropItem,
  handlePanelToggle,
  handleOpenMediaPanel,
  handleSelect,
}, ref) => {
  const { 
    elements, 
    findElementById, 
    setElements, 
    generateUniqueId,
    selectedElement,
    handleRemoveElement 
  } = useContext(EditableContext);
  const { walletAddress, isConnected: contextConnected, isLoading, walletId } = useWalletContext();
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize the DeFi element to prevent unnecessary re-renders
  const defiElement = useMemo(() => {
    return findElementById(id, elements);
  }, [id, elements, findElementById]);
  
  // Initialize DeFi section structure
  useEffect(() => {
    console.log('Initializing DeFi section:', defiElement);
    if (!defiElement) return;

    // Create content container if it doesn't exist
    const contentContainerId = `${defiElement.id}-content`;
    const existingContainer = findElementById(contentContainerId, elements);
    
    if (!existingContainer) {
      console.log('Creating content container:', contentContainerId);
      const contentContainer = {
        id: contentContainerId,
        type: 'div',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '20px'
        },
        children: [],
        parentId: defiElement.id
      };

      // Get default modules from Web3Configs
      const defaultModules = Web3Configs.defiSection.children || [];
      console.log('Default modules:', defaultModules);

      // Create module elements
      const moduleElements = defaultModules.map(module => {
        const moduleId = generateUniqueId('defiModule');
        console.log('Creating module with ID:', moduleId);
        return {
          id: moduleId,
          type: 'defiModule',
          moduleType: module.moduleType || 'aggregator',
          content: module.content,
          styles: module.styles,
          configuration: module.configuration,
          settings: module.settings,
          parentId: contentContainerId
        };
      });

      // Update content container with module IDs
      contentContainer.children = moduleElements.map(module => module.id);

      // Add all elements in a single state update
      setElements(prev => [...prev, contentContainer, ...moduleElements]);
    }
  }, [defiElement, elements, findElementById, setElements]);

  // Handle dropping items into the DeFi section
  const handleDeFiDrop = (item, index) => {
    if (item.type === 'defiModule') {
      const moduleId = generateUniqueId('defiModule');
      const newModule = {
        id: moduleId,
        type: 'defiModule',
        moduleType: item.moduleType || 'aggregator',
        content: {
          title: item.content?.title || 'New DeFi Module',
          description: item.content?.description || 'Module description',
          stats: item.content?.stats || [],
          settings: {
            showStats: true,
            showButton: true,
          customColor: '#2A2A3C'
        }
        },
          styles: {
          ...defaultDeFiStyles.defiModule,
          position: 'relative',
          boxSizing: 'border-box',
          padding: '10px',
          margin: '10px 0',
          backgroundColor: 'rgba(42, 42, 60, 0.5)',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        },
        settings: item.settings || {},
        children: []
      };

      // Add the new module to elements
      setElements(prev => [...prev, newModule]);

      // Update the content container's children
      const contentContainerId = `${id}-content`;
      setElements(prev => prev.map(el => {
        if (el.id === contentContainerId) {
      return {
            ...el,
            children: [...(el.children || []), moduleId]
          };
        }
        return el;
      }));
    } else {
      onDropItem(item, index);
    }
  };

  // Render container children
  const renderContainerChildren = () => {
    console.log('Rendering container children for ID:', id);
    if (!id) {
      console.log('No section ID provided');
      return null;
    }

    const container = findElementById(`${id}-content`, elements);
    console.log('Found container:', container);

    if (!container) {
      console.log('Container not found');
      return null;
    }

    return container.children?.map((childId) => {
      const child = findElementById(childId, elements);
      console.log('Rendering child:', child);

      if (!child) {
        console.log('Child not found:', childId);
        return null;
      }

      const isSelected = selectedElement?.id === childId;

      return (
        <div
          key={childId}
          style={{
            position: 'relative',
            boxSizing: 'border-box',
            ...(isSelected ? {
              outline: '2px solid var(--purple, #5C4EFA)',
              borderInline: '0.5px solid var(--purple, #5C4EFA)'
            } : {})
          }}
        >
          {isSelected && (
            <div
              style={{
                position: 'absolute',
                zIndex: 1000,
                pointerEvents: 'none',
                backgroundColor: 'var(--purple)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                maxWidth: '1500px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '-25px',
              }}
            >
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={childId}
              >
                {childId}
              </span>
              <span
                className="material-symbols-outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveElement(childId);
                }}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1rem',
                  marginLeft: '8px',
                }}
                title="Remove element"
              >
                delete
              </span>
            </div>
          )}
          <DeFiModule
            id={childId}
            content={child.content}
            styles={child.styles}
            configuration={child.configuration}
            settings={child.settings}
            handleSelect={handleSelect}
            handleOpenMediaPanel={handleOpenMediaPanel}
            isConnected={contextConnected}
            isSigned={false}
            requireSignature={true}
            moduleType={child.moduleType}
          />
        </div>
      );
    });
  };

  // Get the content container ID
  const contentContainerId = `${id}-content`;

  // Merge styles properly
  const sectionStyles = {
    ...defaultDeFiStyles.defiSection,
    ...defiElement?.styles,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: '10px',
    margin: '0',
    backgroundColor: 'rgba(42, 42, 60, 0.5)',
    backdropFilter: 'blur(10px)'
  };

      return (
    <SectionWithRef
      ref={ref}
      id={id}
      onDropItem={handleDeFiDrop}
      handlePanelToggle={handlePanelToggle}
      handleOpenMediaPanel={handleOpenMediaPanel}
      handleSelect={handleSelect}
      style={sectionStyles}
    >
      <div
        id={contentContainerId}
              style={{
          ...defaultDeFiStyles.defiContent,
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
                width: '100%',
          padding: '20px'
        }}
      >
      <div style={{
        textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            ...defaultDeFiStyles.defiTitle,
          }}>
            DeFi Dashboard
          </h1>
          <p style={{
            ...defaultDeFiStyles.defiDescription,
          }}>
            Manage your DeFi investments and explore new opportunities
          </p>
              </div>
        {renderContainerChildren()}
              </div>
    </SectionWithRef>
  );
});

export default DeFiSection; 