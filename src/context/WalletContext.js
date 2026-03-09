import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as WalletProviderBase } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';

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

const isDevnet = !import.meta.env.VITE_SOLANA_RPC_URL;

export const WalletProvider = ({ children }) => {
  const endpoint = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(WalletAdapterNetwork.Devnet);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProviderBase
        wallets={wallets}
        autoConnect={false}
        localStorageKey="walletAdapter"
      >
        <WalletContextProvider>{children}</WalletContextProvider>
      </WalletProviderBase>
    </ConnectionProvider>
  );
};

const WalletContextProvider = ({ children }) => {
  const isDevnet = !import.meta.env.VITE_SOLANA_RPC_URL;
  const [walletAddress, setWalletAddress] = useState('');
  const [walletId, setWalletId] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);

  // Restore wallet session using onAuthStateChanged (async-safe) + Phantom auto-connect
  useEffect(() => {
    const restoreWalletSession = async (hasFirebaseUser = false) => {
      try {
        if (!window.solana || !window.solana.isPhantom) return;

        // Try to eagerly connect — Phantom remembers trusted apps across origins
        let publicKey = window.solana.publicKey;
        if (!publicKey && window.solana.isConnected === false) {
          try {
            const resp = await window.solana.connect({ onlyIfTrusted: true });
            publicKey = resp.publicKey;
          } catch (err) {
            // Phantom not previously trusted on this origin — user must login manually
            if (import.meta.env.DEV) console.debug('[WalletContext] Eager connect skipped:', err.message);
            return;
          }
        }
        if (!publicKey) return;

        const address = publicKey.toString();
        setWalletAddress(address);
        setWalletId(address);
        setIsWalletConnected(true);
        sessionStorage.setItem('userAccount', address);

        // Only query Firestore for subscription if Firebase session exists
        if (hasFirebaseUser) {
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
      } catch (err) {
        // Silent — auto-reconnect failure is not actionable
      }
    };

    // Wait for Firebase Auth to hydrate, then try to restore
    const unsub = auth.onAuthStateChanged((user) => {
      restoreWalletSession(!!user);
    });

    // Listen for Phantom account changes and disconnect
    let handleAccountChanged;
    let handleDisconnect;
    if (window.solana && window.solana.isPhantom) {
      handleAccountChanged = async (newPublicKey) => {
        if (newPublicKey) {
          await signOut(auth);
          setWalletAddress('');
          setWalletId('');
          setIsWalletConnected(false);
        } else {
          setWalletAddress('');
          setWalletId('');
          setIsWalletConnected(false);
        }
      };
      handleDisconnect = () => {
        setWalletAddress('');
        setWalletId('');
        setIsWalletConnected(false);
        setBalance(0);
      };
      window.solana.on('accountChanged', handleAccountChanged);
      window.solana.on('disconnect', handleDisconnect);
    }

    return () => {
      unsub();
      if (window.solana && handleAccountChanged) {
        window.solana.removeListener('accountChanged', handleAccountChanged);
        window.solana.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const withTimeout = (promise, ms) =>
    Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Wallet connection timed out')), ms))]);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (window.ethereum) {
        // Handle Ethereum wallet
        const accounts = await withTimeout(window.ethereum.request({ method: 'eth_requestAccounts' }), 30000);
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletId(accounts[0]);
          setIsWalletConnected(true);
        }
      } else if (window.solana) {
        // Handle Solana wallet - only connect when explicitly requested
        if (window.solana.isPhantom) {
          const { publicKey } = await withTimeout(window.solana.connect(), 15000);
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
      
      // Sign out Firebase Auth to invalidate the session
      await signOut(auth);

      // Clear subscription status from localStorage
      localStorage.removeItem('subscriptionStatus');
      localStorage.removeItem('subscriptionEndDate');
    } catch (err) {
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
    disconnectWallet,
    isDevnet,
    isDevnet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletContextProvider }; 