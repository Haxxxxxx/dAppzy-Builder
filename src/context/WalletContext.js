import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { signOut, signInWithCustomToken } from 'firebase/auth';
import { db, auth } from '../firebase';
import { subscriptionStorage, authStorage } from '../utils/storageManager';

const FUNCTIONS_BASE = import.meta.env.VITE_CF_BASE_URL || 'https://us-central1-third--space.cloudfunctions.net';

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

export const WalletProvider = ({ children }) => {
  return <WalletContextProvider>{children}</WalletContextProvider>;
};

const WalletContextProvider = ({ children }) => {
  const isDevnet = !import.meta.env.VITE_SOLANA_RPC_URL;
  const [walletAddress, setWalletAddress] = useState('');
  const [walletId, setWalletId] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Timeout wrapper — prevents hanging on Phantom connect({ onlyIfTrusted })
  const withEagerTimeout = (promise, ms = 3000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Eager connect timeout')), ms)),
    ]);

  // Single unified auth initialization effect.
  // Handles: token handoff from CMS → Firebase Auth hydration → session restore.
  // Always guarantees isAuthReady = true when done.
  useEffect(() => {
    let cancelled = false;

    // ── Step 1: Token handoff (CMS → Builder cross-origin auth) ──────
    const handleTokenHandoff = async () => {
      const hash = window.location.hash;
      if (!hash.includes('token=')) return false;
      const idToken = hash.split('token=')[1];
      if (!idToken) return false;

      const params = new URLSearchParams(window.location.search);
      const handoffUserId = params.get('userId');

      // Clear the hash so the token isn't visible in the URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      try {
        const res = await fetch(`${FUNCTIONS_BASE}/exchangeToken`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        if (!res.ok) return false;
        const { customToken } = await res.json();
        await signInWithCustomToken(auth, customToken);

        if (handoffUserId && !cancelled) {
          setWalletAddress(handoffUserId);
          setWalletId(handoffUserId);
          setIsWalletConnected(true);
          authStorage.setUserAccount(handoffUserId);
        }

        if (import.meta.env.DEV) console.debug('[WalletContext] Token handoff successful, userId:', handoffUserId);
        return true;
      } catch (err) {
        if (import.meta.env.DEV) console.debug('[WalletContext] Token handoff failed:', err.message);
        return false;
      }
    };

    // ── Step 2: Restore wallet session from Firebase Auth + Phantom ──
    const restoreWalletSession = async (firebaseUser) => {
      if (!firebaseUser) {
        subscriptionStorage.clear();
        return;
      }

      if (import.meta.env.DEV) console.debug('[WalletContext] restoreWalletSession — Firebase uid:', firebaseUser.uid);

      let address = null;

      // Try Phantom eager connect with a timeout to prevent hanging
      if (window.solana && window.solana.isPhantom) {
        let publicKey = window.solana.publicKey;
        if (!publicKey && window.solana.isConnected === false) {
          try {
            const resp = await withEagerTimeout(window.solana.connect({ onlyIfTrusted: true }));
            publicKey = resp.publicKey;
          } catch {
            // Phantom not trusted on this origin, or timed out — expected cross-origin
          }
        }
        if (publicKey) address = publicKey.toString();
      }

      // Fallback: stored userId from previous handoff or Firebase UID
      if (!address) {
        address = authStorage.getUserAccount() || firebaseUser.uid;
      }
      if (!address || cancelled) return;

      setWalletAddress(address);
      setWalletId(address);
      setIsWalletConnected(true);
      authStorage.setUserAccount(address);

      // Verify subscription status from Firestore
      try {
        const userRef = doc(db, 'users', address);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          subscriptionStorage.setStatus(userData.subscriptionStatus || '');
          subscriptionStorage.setEndDate(userData.subscriptionEndDate || null);
        } else {
          subscriptionStorage.clear();
        }
      } catch {
        // Firestore read failed — non-critical for auth gate
      }
    };

    // ── Orchestrate: handoff first, then auth state listener ─────────
    const init = async () => {
      const handoffDone = await handleTokenHandoff();

      // Subscribe to onAuthStateChanged — fires immediately with current state.
      // If handoff just signed us in, it fires with the new user.
      // If no session, it fires with null.
      const unsub = auth.onAuthStateChanged(async (user) => {
        if (!handoffDone) {
          await restoreWalletSession(user);
        }
        if (!cancelled) setIsAuthReady(true);
      });

      // Safety net: if onAuthStateChanged hasn't fired in 5s, unblock the UI
      const safetyTimer = setTimeout(() => {
        if (!cancelled) setIsAuthReady(true);
      }, 5000);

      return () => {
        unsub();
        clearTimeout(safetyTimer);
      };
    };

    let cleanup = () => {};
    init().then(fn => { if (fn) cleanup = fn; });

    // Listen for Phantom account changes and disconnect
    let handleAccountChanged;
    let handleDisconnect;
    if (window.solana && window.solana.isPhantom) {
      handleAccountChanged = async (newPublicKey) => {
        if (newPublicKey) {
          await signOut(auth);
        }
        setWalletAddress('');
        setWalletId('');
        setIsWalletConnected(false);
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
      cancelled = true;
      cleanup();
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
          const address = accounts[0];
          setWalletAddress(address);
          setWalletId(address);
          setIsWalletConnected(true);

          // Check subscription status in Firestore (same as Solana path)
          const userRef = doc(db, 'users', address);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.subscriptionStatus) {
              subscriptionStorage.setStatus(userData.subscriptionStatus);
              if (userData.subscriptionEndDate) {
                subscriptionStorage.setEndDate(userData.subscriptionEndDate);
              }
            }
          }
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
                subscriptionStorage.setStatus(userData.subscriptionStatus);
                if (userData.subscriptionEndDate) {
                  subscriptionStorage.setEndDate(userData.subscriptionEndDate);
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
      subscriptionStorage.clear();
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
    isAuthReady
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletContextProvider }; 