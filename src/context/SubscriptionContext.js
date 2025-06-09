import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useWalletContext } from './WalletContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(() => {
    // Initialize from session storage if available
    return sessionStorage.getItem('subscriptionStatus') || 'freemium';
  });
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress } = useWalletContext();

  useEffect(() => {
    let unsubscribe = () => {};

    const checkSubscriptionStatus = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }
      try {
        const userRef = doc(db, 'users', walletAddress);
        
        // Set up real-time listener for subscription status changes
        unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const newStatus = userData.subscriptionStatus || 'freemium';
            setSubscriptionStatus(newStatus);
            // Update session storage
            sessionStorage.setItem('subscriptionStatus', newStatus);
          }
          setIsLoading(false);
        }, (error) => {
          console.error('Error in subscription status listener:', error);
          setIsLoading(false);
        });

        // Initial check
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newStatus = userData.subscriptionStatus || 'freemium';
          setSubscriptionStatus(newStatus);
          // Update session storage
          sessionStorage.setItem('subscriptionStatus', newStatus);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();

    // Cleanup subscription on unmount or wallet change
    return () => {
      unsubscribe();
    };
  }, [walletAddress]);

  const value = {
    subscriptionStatus,
    setSubscriptionStatus: (status) => {
      setSubscriptionStatus(status);
      sessionStorage.setItem('subscriptionStatus', status);
    },
    isLoading,
    isPioneer: subscriptionStatus === 'pioneer'
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext; 