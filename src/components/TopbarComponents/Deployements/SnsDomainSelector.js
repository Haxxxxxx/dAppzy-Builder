import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Connection, PublicKey } from '@solana/web3.js';
import { SecurityManager } from '../../../utils/security/securityManager';
import { Web3Configs } from '../../../configs/Web3/Web3Configs';
import { getAllDomains, getDomainKeysWithReverses, updateNameRegistryData, ROOT_DOMAIN_ACCOUNT, getNameAccountKey, NameRegistryState, getHashedName, performReverseLookup, getPrimaryDomain, getMultiplePrimaryDomains, useDomains, useDomainsForUser, usePrimaryDomain, updateRecordInstruction, createRecordInstruction } from '@bonfida/spl-name-service';
import './DomainsStyles.css';
import { Transaction } from '@solana/web3.js';
import { pinDirectoryToPinata } from '../../../utils/ipfs';

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

// Add domain name validation utility
const validateAndFormatDomain = (domainName) => {
  // Remove .sol if present
  const baseName = domainName.replace(/\.sol$/, '');

  // Basic validation
  if (!baseName || baseName.length === 0) {
    throw new Error('Invalid domain name');
  }

  // Return formatted domain name
  return `${baseName}.sol`;
};

// Add domain verification utility
const verifyDomain = async (connection, domainName, walletAddress) => {
  try {
    // Remove .sol suffix for hashing
    const baseName = domainName.replace(/\.sol$/, '');
    debugLog('Base name for verification', {
      domainName,
      baseName
    });

    // Get hashed name
    const hashedName = await getHashedName(baseName);
    debugLog('Hashed name generated', {
      hashedName: hashedName.toString('hex')
    });

    // Get domain key
    const domainKey = await getNameAccountKey(hashedName);
    debugLog('Domain key generated', {
      domainKey: domainKey.toBase58()
    });

    try {
      // First try to get domain info from initial list
      const domainsWithReverses = await getDomainKeysWithReverses(connection, new PublicKey(walletAddress));
      debugLog('Domains found with reverses', {
        domainsWithReverses
      });

      const domainInfo = domainsWithReverses.find(item => item.domain === baseName);
      if (domainInfo) {
        debugLog('Domain found in initial list', {
          domain: baseName,
          pubKey: domainInfo.pubKey.toBase58()
        });
        return domainKey;
      }

      // If not found in initial list, try to get domain state
      const domainState = await NameRegistryState.retrieve(connection, domainKey);
      debugLog('Domain state retrieved', {
        exists: !!domainState,
        owner: domainState?.owner?.toBase58(),
        state: domainState ? {
          owner: domainState.owner.toBase58(),
          class: domainState.class?.toBase58(),
          parent: domainState.parent?.toBase58(),
          data: domainState.data ? 'present' : 'absent'
        } : null
      });

      if (!domainState) {
        throw new Error('Domain does not exist');
      }

      // Check if domain is registered
      if (!domainState.owner || domainState.owner.toBase58() === '11111111111111111111111111111111') {
        throw new Error('Domain is not registered');
      }

      // Verify ownership
      if (domainState.owner.toBase58() !== walletAddress) {
        throw new Error('You do not own this domain');
      }

      return domainKey;
    } catch (error) {
      if (error.message.includes('does not exist')) {
        throw new Error('Domain does not exist or is not registered');
      }
      throw error;
    }
  } catch (error) {
    debugLog('Domain verification error', {
      error: error.message,
      domain: domainName
    });
    throw error;
  }
};

// Add domain content update utility
const updateDomainContent = async (connection, domainName, content, walletAddress) => {
  try {
    // First verify domain exists and is owned by the user
    const domainKey = await verifyDomain(connection, domainName, walletAddress);

    // Convert content to buffer
    const contentBuffer = Buffer.from(content, 'utf-8');
    debugLog('Content buffer created', {
      size: contentBuffer.length
    });

    // Create instruction for content update
    const updateInstruction = await updateNameRegistryData(
      connection,
      domainName,
      0, // offset
      contentBuffer,
      undefined,
      ROOT_DOMAIN_ACCOUNT
    );

    return updateInstruction;
  } catch (error) {
    debugLog('Error creating update instruction', {
      error: error.message,
      domain: domainName
    });
    throw error;
  }
};

// Add element type validation
const isValidElementType = (type) => {
  const validTypes = [
    'hero',
    'navbar',
    'section',
    'cta',
    'defiSection',
    'footer',
    'image',
    'heading',
    'paragraph',
    'button',
    'span',
    'input',
    'textarea',
    'featureItem'
  ];
  return validTypes.includes(type);
};

// Utility: Unified HTML export and IPFS upload
const exportAndUploadToIPFS = async (elements, websiteSettings, userId, generateFullHtml) => {
  // 1. Generate HTML
  const fullHtml = generateFullHtml();
  if (!fullHtml || typeof fullHtml !== 'string') {
    throw new Error('Invalid HTML content generated');
  }
  // 2. Upload to IPFS
  const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
  const files = [{ file: htmlBlob, fileName: 'index.html', type: 'text/html' }];
  const metadata = {
    name: websiteSettings.siteTitle || 'My Website',
    keyvalues: { userId, timestamp: new Date().toISOString(), size: htmlBlob.size },
  };
  const ipfsHash = await pinDirectoryToPinata(files, metadata);
  if (!ipfsHash) throw new Error('No IPFS hash returned from Pinata');
  const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
  debugLog('IPFS deployment complete', { cid: ipfsHash, url: ipfsUrl });
  return { ipfsHash, ipfsUrl, fullHtml };
};

// Utility: Save deployment info to Firestore
const saveDeploymentToFirestore = async (userId, websiteSettings, ipfsHash, ipfsUrl, formattedDomain, walletAddress) => {
  const projectRef = doc(db, 'projects', userId);
  const websiteSettingsData = {
    ...websiteSettings,
    snsDomain: formattedDomain,
    walletAddress,
    ipfsCid: ipfsHash,
    ipfsUrl,
    lastUpdated: serverTimestamp(),
    deploymentStatus: 'pending',
    deploymentTransaction: null
  };
  const projectDoc = await getDoc(projectRef);
  if (!projectDoc.exists()) {
    await setDoc(projectRef, {
      userId,
      websiteSettings: websiteSettingsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } else {
    await updateDoc(projectRef, {
      websiteSettings: websiteSettingsData,
      updatedAt: serverTimestamp()
    });
  }
};

// Utility: Update SNS domain content record with IPFS URL, creating it if needed
const updateSnsDomainRecord = async (connection, formattedDomain, ipfsUrl, walletAddress) => {
  const domainName = formattedDomain.replace(/\.sol$/, '');
  const recordType = 'content';
  const recordValue = ipfsUrl;
  const authority = new PublicKey(walletAddress);

  // Validate all inputs
  if (!connection || !domainName || !recordType || !recordValue || !authority) {
    throw new Error('Missing required parameters for SNS record update');
  }

  debugLog('Preparing SNS content record update', {
    domain: domainName,
    recordType,
    recordValue,
    authority: authority.toBase58(),
    authorityType: typeof authority
  });

  let transaction = new Transaction();
  try {
    debugLog('Calling updateRecordInstruction with:', {
      domain: domainName,
      recordType,
      recordValue,
      authority: authority.toBase58()
    });

    // Try to update the record
    const ix = await updateRecordInstruction(
      connection,
      domainName,
      recordType,
      recordValue,
      authority
    );

    // Validate instruction keys
    ix.keys.forEach((key, index) => {
      if (!key.pubkey) {
        throw new Error(`Missing pubkey in instruction key at index ${index}`);
      }
      debugLog(`Instruction key ${index}:`, {
        pubkey: key.pubkey.toBase58(),
        isSigner: key.isSigner,
        isWritable: key.isWritable
      });
    });

    transaction.add(ix);
  } catch (err) {
    // If the record does not exist, create it first
    if (err.message && err.message.includes('record account does not exist')) {
      debugLog('Record account does not exist, creating it first...');
      debugLog('Calling createRecordInstruction with:', {
        domain: domainName,
        recordType,
        recordValue,
        authority: authority.toBase58()
      });

      const createIx = await createRecordInstruction(
        connection,
        domainName,
        recordType,
        recordValue,
        authority,
        authority  // payer parameter
      );

      // Validate create instruction keys
      createIx.keys.forEach((key, index) => {
        if (!key.pubkey) {
          throw new Error(`Missing pubkey in create instruction key at index ${index}`);
        }
        debugLog(`Create instruction key ${index}:`, {
          pubkey: key.pubkey.toBase58(),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        });
      });

      transaction.add(createIx);
    } else {
      throw err;
    }
  }

  // Get latest blockhash and set fee payer
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = authority;

  // Validate final transaction
  if (!transaction.recentBlockhash) {
    throw new Error('Transaction missing recentBlockhash');
  }
  if (!transaction.feePayer) {
    throw new Error('Transaction missing feePayer');
  }

  debugLog('Prepared SNS content record update transaction', {
    blockhash,
    feePayer: authority.toBase58(),
    instructionCount: transaction.instructions.length
  });

  return transaction;
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
  const [primaryDomain, setPrimaryDomain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggleActive, setIsToggleActive] = useState(false);

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

  // Fetch domains and primary domain
  useEffect(() => {
    const fetchDomains = async () => {
      if (!connection || !walletAddress || connectionStatus !== CONNECTION_STATUS.CONNECTED) {
        return;
      }

      try {
        setIsLoading(true);
        setStatus('Loading domains...');

        const walletPubkey = new PublicKey(walletAddress);

        // Get domains with reverses first
        const domainsWithReverses = await getDomainKeysWithReverses(connection, walletPubkey);
        debugLog('Domains with reverses fetched', {
          domainsWithReverses
        });

        const domainNames = domainsWithReverses
          .filter(item => item && item.domain)
          .map(item => item.domain);

        if (domainNames.length > 0) {
          setDomains(domainNames);
          setStatus('Found SNS domains in your wallet.');
        } else {
          // Fallback to getAllDomains
          const domainKeys = await getAllDomains(connection, walletPubkey);
          const domains = domainKeys.map(key => key.toBase58());
          setDomains(domains);
          setStatus('Found SNS domains in your wallet.');
        }

        // Get primary domain
        try {
          const { domain } = await getPrimaryDomain(connection, walletPubkey);
          if (domain) {
            setPrimaryDomain(domain);
            debugLog('Primary domain fetched', {
              primaryDomain: domain.toBase58()
            });
          }
        } catch (error) {
          debugLog('Error getting primary domain', {
            error: error.message
          });
          // Don't throw error here, just log it
        }
      } catch (error) {
        console.error('Error fetching domains:', error);
        setLastError(error);
        setStatus('Error loading domains: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, [connection, walletAddress, connectionStatus]);

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

  // Refactored handleSelectDomain
  const handleSelectDomain = async () => {
    if (!selectedDomain) return;
    let formattedDomain;
    try {
      setDeploymentStage('DEPLOYING');
      setStatus('Deployment in Progress...');
      // 1. Format and validate domain name
      formattedDomain = validateAndFormatDomain(selectedDomain);
      debugLog('Validating domain', { original: selectedDomain, formatted: formattedDomain });
      // 2. Verify domain exists and is owned by the user
      const domainKey = await verifyDomain(connection, formattedDomain, walletAddress);
      debugLog('Domain verified', { domainKey: domainKey.toBase58() });
      // 3. Export and upload to IPFS
      setStatus('Deploying to IPFS...');
      const { ipfsHash, ipfsUrl } = await exportAndUploadToIPFS(elements, websiteSettings, userId, generateFullHtml);
      // 4. Save to Firestore
      await saveDeploymentToFirestore(userId, websiteSettings, ipfsHash, ipfsUrl, formattedDomain, walletAddress);
      // 5. Update SNS domain record
      setStatus('Updating SNS domain...');
      const transaction = await updateSnsDomainRecord(connection, formattedDomain, ipfsUrl, walletAddress);
      // 6. Sign and send transaction
      debugLog('Transaction before signing', {
        recentBlockhash: transaction.recentBlockhash,
        feePayer: transaction.feePayer.toBase58(),
        instructions: transaction.instructions.length
      });
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      debugLog('Transaction sent', { signature });
      // 7. Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      debugLog('Transaction confirmed', { confirmation: confirmation.value });
      if (confirmation.value.err) {
        debugLog('SNS transaction error', { error: confirmation.value.err });
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }
      // 8. Update Firestore with transaction info
      const projectRef = doc(db, 'projects', userId);
      await updateDoc(projectRef, {
        'websiteSettings.deploymentStatus': 'completed',
        'websiteSettings.deploymentTransaction': signature,
        'websiteSettings.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setDeploymentStage('COMPLETE');
      setStatus('Deployment Complete!');
      setAutoSaveStatus('All changes saved.');
      // Open the new domain in a new tab
      const domainUrl = `https://${formattedDomain}`;
      const newTab = window.open(domainUrl, '_blank', 'noopener,noreferrer');
      if (newTab) {
        newTab.blur();
        window.focus();
      }
      if (onDomainSelected) {
        onDomainSelected(formattedDomain);
      }
    } catch (error) {
      console.error('Error deploying to SNS domain:', error);
      setStatus('Error deploying to SNS domain: ' + error.message);
      // Update Firestore with error status
      const projectRef = doc(db, 'projects', userId);
      try {
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          await updateDoc(projectRef, {
            'websiteSettings.deploymentStatus': 'failed',
            'websiteSettings.deploymentError': error.message,
            'websiteSettings.lastUpdated': serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(projectRef, {
            userId,
            websiteSettings: {
              ...websiteSettings,
              snsDomain: formattedDomain || selectedDomain,
              walletAddress: walletAddress,
              deploymentStatus: 'failed',
              deploymentError: error.message,
              lastUpdated: serverTimestamp()
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreError) {
        console.error('Error updating Firestore:', firestoreError);
      }
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

      const isPrimary = primaryDomain?.toBase58() === domainName;

      debugLog('Rendering domain card', {
        originalName: domainName,
        fullName: fullDomainName,
        isPrimary
      });

      return (
        <div
          key={index}
          className={`domain-card ${selectedDomain === fullDomainName ? 'selected' : ''} ${isPrimary ? 'primary' : ''}`}
          onClick={() => setSelectedDomain(selectedDomain === fullDomainName ? null : fullDomainName)}
        >
          <div className="radio-circle">
            <div className="radio-circle-inner" />
          </div>
          <p className="domain-text">{fullDomainName}</p>
          {isPrimary && <span className="primary-badge">Primary</span>}
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
    <div className='domain-selection-modal-bg'>
      <div className="domain-selection-modal">
        <div className="domain-selection-modal-header">
          <div className="domain-selection-modal-header-title-container">
            <h2 className="domain-selection-modal-header-title">Custom Domain</h2>
            {renderConnectionStatus()}
            {renderErrorMessage()}
          </div>
          <div className="domain-selection-modal-header-bot-container">
            <img className='domain-selection-modal-header-bot-img' src='../img/sns-icon.png'></img>
            <p className="domain-selection-modal-header-bot-text">powered by SNS</p>
          </div>
        </div>

        <p className="domain-selection-modal-subtitle">
          Select a domain to deploy your website:
        </p>

        <div className="domain-selection-modal-content-fetching-domains">
          <p className='domain-selection-modal-content-fetching-domains-text'>Fetching domains...</p>

          <div className="domain-selection-modal-content-fetching-domains-loader">

          </div>
        </div>

        <div className="domain-grid">{renderDomainCards()}

          <div
            key={1}
            className={`domain-card ${selectedDomain === "Domain test" ? 'selected' : ''}`}
            onClick={() => setSelectedDomain("Domain test")}
          >
            {/*<div className="radio-circle">
              {selectedDomain === "Domain test" && <div className="radio-circle-inner" />}
            </div>*/}
            <div className='toggle-domain-container'>
              <div 
                className={`toggle-switch ${isToggleActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToggleActive(!isToggleActive);
                }}
              >
                <div className="toggle-switch-inner" />
              </div>
            </div>
            <p className="domain-text">test-domain.sol</p>
          </div>
        </div>

        <div className="buttons">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="select-btn"
            onClick={handleSelectDomain}
            disabled={!selectedDomain || connectionStatus !== CONNECTION_STATUS.CONNECTED}
          >
            Update Domain
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
    </div>
  );
};

export default SnsDomainSelector; 