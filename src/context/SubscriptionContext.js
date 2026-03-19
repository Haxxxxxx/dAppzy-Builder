import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useWalletContext } from './WalletContext';
import { subscriptionStorage } from '../utils/storageManager';

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
    const storedStatus = subscriptionStorage.getStatus();
    const storedEndDate = subscriptionStorage.getEndDate();

    if (storedEndDate && new Date(storedEndDate) < new Date()) {
      subscriptionStorage.clear();
      return 'freemium';
    }

    return storedStatus || 'freemium';
  });

  const [subscriptionEndDate, setSubscriptionEndDate] = useState(() => {
    return subscriptionStorage.getEndDate() || null;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress } = useWalletContext();

  const isSubscriptionExpired = () => {
    // Pioneers without a set end date are not expired
    if (!subscriptionEndDate) return subscriptionStatus !== 'pioneer';
    const endDate = new Date(subscriptionEndDate);
    const now = new Date();
    return now > endDate;
  };

  // Use ref to track unsubscribe so cleanup always gets the latest function
  const unsubscribeRef = useRef(() => {});

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", walletAddress);
        if (import.meta.env.DEV) console.debug('[SubscriptionContext] onSnapshot for users/%s — Firebase uid:', walletAddress, auth.currentUser?.uid);

        // Set up real-time listener for user document
        unsubscribeRef.current = onSnapshot(userRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check both profile and direct subscription data
            const newStatus = userData.profile?.subscriptionStatus || userData.subscriptionStatus;
            const newEndDate = userData.profile?.subscriptionEndDate || userData.subscriptionEndDate;
            const isPioneer = userData.profile?.isPioneer || false;

            if (newStatus && newEndDate) {
              // Only update if we have both status and end date
              if (new Date(newEndDate) < new Date()) {
                setSubscriptionStatus('freemium');
                subscriptionStorage.setStatus('freemium');
                subscriptionStorage.setEndDate(null);
              } else {
                setSubscriptionStatus(newStatus);
                setSubscriptionEndDate(newEndDate);
                subscriptionStorage.setStatus(newStatus);
                subscriptionStorage.setEndDate(newEndDate);
              }
            } else if (isPioneer) {
              // If isPioneer is true but no subscription dates, set as pioneer
              setSubscriptionStatus('pioneer');
              subscriptionStorage.setStatus('pioneer');
            }
          }
          setIsLoading(false);
        }, () => {
          setIsLoading(false);
        });

        // onSnapshot fires immediately with initial data, no separate getDoc needed
      } catch (error) {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();

    return () => {
      unsubscribeRef.current();
    };
  }, [walletAddress]);

  const value = {
    subscriptionStatus,
    setSubscriptionStatus: (status) => {
      setSubscriptionStatus(status);
      subscriptionStorage.setStatus(status);
    },
    subscriptionEndDate,
    setSubscriptionEndDate: (date) => {
      setSubscriptionEndDate(date);
      subscriptionStorage.setEndDate(date);
    },
    isLoading,
    isPioneer: subscriptionStatus === 'pioneer' && !isSubscriptionExpired()
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext; 