import React, { useContext } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';
import { mintingSectionStyles } from './DefaultWeb3Styles';
import { Span, Button } from '../../SelectableElements';

const DeFiModule = React.memo(({
  id,
  content,
  styles,
  configuration,
  handleSelect,
  handleOpenMediaPanel,
  type = 'defiModule'
}) => {
  const { setSelectedElement } = useContext(EditableContext);
  const { isConnected, walletAddress } = useWalletContext();

  if (!configuration?.enabled) {
    return null;
  }

  const handleModuleSelect = (e) => {
    e.stopPropagation();
    if (handleSelect) {
      handleSelect(e, id);
    }
    setSelectedElement({ id, type, content, styles, configuration });
  };

  const moduleType = configuration?.moduleType || 'aggregator';
  const stats = content?.stats || [];
  const topPools = content?.topPools || [];
  const strategies = content?.strategies || [];
  const recentTransfers = content?.recentTransfers || [];

  const renderModuleContent = () => {
    switch (moduleType) {
      case 'aggregator':
        return (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                {content?.title || 'DeFi Aggregator'}
              </h3>
              {!isConnected && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#ff4d4f'
                }}>
                  Connect your wallet to view DeFi data
                </div>
              )}
              {isConnected && walletAddress && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0, 255, 0, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#52c41a'
                }}>
                  Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.map((stat, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>{stat.label}</span>
                  <span style={{ fontWeight: 'bold' }}>{stat.value}</span>
                </div>
              ))}
            </div>
            {isConnected && topPools.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Top Performing Pools</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {topPools.map((pool, index) => (
                    <div key={index} style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{pool.name}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#4CAF50' }}>{pool.apy}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{pool.tvl}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'simulation':
        return (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                {content?.title || 'Investment Simulator'}
              </h3>
              {!isConnected && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#ff4d4f'
                }}>
                  Connect your wallet to simulate investments
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.map((stat, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>{stat.label}</span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: stat.value.startsWith('+') ? '#4CAF50' : 
                           stat.value.startsWith('-') ? '#f44336' : 'inherit'
                  }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
            {isConnected && strategies.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Recommended Strategies</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {strategies.map((strategy, index) => (
                    <div key={index} style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{strategy.name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Risk: {strategy.risk}</div>
                      </div>
                      <span style={{ color: '#4CAF50' }}>{strategy.apy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'bridge':
        return (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                {content?.title || 'Cross-Chain Bridge'}
              </h3>
              {!isConnected && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#ff4d4f'
                }}>
                  Connect your wallet to use the bridge
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.map((stat, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>{stat.label}</span>
                  <span style={{ fontWeight: 'bold' }}>{stat.value}</span>
                </div>
              ))}
            </div>
            {isConnected && recentTransfers.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Recent Transfers</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {recentTransfers.map((transfer, index) => (
                    <div key={index} style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div>{transfer.from} → {transfer.to}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{transfer.amount}</div>
                      </div>
                      <span style={{ 
                        color: transfer.status === 'Completed' ? '#4CAF50' : '#FFC107',
                        fontSize: '0.9rem'
                      }}>
                        {transfer.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      id={id}
      onClick={handleModuleSelect}
      style={{
        ...mintingSectionStyles.module,
        ...styles,
        cursor: 'pointer',
        position: 'relative',
        padding: '1.5rem',
        borderRadius: '12px',
        backgroundColor: configuration?.customColor || '#2A2A3C',
        color: '#fff'
      }}
    >
      {renderModuleContent()}
    </div>
  );
});

export default DeFiModule; 