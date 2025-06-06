import { useState, useEffect, useCallback } from 'react';
import { getDomainsForWallet } from '../utils';
import { debugLog } from '../utils';
import { PublicKey } from '@solana/web3.js';

export const useDomains = (connection, walletAddress) => {
  const [domains, setDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [primaryDomain, setPrimaryDomain] = useState(null);
  const [enabledDomains, setEnabledDomains] = useState({});
  const [selectedDomain, setSelectedDomain] = useState(null);

  const fetchDomains = useCallback(async () => {
    if (!connection || !walletAddress) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert wallet address to PublicKey
      const walletPublicKey = new PublicKey(walletAddress);
      
      // Get domains owned by wallet
      const domains = await getDomainsForWallet(connection, walletPublicKey);
      
      if (domains.length > 0) {
        setDomains(domains);
        
        // Get primary domain
        const primaryDomain = domains.find(d => d.name === 'dappzy');
        if (primaryDomain) {
          setPrimaryDomain(primaryDomain.name);
          debugLog('Primary domain set', {
            primaryDomain: primaryDomain.name
          });
        }
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [connection, walletAddress]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleDomainToggle = (domain) => {
    const fullDomainName = domain.name.endsWith('.sol') ? domain.name : `${domain.name}.sol`;
    
    setEnabledDomains(prev => {
      const newState = { ...prev };
      newState[fullDomainName] = !prev[fullDomainName];
      return newState;
    });

    setSelectedDomain(prev => {
      if (prev?.name === domain.name) {
        return null;
      }
      return domain;
    });
  };

  return {
    domains,
    isLoading,
    error,
    primaryDomain,
    enabledDomains,
    selectedDomain,
    handleDomainToggle,
    refreshDomains: fetchDomains
  };
}; 