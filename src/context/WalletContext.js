import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as WalletProviderBase } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const WalletContext = createContext({
  walletAddress: '',
  balance: 0,
  isConnected: false,
  isLoading: false,
  walletId: '',
  disconnect: () => {},
  setIsConnected: () => {},
  setWalletAddress: () => {},
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  error: null
});

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

// Create a single instance of the wallet adapter
const wallets = [new PhantomWalletAdapter()];

export const WalletProvider = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProviderBase 
        wallets={wallets} 
        autoConnect={true}  // Enable auto-connect
        localStorageKey="walletAdapter"
      >
        <WalletContextProvider>{children}</WalletContextProvider>
      </WalletProviderBase>
    </ConnectionProvider>
  );
};

const WalletContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletId, setWalletId] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);

  // Check for existing wallet connection and URL parameters on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        // First check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        
        if (userId) {
          // If userId is in URL, use it directly
          setWalletAddress(userId);
          setWalletId(userId);
          setIsWalletConnected(true);
          
          // Check subscription status in Firestore
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.subscriptionStatus) {
              localStorage.setItem('subscriptionStatus', userData.subscriptionStatus);
              if (userData.subscriptionEndDate) {
                localStorage.setItem('subscriptionEndDate', userData.subscriptionEndDate);
              }
            }
          }
          return;
        }

        // If no userId in URL, check for existing wallet connection
        if (window.solana && window.solana.isPhantom) {
          const isConnected = window.solana.isConnected;
          if (isConnected) {
            const { publicKey } = window.solana;
            if (publicKey) {
              const address = publicKey.toString();
              setWalletAddress(address);
              setWalletId(address);
              setIsWalletConnected(true);
              
              // Check subscription status in Firestore
              const userRef = doc(db, 'users', address);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.subscriptionStatus) {
                  localStorage.setItem('subscriptionStatus', userData.subscriptionStatus);
                  if (userData.subscriptionEndDate) {
                    localStorage.setItem('subscriptionEndDate', userData.subscriptionEndDate);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error checking existing connection:', err);
      }
    };

    checkExistingConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (window.ethereum) {
        // Handle Ethereum wallet
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletId(accounts[0]);
          setIsWalletConnected(true);
        }
      } else if (window.solana) {
        // Handle Solana wallet - only connect when explicitly requested
        if (window.solana.isPhantom) {
          const { publicKey } = await window.solana.connect();
          if (publicKey) {
            const address = publicKey.toString();
            setWalletAddress(address);
            setWalletId(address);
            setIsWalletConnected(true);

            // Check subscription status in Firestore
            const userRef = doc(db, 'users', address);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Store subscription status in localStorage for persistence
              if (userData.subscriptionStatus) {
                localStorage.setItem('subscriptionStatus', userData.subscriptionStatus);
                // Also store subscription end date
                if (userData.subscriptionEndDate) {
                  localStorage.setItem('subscriptionEndDate', userData.subscriptionEndDate);
                }
              }
            }
          }
        }
      } else {
        throw new Error('No supported wallet found');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (window.ethereum) {
        // Ethereum doesn't have a standard disconnect method
        setWalletAddress('');
        setWalletId('');
        setIsWalletConnected(false);
      } else if (window.solana) {
        await window.solana.disconnect();
      }
      
      setWalletAddress('');
      setWalletId('');
      setIsWalletConnected(false);
      setBalance(0);
      
      // Clear subscription status from localStorage
      localStorage.removeItem('subscriptionStatus');
      localStorage.removeItem('subscriptionEndDate');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Failed to disconnect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    walletAddress,
    setWalletAddress,
    walletId,
    setWalletId,
    isConnected: isWalletConnected,
    setIsConnected: setIsWalletConnected,
    isLoading,
    error,
    balance,
    connectWallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletContextProvider }; 