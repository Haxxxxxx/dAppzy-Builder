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
import { ComputeBudgetProgram } from '@solana/web3.js';

// SNS Program IDs from config
const SNS_DOMAIN_PROGRAM = new PublicKey(Web3Configs.sns.domainProgram);
const SNS_DOMAIN_REGISTRY = new PublicKey(Web3Configs.sns.domainRegistry);
const TOKEN_PROGRAM_ID = new PublicKey(Web3Configs.sns.tokenProgram);

// Get RPC endpoints from config
const RPC_ENDPOINTS = Web3Configs.rpc.getEndpoints();

// Add devnet configuration for transactions
const DEVNET_CONFIG = {
  endpoint: 'https://api.devnet.solana.com',
  commitment: 'confirmed',
  wsEndpoint: 'wss://api.devnet.solana.com',
  confirmTransactionInitialTimeout: 60000
};

// Add mainnet configuration for domain operations
const MAINNET_CONFIG = {
  endpoint: RPC_ENDPOINTS[0] || 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed',
  wsEndpoint: Web3Configs.rpc.helius.snsConfig.wsEndpoint(),
  confirmTransactionInitialTimeout: 30000
};

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

// Add new utility function to verify domain record update
const verifyDomainRecordUpdate = async (connection, domainName, expectedContent) => {
  try {
    const domainKey = await getNameAccountKey(await getHashedName(domainName.replace(/\.sol$/, '')));
    const domainState = await NameRegistryState.retrieve(connection, domainKey);
    
    if (!domainState || !domainState.data) {
      throw new Error('Domain record not found or empty');
    }

    const recordContent = domainState.data.toString();
    debugLog('Domain record content', {
      domain: domainName,
      expected: expectedContent,
      actual: recordContent
    });

    return recordContent === expectedContent;
  } catch (error) {
    debugLog('Error verifying domain record', {
      error: error.message,
      domain: domainName
    });
    throw error;
  }
};

// Add new utility function to create domain record
const createDomainRecord = async (connection, domainName, recordType, recordValue, authority) => {
  try {
    debugLog('Creating new domain record', {
      domain: domainName,
      recordType,
      recordValue,
      authority: authority.toBase58()
    });

    // Get domain key
    const hashedName = await getHashedName(domainName);
    const domainKey = await getNameAccountKey(hashedName);
    
    // Create record instruction with proper structure
    const createIx = await createRecordInstruction(
      connection,
      domainName,
      recordType,
      recordValue,
      authority,
      authority,
      {
        space: 1000, // Allocate space for the record
        owner: SNS_DOMAIN_PROGRAM, // Set the program as owner
        lamports: await connection.getMinimumBalanceForRentExemption(1000), // Add rent exemption
        programId: SNS_DOMAIN_PROGRAM // Explicitly set program ID
      }
    );

    const transaction = new Transaction();
    
    // Add compute budget instruction to ensure enough compute units
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ 
      units: 300000 
    });
    transaction.add(modifyComputeUnits);
    
    // Add the create record instruction
    transaction.add(createIx);

    // Get latest blockhash and set fee payer
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = authority;

    debugLog('Create record transaction prepared', {
      blockhash,
      feePayer: authority.toBase58(),
      instructionCount: transaction.instructions.length,
      domainKey: domainKey.toBase58(),
      programId: SNS_DOMAIN_PROGRAM.toBase58()
    });

    return transaction;
  } catch (error) {
    debugLog('Error creating domain record', {
      error: error.message,
      domain: domainName
    });
    throw error;
  }
};

// Update the updateSnsDomainRecord function
const updateSnsDomainRecord = async (connection, formattedDomain, ipfsUrl, walletAddress) => {
  const domainName = formattedDomain.replace(/\.sol$/, '');
  const authority = new PublicKey(walletAddress);
  const data = Buffer.from(ipfsUrl, 'utf-8');
  const offset = 0;

  debugLog('Starting SNS record update (using updateNameRegistryData)', {
    domain: domainName,
    recordValue: ipfsUrl,
    authority: authority.toBase58()
  });

  // Check record size before updating
  try {
    // Derive the record key for the content record
    const recordKey = await getNameAccountKey(await getHashedName(domainName));
    const recordInfo = await connection.getAccountInfo(recordKey);
    const currentSize = recordInfo?.data?.length || 0;
    debugLog('Current record size', { currentSize, newDataLength: data.length });
    if (data.length > currentSize) {
      const errorMsg = `Record too small for new data (${data.length} bytes > ${currentSize} bytes). Please delete and recreate the record with a larger size.`;
      debugLog('Record size error', { errorMsg });
      throw new Error(errorMsg);
    }

    const ix = await updateNameRegistryData(
      connection,
      domainName,
      offset,
      data,
      undefined,
      ROOT_DOMAIN_ACCOUNT
    );
    const transaction = new Transaction();
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 });
    transaction.add(modifyComputeUnits);
    transaction.add(ix);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = authority;
    debugLog('Update record transaction prepared (updateNameRegistryData)', {
      blockhash,
      feePayer: authority.toBase58(),
      instructionCount: transaction.instructions.length
    });
    return transaction;
  } catch (error) {
    debugLog('Error in updateNameRegistryData', {
      error: error.message,
      domain: domainName
    });
    throw error;
  }
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
  const [mainnetConnection, setMainnetConnection] = useState(null);
  const [devnetConnection, setDevnetConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.INITIALIZING);
  const [connectionError, setConnectionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [primaryDomain, setPrimaryDomain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enabledDomains, setEnabledDomains] = useState({});
  const [deploymentStep, setDeploymentStep] = useState('preparing');
  const [deploymentProgress, setDeploymentProgress] = useState({
    preparing: true,
    uploading: false,
    updating: false,
    confirming: false,
    complete: false
  });

  // Initialize both mainnet and devnet connections
  useEffect(() => {
    const initializeConnections = async () => {
      try {
        setConnectionStatus(CONNECTION_STATUS.CONNECTING);

        // Initialize mainnet connection for domain operations
        const mainnetConn = new Connection(MAINNET_CONFIG.endpoint, {
          commitment: MAINNET_CONFIG.commitment,
          confirmTransactionInitialTimeout: MAINNET_CONFIG.confirmTransactionInitialTimeout,
          wsEndpoint: MAINNET_CONFIG.wsEndpoint
        });

        // Initialize devnet connection for transactions
        const devnetConn = new Connection(DEVNET_CONFIG.endpoint, {
          commitment: DEVNET_CONFIG.commitment,
          confirmTransactionInitialTimeout: DEVNET_CONFIG.confirmTransactionInitialTimeout,
          wsEndpoint: DEVNET_CONFIG.wsEndpoint
        });

        // Test both connections
        await Promise.all([
          mainnetConn.getVersion(),
          devnetConn.getVersion()
        ]);

        setMainnetConnection(mainnetConn);
        setDevnetConnection(devnetConn);
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setStatus('Connected to Solana networks. Scanning for domains...');
        setConnectionError(null);
        setRetryCount(0);
      } catch (error) {
        console.error(`Failed to connect to Solana networks:`, error);
        setConnectionError(error.message);
        setLastError(error);
        setConnectionStatus(CONNECTION_STATUS.ERROR);
        setStatus('Error: Unable to connect to Solana networks. Please try again.');
      }
    };

    initializeConnections();
  }, []);

  // Fetch domains using mainnet connection
  useEffect(() => {
    const fetchDomains = async () => {
      if (!mainnetConnection || !walletAddress || connectionStatus !== CONNECTION_STATUS.CONNECTED) {
        return;
      }

      try {
        setIsLoading(true);
        setStatus('Loading domains...');

        const walletPubkey = new PublicKey(walletAddress);

        // Get domains with reverses using mainnet
        const domainsWithReverses = await getDomainKeysWithReverses(mainnetConnection, walletPubkey);
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
          const domainKeys = await getAllDomains(mainnetConnection, walletPubkey);
          const domains = domainKeys.map(key => key.toBase58());
          setDomains(domains);
          setStatus('Found SNS domains in your wallet.');
        }

        // Get primary domain using mainnet
        try {
          const { domain } = await getPrimaryDomain(mainnetConnection, walletPubkey);
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
  }, [mainnetConnection, walletAddress, connectionStatus]);

  const handleDomainToggle = (domainName) => {
    setEnabledDomains(prev => {
      const newState = {};
      // Disable all other domains
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      // Toggle the clicked domain
      newState[domainName] = !prev[domainName];
      return newState;
    });

    // Update selected domain
    setSelectedDomain(prev => prev === domainName ? null : domainName);
  };

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

  // Update handleSelectDomain to use mainnet for domain operations
  const handleSelectDomain = async () => {
    if (!selectedDomain || !mainnetConnection) return;
    let formattedDomain;
    try {
      setDeploymentStage('DEPLOYING');
      setStatus('Deployment in Progress...');
      
      // Step 1: Preparing
      setDeploymentProgress(prev => ({ ...prev, preparing: true }));
      setDeploymentStep('preparing');
      
      // 1. Format and validate domain name
      formattedDomain = validateAndFormatDomain(selectedDomain);
      debugLog('Validating domain', { original: selectedDomain, formatted: formattedDomain });
      
      // 2. Verify domain exists and is owned by the user (using mainnet)
      const domainKey = await verifyDomain(mainnetConnection, formattedDomain, walletAddress);
      debugLog('Domain verified', { domainKey: domainKey.toBase58() });
      
      // Step 2: Uploading
      setDeploymentProgress(prev => ({ ...prev, uploading: true }));
      setDeploymentStep('uploading');
      
      // 3. Export and upload to IPFS
      setStatus('Deploying to IPFS...');
      const { ipfsHash, ipfsUrl } = await exportAndUploadToIPFS(elements, websiteSettings, userId, generateFullHtml);
      
      // 4. Save to Firestore
      await saveDeploymentToFirestore(userId, websiteSettings, ipfsHash, ipfsUrl, formattedDomain, walletAddress);
      
      // Step 3: Updating
      setDeploymentProgress(prev => ({ ...prev, updating: true }));
      setDeploymentStep('updating');
      
      // 5. Update SNS domain record (using mainnet)
      setStatus('Updating SNS domain...');
      const transaction = await updateSnsDomainRecord(mainnetConnection, formattedDomain, ipfsUrl, walletAddress);
      
      // Step 4: Confirming
      setDeploymentProgress(prev => ({ ...prev, confirming: true }));
      setDeploymentStep('confirming');
      
      // 6. Simulate transaction before signing
      debugLog('Simulating transaction before signing', {
        recentBlockhash: transaction.recentBlockhash,
        feePayer: transaction.feePayer.toBase58(),
        instructions: transaction.instructions.length
      });
      const simulation = await mainnetConnection.simulateTransaction(transaction);
      if (simulation.value.err) {
        debugLog('Simulation failed', { err: simulation.value.err, logs: simulation.value.logs });
        setStatus('Simulation failed: ' + JSON.stringify(simulation.value.err));
        // Optionally show a modal or notification to the user
        return; // Do not proceed to signing
      }

      // 7. Sign and send transaction (using mainnet)
      debugLog('Transaction before signing', {
        recentBlockhash: transaction.recentBlockhash,
        feePayer: transaction.feePayer.toBase58(),
        instructions: transaction.instructions.length
      });
      const signed = await window.solana.signTransaction(transaction);
      const signature = await mainnetConnection.sendRawTransaction(signed.serialize());
      debugLog('Transaction sent', { signature });
      
      // 8. Wait for confirmation
      const confirmation = await mainnetConnection.confirmTransaction(signature, 'confirmed');
      debugLog('Transaction confirmed', { confirmation: confirmation.value });
      
      if (confirmation.value.err) {
        debugLog('SNS transaction error', { error: confirmation.value.err });
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      // Add delay to allow for record propagation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 9. Verify the domain record was updated
      setStatus('Verifying domain update...');
      const isUpdated = await verifyDomainRecordUpdate(mainnetConnection, formattedDomain, ipfsUrl);
      
      if (!isUpdated) {
        throw new Error('Domain record was not updated correctly');
      }
      
      debugLog('Domain record verified', {
        domain: formattedDomain,
        ipfsUrl
      });
      
      // Step 5: Complete
      setDeploymentProgress(prev => ({ ...prev, complete: true }));
      setDeploymentStep('complete');
      
      // 10. Update Firestore with transaction info
      const projectRef = doc(db, 'projects', userId);
      await updateDoc(projectRef, {
        'websiteSettings.deploymentStatus': 'completed',
        'websiteSettings.deploymentTransaction': signature,
        'websiteSettings.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Set completion state
      setDeploymentStage('COMPLETE');
      
      // Notify parent component
      if (onDomainSelected) {
        onDomainSelected(formattedDomain);
      }

      // Open the new domain in a new tab after a short delay
      setTimeout(() => {
        const domainUrl = `https://${formattedDomain}`;
        window.open(domainUrl, '_blank');
      }, 1000);

    } catch (error) {
      console.error('Error deploying to SNS domain:', error);
      
      // Get detailed error logs if available
      let errorMessage = error.message;
      if (error.logs) {
        debugLog('Transaction error logs', { logs: error.logs });
        errorMessage += '\nTransaction logs: ' + error.logs.join('\n');
      }
      
      setStatus('Error deploying to SNS domain: ' + errorMessage);
      
      // Update Firestore with error status
      const projectRef = doc(db, 'projects', userId);
      try {
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          await updateDoc(projectRef, {
            'websiteSettings.deploymentStatus': 'failed',
            'websiteSettings.deploymentError': errorMessage,
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
              deploymentError: errorMessage,
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
    if (isLoading) {
      return (
        <div className="domain-selection-modal-content-fetching-domains">
          <p className="domain-selection-modal-content-fetching-domains-text">
            Fetching domains...
          </p>
          <div className="domain-selection-modal-content-fetching-domains-loader" />
        </div>
      );
    }

    if (!domains || domains.length === 0) return null;

    return domains.map((domainName, index) => {
      if (!domainName) {
        debugLog('Skipping invalid domain name', { index });
        return null;
      }

      const fullDomainName = typeof domainName === 'string' && domainName.endsWith('.sol')
        ? domainName
        : `${domainName}.sol`;

      const isPrimary = primaryDomain?.toBase58() === domainName;
      const isEnabled = enabledDomains[fullDomainName] || false;

      return (
        <div
          key={index}
          className={`domain-card ${isEnabled ? 'selected' : ''} ${isPrimary ? 'primary' : ''}`}
          onClick={() => handleDomainToggle(fullDomainName)}
        >
          <div className="toggle-domain-container">
            <div 
              className={`toggle-switch ${isEnabled ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDomainToggle(fullDomainName);
              }}
            >
              <div className="toggle-switch-inner" />
            </div>
          </div>
          <p className="domain-text">{fullDomainName}</p>
          {isPrimary && <span className="primary-badge">Primary</span>}
        </div>
      );
    }).filter(Boolean);
  };

  // Loading state
  if (deploymentStage === 'DEPLOYING') {
    return (
      <div className="domain-selection-modal-bg">
        <div className="domain-selection-modal deployment-modal">
          <button className="close-btn" onClick={onCancel}>×</button>
          <div className="deployment-status">
            <div className="spinner" />
            <h2>Deployment in Progress</h2>
            <p>Your project is currently being deployed to your SNS domain. This may take a few moments.</p>
            
            <div className="deployment-timeline">
              <div className={`timeline-step ${deploymentProgress.preparing ? 'active' : ''} ${deploymentProgress.uploading || deploymentProgress.updating || deploymentProgress.confirming || deploymentProgress.complete ? 'completed' : ''}`}>
                <div className="step-icon">1</div>
                <div className="step-content">
                  <h3>Preparing Content</h3>
                  <p>Generating and validating website content</p>
                </div>
              </div>

              <div className={`timeline-step ${deploymentProgress.uploading ? 'active' : ''} ${deploymentProgress.updating || deploymentProgress.confirming || deploymentProgress.complete ? 'completed' : ''}`}>
                <div className="step-icon">2</div>
                <div className="step-content">
                  <h3>Uploading to IPFS</h3>
                  <p>Storing your website on IPFS</p>
                </div>
              </div>

              <div className={`timeline-step ${deploymentProgress.updating ? 'active' : ''} ${deploymentProgress.confirming || deploymentProgress.complete ? 'completed' : ''}`}>
                <div className="step-icon">3</div>
                <div className="step-content">
                  <h3>Updating SNS Record</h3>
                  <p>Linking IPFS content to your domain</p>
                </div>
              </div>

              <div className={`timeline-step ${deploymentProgress.confirming ? 'active' : ''} ${deploymentProgress.complete ? 'completed' : ''}`}>
                <div className="step-icon">4</div>
                <div className="step-content">
                  <h3>Confirming Transaction</h3>
                  <p>Waiting for blockchain confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (deploymentStage === 'COMPLETE') {
    return (
      <div className="domain-selection-modal-bg">
        <div className="domain-selection-modal deployment-modal">
          <button className="close-btn" onClick={onCancel}>×</button>
          <div className="deployment-status">
            <div className="check-circle" />
            <h2>Deployment Complete</h2>
            <p>Your project has been successfully deployed to your SNS domain.</p>
            
            <div className="deployment-timeline">
              <div className="timeline-step completed">
                <div className="step-icon">1</div>
                <div className="step-content">
                  <h3>Preparing Content</h3>
                  <p>Content generated and validated</p>
                </div>
              </div>

              <div className="timeline-step completed">
                <div className="step-icon">2</div>
                <div className="step-content">
                  <h3>Uploading to IPFS</h3>
                  <p>Website stored on IPFS</p>
                </div>
              </div>

              <div className="timeline-step completed">
                <div className="step-icon">3</div>
                <div className="step-content">
                  <h3>Updating SNS Record</h3>
                  <p>IPFS content linked to domain</p>
                </div>
              </div>

              <div className="timeline-step completed">
                <div className="step-icon">4</div>
                <div className="step-content">
                  <h3>Confirming Transaction</h3>
                  <p>Transaction confirmed on blockchain</p>
                </div>
              </div>
            </div>

            <div className="deployment-actions">
              <button 
                className="view-site-btn"
                onClick={() => {
                  const domainUrl = `https://${selectedDomain}`;
                  window.open(domainUrl, '_blank');
                }}
              >
                View Site
              </button>
              <button 
                className="close-deployment-btn"
                onClick={onCancel}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Selection state
  return (
    <div className="domain-selection-modal-bg">
      <div className="domain-selection-modal">
        <div className="domain-selection-modal-header">
          <div className="domain-selection-modal-header-title-container">
            <h2 className="domain-selection-modal-header-title">Custom Domain</h2>
            {renderConnectionStatus()}
            {renderErrorMessage()}
          </div>
          <div className="domain-selection-modal-header-bot-container">
            <img className='domain-selection-modal-header-bot-img' src='../img/sns-icon.png' alt="SNS" />
            <p className="domain-selection-modal-header-bot-text">powered by SNS</p>
          </div>
        </div>

        <p className="domain-selection-modal-subtitle">
          Select a domain to deploy your website:
        </p>

        {renderDomainCards()}

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