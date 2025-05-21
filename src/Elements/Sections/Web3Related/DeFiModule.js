import React, { useContext, useState, useEffect, forwardRef } from 'react';
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
  const { elements, findElementById } = useContext(EditableContext);
  const { walletAddress, isConnected: contextConnected, isLoading, walletId } = useWalletContext();
  const [moduleState, setModuleState] = useState({ loading: false, error: null });

  // Get the module element from context
  const moduleElement = findElementById(id, elements);

  // Get module content and settings
  const moduleContent = moduleElement?.content || content || {};
  const moduleSettings = moduleContent?.settings || {};

  // Handle module click
  const handleModuleClick = (e) => {
    e.stopPropagation();
    if (handleSelect) {
      handleSelect({ id, type: 'defiModule' });
    }
  };

  // Render module content
  const renderModuleContent = () => {
    return (
      <div style={defaultDeFiStyles.defiModuleContent}>
        <h3 style={defaultDeFiStyles.defiModuleTitle}>
          {moduleContent.title || 'DeFi Module'}
        </h3>
        <p style={defaultDeFiStyles.defiModuleDescription}>
          {moduleContent.description || 'Module description'}
        </p>
        {moduleContent.stats && moduleSettings.showStats && (
          <div className="defi-module-stats" style={defaultDeFiStyles.defiModuleStats}>
            {moduleContent.stats.map((stat, index) => (
              <div key={index} className="defi-module-stat" style={defaultDeFiStyles.defiModuleStat}>
                <span className="stat-label" style={defaultDeFiStyles.defiModuleStatLabel}>
                  {stat.label}
                </span>
                <span className="stat-value" style={defaultDeFiStyles.defiModuleStatValue}>
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
              ...defaultDeFiStyles.defiModuleButton,
              backgroundColor: moduleSettings.customColor || '#2A2A3C',
              opacity: moduleState.loading ? 0.7 : 1,
              cursor: moduleState.loading ? 'not-allowed' : 'pointer',
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