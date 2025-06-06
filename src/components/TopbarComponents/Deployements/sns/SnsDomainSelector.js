import React, { useState, useEffect } from 'react';
import { useConnection } from './hooks/useConnection';
import { useDomains } from './hooks/useDomains';
import { useDeployment } from './hooks/useDeployment';
import { CONNECTION_STATUS } from './constants';
import DomainList from './components/DomainList';
import DeploymentScreen from './components/DeploymentScreen';
import DomainSelectorHeader from './components/DomainSelectorHeader';
import { ErrorModal } from './components';
import './styles.css';

const SnsDomainSelector = ({
  userId,
  walletAddress,
  elements,
  websiteSettings,
  onDomainSelected,
  onCancel,
  generateFullHtml
}) => {
  // Use custom hooks for state management
  const { connection, connectionRef, connectionStatus, connectionError } = useConnection();
  const {
    domains,
    isLoading,
    error: domainsError,
    primaryDomain,
    enabledDomains,
    selectedDomain,
    handleDomainToggle
  } = useDomains(connection, walletAddress);
  const {
    deploymentStage,
    deploymentProgress,
    deploymentError,
    deployToDomain
  } = useDeployment(connection, walletAddress, userId);

  // Handle domain selection and deployment
  const handleSelectDomain = async () => {
    if (!selectedDomain) return;

    try {
      const { signature, formattedDomain } = await deployToDomain(
        selectedDomain,
        elements,
        websiteSettings,
        generateFullHtml
      );

      if (onDomainSelected) {
        onDomainSelected(formattedDomain);
      }

      // Open the new domain
      setTimeout(() => {
        const domainUrl = `https://${formattedDomain}`;
        window.open(domainUrl, '_blank');
      }, 1000);

    } catch (error) {
      console.error('Error in handleSelectDomain:', error);
    }
  };

  // Handle view site action
  const handleViewSite = () => {
    if (selectedDomain) {
      const domainUrl = `https://${selectedDomain.name}`;
      window.open(domainUrl, '_blank');
    }
  };

  return (
    <div className="domain-selection-modal-bg">
      <DeploymentScreen
        deploymentStage={deploymentStage}
        deploymentProgress={deploymentProgress}
        deploymentError={deploymentError}
        selectedDomain={selectedDomain}
        onClose={onCancel}
        onViewSite={handleViewSite}
      />
      
      {deploymentStage === 'SELECTING' && (
        <div className="domain-selection-modal">
          <DomainSelectorHeader
            connectionStatus={connectionStatus}
            connectionError={connectionError}
            domainsError={domainsError}
          />

          <p className="domain-selection-modal-subtitle">
            Select a domain to deploy your website:
          </p>

          <DomainList
            domains={domains}
            isLoading={isLoading}
            selectedDomain={selectedDomain}
            primaryDomain={primaryDomain}
            enabledDomains={enabledDomains}
            onDomainToggle={handleDomainToggle}
          />

          <div className="buttons">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="select-btn"
              onClick={handleSelectDomain}
              disabled={!selectedDomain || connectionStatus !== CONNECTION_STATUS.CONNECTED}
            >
              Update Domain
            </button>
          </div>

          <p className="no-domains-message">
            If you don't own any SNS domains in your wallet, please visit{' '}
            <a href="https://naming.bonfida.org/" target="_blank" rel="noopener noreferrer">
              Bonfida
            </a>{' '}
            to purchase a domain.
          </p>
        </div>
      )}
    </div>
  );
};

export default SnsDomainSelector; 