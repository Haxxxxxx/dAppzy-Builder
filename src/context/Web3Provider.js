import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const ethRef = useRef(null);

  useEffect(() => {
    // Prefer MetaMask's provider if multiple providers exist (EIP-6963)
    let eth = window.ethereum;
    if (eth?.providers?.length) {
      eth = eth.providers.find(p => p.isMetaMask && !p.isPhantom) || null;
    } else if (eth?.isPhantom) {
      eth = null; // Skip Phantom's EVM adapter — Solana handled by WalletContext
    }

    if (eth) {
      ethRef.current = eth;
      // Lazy-load ethers only when MetaMask is present
      import('ethers').then(({ BrowserProvider }) => {
        setProvider(new BrowserProvider(eth));
      }).catch(() => {});

      // Get initial account and chainId (read-only, no popup)
      const init = async () => {
        try {
          const accounts = await eth.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          const chainId = await eth.request({ method: 'eth_chainId' });
          setChainId(chainId);
        } catch (error) {
          // Silent — Web3 init failure is non-critical
        }
      };

      init();

      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts[0] || null);
      };
      eth.on('accountsChanged', handleAccountsChanged);

      // Listen for chain changes
      const handleChainChanged = (newChainId) => {
        setChainId(newChainId);
      };
      eth.on('chainChanged', handleChainChanged);

      return () => {
        eth.removeListener('accountsChanged', handleAccountsChanged);
        eth.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = async () => {
    const eth = ethRef.current || window.ethereum;
    if (!eth) {
      throw new Error('No Ethereum wallet detected');
    }

    const accounts = await eth.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    const newChainId = await eth.request({ method: 'eth_chainId' });
    setChainId(newChainId);
  };

  const value = {
    provider,
    account,
    chainId,
    connect,
    isConnected: !!account
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider; 