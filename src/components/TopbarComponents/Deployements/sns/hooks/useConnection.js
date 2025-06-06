import { useState, useEffect, useRef } from 'react';
import { Connection } from '@solana/web3.js';
import { MAINNET_CONFIG, CONNECTION_STATUS } from '../constants';
import { debugLog } from '../utils';

export const useConnection = () => {
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.INITIALIZING);
  const [connectionError, setConnectionError] = useState(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    const initializeConnection = async () => {
      if (connectionRef.current) {
        return;
      }

      try {
        setConnectionStatus(CONNECTION_STATUS.CONNECTING);

        const conn = new Connection(MAINNET_CONFIG.endpoint, {
          commitment: MAINNET_CONFIG.commitment,
          confirmTransactionInitialTimeout: MAINNET_CONFIG.confirmTransactionInitialTimeout,
          wsEndpoint: MAINNET_CONFIG.wsEndpoint
        });

        // Test connection
        const version = await conn.getVersion();
        debugLog('Connection successful', { 
          endpoint: MAINNET_CONFIG.endpoint,
          version
        });

        connectionRef.current = conn;
        setConnection(conn);
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to connect to Solana mainnet:', error);
        setConnectionError(error.message);
        setConnectionStatus(CONNECTION_STATUS.ERROR);
      }
    };

    initializeConnection();
  }, []);

  return {
    connection,
    connectionRef,
    connectionStatus,
    connectionError
  };
}; 