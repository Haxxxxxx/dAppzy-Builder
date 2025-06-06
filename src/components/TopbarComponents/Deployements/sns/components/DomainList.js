import React from 'react';
import { DomainCard } from '../components';
import { debugLog } from '../utils';

const DomainList = ({
  domains,
  isLoading,
  selectedDomain,
  primaryDomain,
  enabledDomains,
  onDomainToggle
}) => {
  if (isLoading) {
    return (
      <div className="domain-selection-modal-content-fetching-domains">
        <p className="domain-selection-modal-content-fetching-domains-text">
          Fetching domains...
        </p>
        <div className="domain-selection-modal-content-fetching-domains-loader" />
      </div>
    );
  }

  if (!domains || domains.length === 0) {
    return (
      <div className="no-domains-message">
        <p>No SNS domains found in your wallet.</p>
        <p>Please visit{' '}
          <a href="https://naming.bonfida.org/" target="_blank" rel="noopener noreferrer">
            Bonfida
          </a>{' '}
          to purchase a domain.
        </p>
      </div>
    );
  }

  return domains.map((domain, index) => {
    if (!domain || !domain.name) {
      debugLog('Skipping invalid domain', { index, domain });
      return null;
    }

    const fullDomainName = domain.name.endsWith('.sol')
      ? domain.name
      : `${domain.name}.sol`;

    const isPrimary = primaryDomain === domain.name;
    const isEnabled = enabledDomains[fullDomainName] || false;
    const isSelected = selectedDomain?.name === domain.name;

    return (
      <DomainCard
        key={index}
        domain={domain}
        isSelected={isSelected}
        isPrimary={isPrimary}
        isEnabled={isEnabled}
        onToggle={onDomainToggle}
      />
    );
  }).filter(Boolean);
};

export default DomainList; 