import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as WalletProviderBase } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

const WalletContext = createContext();

export const useWalletContext = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

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
    const handleWalletConnected = (event) => {
      console.log('Wallet connected event received:', event.detail);
      const { publicKey, walletType, walletName } = event.detail;
      setWalletAddress(publicKey);
      setWalletId(publicKey);
      setIsWalletConnected(true);
      setIsLoading(true);
      setTimeout(() => {
        setBalance(100); // Mock balance
        setIsLoading(false);
      }, 1000);
    };

    window.addEventListener('walletConnected', handleWalletConnected);

    return () => {
      window.removeEventListener('walletConnected', handleWalletConnected);
    };
  }, []);

  useEffect(() => {
    console.log('Wallet connection state changed:', { connected, publicKey });
    if (connected && publicKey) {
      const address = publicKey.toString();
      console.log('Setting wallet address:', address);
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
      console.log('Resetting wallet state');
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
    disconnect
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}; 