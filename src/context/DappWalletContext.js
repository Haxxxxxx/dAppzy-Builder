import React, { createContext, useContext } from 'react';
import { useWalletContext } from './WalletContext';

const DappWalletContext = createContext();

export const useDappWallet = () => {
  const context = useContext(DappWalletContext);
  if (!context) {
    throw new Error('useDappWallet must be used within a DappWalletProvider');
  }
  return context;
};

export const DappWalletProvider = ({ children }) => {
  const walletState = useWalletContext();

  return (
    <DappWalletContext.Provider value={walletState}>
      {children}
    </DappWalletContext.Provider>
  );
}; 