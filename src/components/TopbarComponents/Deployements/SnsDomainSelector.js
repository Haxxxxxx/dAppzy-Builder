import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Connection, PublicKey } from '@solana/web3.js';
import { SecurityManager } from '../../../utils/security/securityManager';
import { Web3Configs } from '../../../configs/Web3/Web3Configs';
import { getAllDomains, getDomainKeysWithReverses } from '@bonfida/spl-name-service';
import './DomainsStyles.css';

// SNS Program IDs from config
const SNS_DOMAIN_PROGRAM = new PublicKey(Web3Configs.sns.domainProgram);
const SNS_DOMAIN_REGISTRY = new PublicKey(Web3Configs.sns.domainRegistry);
const TOKEN_PROGRAM_ID = new PublicKey(Web3Configs.sns.tokenProgram);

// Get RPC endpoints from config
const RPC_ENDPOINTS = Web3Configs.rpc.getEndpoints();

// SNS API endpoints and configuration
const SNS_API_CONFIG = {
  BASE_URL: 'https://api.bonfida.com',
  ENDPOINTS: {
    DOMAINS: '/v1/domains',
    REVERSE_LOOKUP: '/v1/reverse-lookup',
    DOMAIN_DATA: '/v1/domain-data'
  },
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

// SNS GraphQL API endpoint
const SNS_GRAPHQL_ENDPOINT = 'https://api.bonfida.com/graphql';

// GraphQL queries
const QUERIES = {
  GET_DOMAINS: `
    query GetDomains($owner: String!) {
      domains(owner: $owner) {
        name
        owner
        parent
        class
        tld
      }
    }
  `,
  GET_REVERSE_LOOKUP: `
    query GetReverseLookup($wallet: String!) {
      reverseLookup(wallet: $wallet) {
        domains {
          name
          owner
          parent
          class
          tld
        }
      }
    }
  `
};

// Connection status types
const CONNECTION_STATUS = {
  INITIALIZING: 'initializing',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RETRYING: 'retrying'
};

// Error types for better error handling
const ERROR_TYPES = {
  NO_API_KEY: 'NO_API_KEY',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_WALLET: 'INVALID_WALLET',
  NO_DOMAINS: 'NO_DOMAINS'
};

// Add debug logging utility
const debugLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = data 
    ? `[SNS Debug ${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}`
    : `[SNS Debug ${timestamp}] ${message}`;
  console.log(logMessage);
};

const SnsDomainSelector = ({
  userId,
  walletAddress,
  elements,
  websiteSettings,
  onDomainSelected,
  onCancel,
  setAutoSaveStatus,
  generateFullHtml,
  saveProjectToFirestore
}) => {
  const [deploymentStage, setDeploymentStage] = useState('SELECTING');
  const [domains, setDomains] = useState([]);
  const [status, setStatus] = useState('Initializing connection...');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.INITIALIZING);
  const [connectionError, setConnectionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  // Initialize Solana connection with Helius configuration
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        setConnectionStatus(CONNECTION_STATUS.CONNECTING);
        
        if (RPC_ENDPOINTS.length === 0) {
          throw new Error('No RPC endpoints configured. Please add your Helius API key to your .env file.');
        }

        const heliusEndpoint = RPC_ENDPOINTS[0];
        if (!heliusEndpoint) {
          throw new Error('No valid RPC endpoint available');
        }

        const conn = new Connection(heliusEndpoint, {
          commitment: Web3Configs.sns.settings.commitment,
          confirmTransactionInitialTimeout: Web3Configs.rpc.helius.snsConfig.confirmTransactionInitialTimeout,
          wsEndpoint: Web3Configs.rpc.helius.snsConfig.wsEndpoint()
        });
        
        // Test the connection
        await conn.getVersion();
        setConnection(conn);
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setStatus('Connected to Helius RPC. Scanning for domains...');
        setConnectionError(null);
        setRetryCount(0);
      } catch (error) {
        console.error(`Failed to connect to Helius RPC:`, error);
        setConnectionError(error.message);
        setLastError(error);
        
        // Handle specific error types
        if (error.message.includes('API key')) {
          setConnectionStatus(CONNECTION_STATUS.ERROR);
          setStatus('Error: Invalid or missing Helius API key. Please check your configuration.');
        } else if (error.message.includes('rate limit')) {
          setConnectionStatus(CONNECTION_STATUS.ERROR);
          setStatus('Error: Rate limit exceeded. Please try again in a few moments.');
        } else {
          // Try public endpoint as fallback
          if (RPC_ENDPOINTS.length > 1) {
            try {
              setConnectionStatus(CONNECTION_STATUS.RETRYING);
              const publicEndpoint = RPC_ENDPOINTS[1];
              const fallbackConn = new Connection(publicEndpoint, {
                commitment: Web3Configs.sns.settings.commitment
              });
              await fallbackConn.getVersion();
              setConnection(fallbackConn);
              setConnectionStatus(CONNECTION_STATUS.CONNECTED);
              setStatus('Connected to public RPC. Scanning for domains...');
              setConnectionError(null);
            } catch (fallbackError) {
              setConnectionStatus(CONNECTION_STATUS.ERROR);
              setStatus('Error: Unable to connect to Solana network. Please check your Helius API key and try again.');
            }
          } else {
            setConnectionStatus(CONNECTION_STATUS.ERROR);
            setStatus('Error: Unable to connect to Solana network. Please check your Helius API key and try again.');
          }
        }
      }
    };

    initializeConnection();
  }, []);

  // Fetch SNS domains using spl-name-service library
  useEffect(() => {
    const fetchSnsDomains = async () => {
      if (!walletAddress || !connection || connectionStatus !== CONNECTION_STATUS.CONNECTED) {
        debugLog('Missing requirements for domain fetch', {
          hasWalletAddress: !!walletAddress,
          hasConnection: !!connection,
          connectionStatus
        });
        return;
      }

      try {
        setStatus('Scanning your wallet for SNS domains...');
        debugLog('Starting domain fetch for wallet', { walletAddress });
        
        // Validate Solana address
        if (!SecurityManager.validateSolanaAddress(walletAddress)) {
          debugLog('Invalid wallet address', { walletAddress });
          setLastError({ type: ERROR_TYPES.INVALID_WALLET });
          setStatus('Invalid Solana wallet address.');
          return;
        }

        const walletPubkey = new PublicKey(walletAddress);
        debugLog('Wallet public key created', { 
          walletPubkey: walletPubkey.toBase58()
        });

        try {
          // Method 1: Get all domains using spl-name-service
          debugLog('Fetching domains using spl-name-service');
          const domainsWithReverses = await getDomainKeysWithReverses(connection, walletPubkey);
          
          debugLog('Domains found with reverses', { domainsWithReverses });

          if (domainsWithReverses && domainsWithReverses.length > 0) {
            // Extract domain names from the domainsWithReverses array
            const domains = domainsWithReverses
              .filter(item => item && item.domain) // Filter out any invalid items
              .map(item => item.domain); // Get just the domain names

            debugLog('Found domains via spl-name-service', { domains });

            if (domains.length > 0) {
              setDomains(domains);
              setStatus('Found SNS domains in your wallet.');
              return;
            }
          }

          // Method 2: Fallback to getAllDomains
          debugLog('No domains found with reverses, trying getAllDomains');
          const domainKeys = await getAllDomains(connection, walletPubkey);
          
          debugLog('Domain keys found', { 
            domainKeys: domainKeys.map(key => key.toBase58())
          });

          if (domainKeys && domainKeys.length > 0) {
            const domains = domainKeys.map(key => key.toBase58());
            debugLog('Found domains via getAllDomains', { domains });
            setDomains(domains);
            setStatus('Found SNS domains in your wallet.');
            return;
          }

          // Method 3: Get all token accounts as final fallback
          debugLog('No domains found via spl-name-service, trying token accounts');
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
            programId: TOKEN_PROGRAM_ID,
          });

          debugLog('Token accounts fetched', { 
            totalAccounts: tokenAccounts.value.length
          });

          // Process token accounts for SNS domains
          const tokenDomains = tokenAccounts.value
            .filter(account => {
              try {
                const data = account.account.data.parsed;
                return data?.info?.mint === SNS_DOMAIN_PROGRAM.toBase58();
              } catch (error) {
                return false;
              }
            })
            .map(account => {
              try {
                const data = account.account.data.parsed;
                if (data?.info?.name) {
                  debugLog('Found domain in token account', {
                    domainName: data.info.name,
                    accountPubkey: account.pubkey.toBase58()
                  });
                  return data.info.name;
                }
              } catch (error) {
                debugLog('Error parsing token account data', {
                  accountPubkey: account.pubkey.toBase58(),
                  error: error.message
                });
              }
              return null;
            })
            .filter(Boolean);

          if (tokenDomains.length > 0) {
            debugLog('Found domains via token accounts', { tokenDomains });
            setDomains(tokenDomains);
            setStatus('Found SNS domains in your wallet.');
          } else {
            setLastError({ type: ERROR_TYPES.NO_DOMAINS });
            setStatus('No SNS domains found in your wallet.');
          }
        } catch (error) {
          debugLog('Error fetching domains', {
            error: error.message,
            stack: error.stack
          });
          throw error;
        }
      } catch (error) {
        console.error('Error fetching SNS domains:', error);
        debugLog('Fatal error in domain fetch', {
          error: error.message,
          stack: error.stack
        });
        
        setLastError(error);
        setStatus('Error scanning wallet for SNS domains: ' + error.message);
      }
    };

    if (connection && walletAddress) {
      debugLog('Starting domain fetch process', {
        walletAddress,
        connectionEndpoint: connection.rpcEndpoint
      });
      fetchSnsDomains();
    }
  }, [walletAddress, connection, connectionStatus]);

  // Render connection status indicator
  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.CONNECTED:
        return <div className="status-indicator connected">Connected</div>;
      case CONNECTION_STATUS.CONNECTING:
        return <div className="status-indicator connecting">Connecting...</div>;
      case CONNECTION_STATUS.RETRYING:
        return <div className="status-indicator retrying">Retrying...</div>;
      case CONNECTION_STATUS.ERROR:
        return <div className="status-indicator error">Connection Error</div>;
      default:
        return <div className="status-indicator initializing">Initializing...</div>;
    }
  };

  // Render error message based on error type
  const renderErrorMessage = () => {
    if (!lastError) return null;

    switch (lastError.type) {
      case ERROR_TYPES.NO_API_KEY:
        return (
          <div className="error-message">
            <p>Missing Helius API Key</p>
            <p>Please add your Helius API key to your .env file:</p>
            <code>REACT_APP_HELIUS_API_KEY=your_api_key_here</code>
          </div>
        );
      case ERROR_TYPES.INVALID_WALLET:
        return (
          <div className="error-message">
            <p>Invalid Wallet Address</p>
            <p>Please ensure you're using a valid Solana wallet address.</p>
          </div>
        );
      case ERROR_TYPES.NO_DOMAINS:
        return (
          <div className="error-message">
            <p>No SNS Domains Found</p>
            <p>You don't have any SNS domains in your wallet. Visit{' '}
              <a href="https://naming.bonfida.org/" target="_blank" rel="noopener noreferrer">
                Bonfida
              </a>{' '}
              to purchase a domain.
            </p>
          </div>
        );
      default:
        return (
          <div className="error-message">
            <p>Error: {lastError.message || 'An unexpected error occurred'}</p>
          </div>
        );
    }
  };

  // Handle domain selection and deployment
  const handleSelectDomain = async () => {
    if (!selectedDomain) return;

    try {
      setDeploymentStage('DEPLOYING');
      setStatus('Deployment in Progress...');

      // Generate HTML content
      const fullHtml = generateFullHtml();
      
      // Save to Firestore with SNS domain info
      await saveProjectToFirestore(userId, fullHtml, 'sns', selectedDomain);

      // Update website settings with the SNS domain and wallet info
      const projectRef = doc(db, 'projects', userId);
      await updateDoc(projectRef, {
        websiteSettings: {
          ...websiteSettings,
          snsDomain: selectedDomain,
          walletAddress: walletAddress,
          lastUpdated: serverTimestamp(),
        },
      });

      setDeploymentStage('COMPLETE');
      setStatus('Deployment Complete!');
      setAutoSaveStatus('All changes saved.');

      // Open the new domain in a new tab
      const domainUrl = `https://${selectedDomain}`;
      const newTab = window.open(domainUrl, '_blank', 'noopener,noreferrer');
      if (newTab) {
        newTab.blur();
        window.focus();
      }

      if (onDomainSelected) {
        onDomainSelected(selectedDomain);
      }
    } catch (error) {
      console.error('Error deploying to SNS domain:', error);
      setStatus('Error deploying to SNS domain: ' + error.message);
    }
  };

  // Render domain cards
  const renderDomainCards = () => {
    if (!domains || domains.length === 0) return null;

    return domains.map((domainName, index) => {
      // Skip invalid domain names
      if (!domainName) {
        debugLog('Skipping invalid domain name', { index });
        return null;
      }

      // Ensure we have the full domain name
      const fullDomainName = typeof domainName === 'string' && domainName.endsWith('.sol') 
        ? domainName 
        : `${domainName}.sol`;
      
      debugLog('Rendering domain card', { 
        originalName: domainName,
        fullName: fullDomainName 
      });

      return (
        <div
          key={index}
          className={`domain-card ${selectedDomain === fullDomainName ? 'selected' : ''}`}
          onClick={() => setSelectedDomain(fullDomainName)}
        >
          <div className="radio-circle">
            {selectedDomain === fullDomainName && <div className="radio-circle-inner" />}
          </div>
          <p className="domain-text">{fullDomainName}</p>
        </div>
      );
    }).filter(Boolean); // Remove any null entries
  };

  // Loading state
  if (deploymentStage === 'DEPLOYING') {
    return (
      <div className="domain-selection-modal">
        <button className="close-btn" onClick={onCancel}>×</button>
        <div className="deployment-status">
          <div className="spinner" />
          <h2>Deployment in Progress</h2>
          <p>Your project is currently being deployed to your SNS domain. This may take a few moments.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (deploymentStage === 'COMPLETE') {
    return (
      <div className="domain-selection-modal">
        <button className="close-btn" onClick={onCancel}>×</button>
        <div className="deployment-status">
          <div className="check-circle" />
          <h2>Deployment Complete</h2>
          <p>Your project has been successfully deployed to your SNS domain.</p>
        </div>
      </div>
    );
  }

  // Selection state
  return (
    <div className="domain-selection-modal">
      <button className="close-btn" onClick={onCancel}>×</button>

      <h2>Choose an SNS Domain</h2>
      <p className="subtitle">
        Select your Solana Name Service domain to deploy your website.
      </p>

      {renderConnectionStatus()}
      {renderErrorMessage()}

      <p className="status">{status}</p>

      <div className="domain-grid">{renderDomainCards()}</div>

      <div className="buttons">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button 
          className="select-btn" 
          onClick={handleSelectDomain}
          disabled={!selectedDomain || connectionStatus !== CONNECTION_STATUS.CONNECTED}
        >
          Deploy to Selected Domain
        </button>
      </div>

      <p className="no-domains-message">
        If you don't own any SNS domains in your wallet, please visit{' '}
        <a href="https://naming.bonfida.org/" target="_blank" rel="noopener noreferrer">
          Bonfida
        </a>{' '}
        to purchase a domain.
      </p>
    </div>
  );
};

export default SnsDomainSelector; 