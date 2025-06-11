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
    const storedStatus = localStorage.getItem('subscriptionStatus');
    const storedEndDate = localStorage.getItem('subscriptionEndDate');
    
    if (storedEndDate && new Date(storedEndDate) < new Date()) {
      localStorage.removeItem('subscriptionStatus');
      localStorage.removeItem('subscriptionEndDate');
      return 'freemium';
    }
    
    return storedStatus || 'freemium';
  });
  
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(() => {
    return localStorage.getItem('subscriptionEndDate') || null;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress } = useWalletContext();

  const isSubscriptionExpired = () => {
    if (!subscriptionEndDate) return true;
    const endDate = new Date(subscriptionEndDate);
    const now = new Date();
    return now > endDate;
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const checkSubscriptionStatus = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", walletAddress);
        
        // Set up real-time listener for user document
        unsubscribe = onSnapshot(userRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data received:', userData); // Debug log

            // Check both profile and direct subscription data
            const newStatus = userData.profile?.subscriptionStatus || userData.subscriptionStatus;
            const newEndDate = userData.profile?.subscriptionEndDate || userData.subscriptionEndDate;
            const isPioneer = userData.profile?.isPioneer || false;

            if (newStatus && newEndDate) {
              // Only update if we have both status and end date
              if (new Date(newEndDate) < new Date()) {
                console.log('Subscription expired, setting to freemium'); // Debug log
                setSubscriptionStatus('freemium');
                localStorage.setItem('subscriptionStatus', 'freemium');
                localStorage.removeItem('subscriptionEndDate');
              } else {
                console.log('Setting subscription status:', newStatus); // Debug log
                setSubscriptionStatus(newStatus);
                setSubscriptionEndDate(newEndDate);
                localStorage.setItem('subscriptionStatus', newStatus);
                localStorage.setItem('subscriptionEndDate', newEndDate);
              }
            } else if (isPioneer) {
              // If isPioneer is true but no subscription dates, set as pioneer
              console.log('User is pioneer, setting subscription status'); // Debug log
              setSubscriptionStatus('pioneer');
              localStorage.setItem('subscriptionStatus', 'pioneer');
            } else {
              console.log('No subscription data found in user document'); // Debug log
            }
          } else {
            console.log('No user document found'); // Debug log
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
          console.log('Initial user data:', userData); // Debug log

          // Check both profile and direct subscription data
          const newStatus = userData.profile?.subscriptionStatus || userData.subscriptionStatus;
          const newEndDate = userData.profile?.subscriptionEndDate || userData.subscriptionEndDate;
          const isPioneer = userData.profile?.isPioneer || false;

          if (newStatus && newEndDate) {
            if (new Date(newEndDate) < new Date()) {
              setSubscriptionStatus('freemium');
              localStorage.setItem('subscriptionStatus', 'freemium');
              localStorage.removeItem('subscriptionEndDate');
            } else {
              setSubscriptionStatus(newStatus);
              setSubscriptionEndDate(newEndDate);
              localStorage.setItem('subscriptionStatus', newStatus);
              localStorage.setItem('subscriptionEndDate', newEndDate);
            }
          } else if (isPioneer) {
            // If isPioneer is true but no subscription dates, set as pioneer
            setSubscriptionStatus('pioneer');
            localStorage.setItem('subscriptionStatus', 'pioneer');
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();

    return () => {
      unsubscribe();
    };
  }, [walletAddress]);

  // Debug subscription status changes
  useEffect(() => {
    console.log('SubscriptionContext - Status Update:', {
      subscriptionStatus,
      subscriptionEndDate,
      isLoading,
      isPioneer: subscriptionStatus === 'pioneer' && !isSubscriptionExpired(),
      localStorage: {
        status: localStorage.getItem('subscriptionStatus'),
        endDate: localStorage.getItem('subscriptionEndDate')
      }
    });
  }, [subscriptionStatus, subscriptionEndDate, isLoading]);

  const value = {
    subscriptionStatus,
    setSubscriptionStatus: (status) => {
      setSubscriptionStatus(status);
      localStorage.setItem('subscriptionStatus', status);
    },
    subscriptionEndDate,
    setSubscriptionEndDate: (date) => {
      setSubscriptionEndDate(date);
      if (date) {
        localStorage.setItem('subscriptionEndDate', date);
      } else {
        localStorage.removeItem('subscriptionEndDate');
      }
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