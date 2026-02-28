import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

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

  useEffect(() => {
    if (window.ethereum) {
      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      // Get initial account and chainId
      const init = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chainId);
        } catch (error) {
          console.error('Error initializing Web3:', error);
        }
      };

      init();

      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts[0] || null);
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Listen for chain changes
      const handleChainChanged = (newChainId) => {
        setChainId(newChainId);
      };
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
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