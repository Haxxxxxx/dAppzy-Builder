import React, { useContext, useMemo, forwardRef, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';
import { Div } from '../../SelectableElements';
import { merge } from 'lodash';
import { defaultDeFiStyles } from './defaultDeFiStyles';

const DeFiModule = forwardRef(({
  id,
  content,
  styles,
  configuration,
  settings,
  handleSelect,
  handleOpenMediaPanel,
  isConnected,
  isSigned,
  requireSignature,
  moduleType,
}, ref) => {
  const { elements, findElementById, setElements } = useContext(EditableContext);
  const { walletAddress, isConnected: contextConnected, isLoading, walletId } = useWalletContext();
  const [moduleState, setModuleState] = useState({
    loading: false,
    error: null,
    data: null
  });

  // Memoize the module element to prevent unnecessary re-renders
  const moduleElement = useMemo(() => {
    if (!id) return null;
    return findElementById(id, elements);
  }, [id, elements, findElementById]);

  // Initialize module if needed
  useEffect(() => {
    if (!id) return;

    // If module doesn't exist, create it
    if (!moduleElement) {
      const newModule = {
        id,
        type: 'defiModule',
        moduleType: moduleType || 'aggregator',
        content: {
          title: content?.title || 'New DeFi Module',
          description: content?.description || 'Module description',
          stats: content?.stats || [],
          settings: {
            showStats: true,
            showButton: true,
            customColor: '#2A2A3C',
            ...content?.settings
          }
        },
        styles: merge({}, defaultDeFiStyles.defiModule, styles),
        configuration: {
          ...configuration,
          enabled: true
        },
        settings: settings || {}
      };

      setElements(prev => [...prev, newModule]);
      return;
    }

    // If module exists, update it if needed
    const updatedModule = {
      ...moduleElement,
      type: 'defiModule',
      moduleType: moduleElement.moduleType || moduleType || 'aggregator',
      content: {
        title: moduleElement.content?.title || content?.title || 'New DeFi Module',
        description: moduleElement.content?.description || content?.description || 'Module description',
        stats: moduleElement.content?.stats || content?.stats || [],
        settings: {
          showStats: true,
          showButton: true,
          customColor: '#2A2A3C',
          ...moduleElement.content?.settings,
          ...content?.settings
        }
      },
      styles: merge({}, defaultDeFiStyles.defiModule, moduleElement.styles || styles),
      configuration: {
        ...moduleElement.configuration,
        ...configuration,
        enabled: true
      },
      settings: {
        ...moduleElement.settings,
        ...settings
      }
    };

    // Only update if there are actual changes
    if (JSON.stringify(moduleElement) !== JSON.stringify(updatedModule)) {
      setElements(prev => prev.map(el => 
        el.id === id ? updatedModule : el
      ));
    }
  }, [id, moduleElement, content, styles, configuration, settings, moduleType, setElements]);

  // Handle module-specific actions
  useEffect(() => {
    if (!moduleElement || !contextConnected) return;

    const fetchModuleData = async () => {
      setModuleState(prev => ({ ...prev, loading: true }));
      try {
        switch (moduleElement.moduleType) {
          case 'aggregator':
            const aggregatorData = await fetchAggregatorData();
            setModuleState(prev => ({ ...prev, data: aggregatorData }));
            break;

          case 'simulation':
            const simulationData = await fetchSimulationData();
            setModuleState(prev => ({ ...prev, data: simulationData }));
            break;

          case 'bridge':
            const bridgeData = await fetchBridgeData();
            setModuleState(prev => ({ ...prev, data: bridgeData }));
            break;
        }
      } catch (error) {
        setModuleState(prev => ({ ...prev, error: error.message }));
      } finally {
        setModuleState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchModuleData();
  }, [moduleElement, contextConnected]);

  // Handle module click
  const handleModuleClick = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (handleSelect) {
      handleSelect(id);
    }
  };

  // Module-specific action handlers
  const handleAggregatorAction = async () => {
    console.log('Aggregator action triggered');
  };

  const handleSimulationAction = async () => {
    console.log('Simulation action triggered');
  };

  const handleBridgeAction = async () => {
    console.log('Bridge action triggered');
  };

  // Mock data fetching functions
  const fetchAggregatorData = async () => {
    return {
      pools: [],
      tvl: 0,
      apy: 0
    };
  };

  const fetchSimulationData = async () => {
    return {
      strategies: [],
      historicalData: []
    };
  };

  const fetchBridgeData = async () => {
    return {
      chains: [],
      fees: {}
    };
  };

  // Render module content
  const renderModuleContent = () => {
    if (!id || !moduleElement) return null;

    const moduleContent = moduleElement.content || content;
    const moduleConfig = configuration || {};
    const moduleSettings = moduleContent?.settings || settings || {};

    if (!moduleContent) return null;

    return (
      <div className="defi-module-content" style={{ padding: '20px' }}>
        {moduleContent.title && (
          <h2 className="defi-module-title" style={{ 
            margin: '0 0 10px 0', 
            fontSize: '1.5rem', 
            color: '#fff',
            fontWeight: 'bold'
          }}>
            {moduleContent.title}
          </h2>
        )}
        {moduleContent.description && (
          <p className="defi-module-description" style={{ 
            margin: '0 0 20px 0', 
            color: '#ccc',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            {moduleContent.description}
          </p>
        )}
        {moduleContent.stats && moduleSettings.showStats && (
          <div className="defi-module-stats" style={{ 
            display: 'grid', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            {moduleContent.stats.map((stat, index) => (
              <div key={index} className="defi-module-stat" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span className="stat-label" style={{ color: '#ccc' }}>{stat.label}</span>
                <span className="stat-value" style={{ 
                  color: '#fff',
                  fontWeight: 'bold'
                }}>
                  {moduleState.loading ? 'Loading...' : 
                   moduleState.error ? 'Error' : 
                   stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {moduleSettings.showButton && (
          <button
            className="defi-module-button"
            onClick={handleModuleClick}
            disabled={moduleState.loading}
            style={{
              backgroundColor: moduleSettings.customColor || '#2A2A3C',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: moduleState.loading ? 'not-allowed' : 'pointer',
              opacity: moduleState.loading ? 0.7 : 1,
              width: '100%',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            {moduleState.loading ? 'Loading...' :
             isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        )}
      </div>
    );
  };

  // Merge styles properly
  const mergedStyles = merge(
    {},
    defaultDeFiStyles.defiModule,
    moduleElement?.styles || styles,
    {
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(42, 42, 60, 0.5)',
      borderRadius: '8px',
      backdropFilter: 'blur(10px)',
      width: '100%',
      minHeight: '200px',
      padding: '20px',
      margin: '10px 0',
      transition: '0.3s',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  );

  if (!id) return null;

  return (
    <div
      id={id}
      ref={ref}
      onClick={handleModuleClick}
      style={mergedStyles}
    >
      {renderModuleContent()}
    </div>
  );
});

DeFiModule.displayName = 'DeFiModule';

export default DeFiModule; 