import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as WalletProviderBase } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

const WalletContext = createContext({
  walletAddress: '',
  balance: 0,
  isConnected: false,
  isLoading: false,
  walletId: '',
  disconnect: () => {},
  setIsConnected: () => {},
  setWalletAddress: () => {}
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
      <WalletProviderBase wallets={wallets} autoConnect>
        <WalletContextProvider>{children}</WalletContextProvider>
      </WalletProviderBase>
    </ConnectionProvider>
  );
};

const WalletContextProvider = ({ children }) => {
  const { publicKey, connected, disconnect } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toString();
      setWalletAddress(address);
      setWalletId(address);
      setIsWalletConnected(true);
      
      // Simulate balance fetching
      setIsLoading(true);
      setTimeout(() => {
        setBalance(100); // Mock balance
        setIsLoading(false);
      }, 1000);
    } else {
      setWalletAddress('');
      setBalance(0);
      setWalletId('');
      setIsWalletConnected(false);
    }
  }, [connected, publicKey]);

  const value = {
    walletAddress,
    balance,
    isConnected: isWalletConnected || connected,
    isLoading,
    walletId,
    disconnect,
    setIsConnected: setIsWalletConnected,
    setWalletAddress
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}; 