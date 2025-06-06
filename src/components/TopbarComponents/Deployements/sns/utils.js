import { PublicKey, Transaction, ComputeBudgetProgram, Connection, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { 
  getHashedName, 
  getNameAccountKey,
  NameRegistryState,
  performReverseLookup,
  createRecordInstruction,
  updateRecordInstruction,
  getAllDomains,
  getDomainInfo as getSnsDomainInfo,
  getRecordKey,
  getDomainKey,
  getRecord,
  getIpfsRecord,
  NAME_PROGRAM_ID,
  getDomainMint,
  getDomainPriceFromName,
  getDomainKeySync,
  getRecordKeySync,
  getRecordV2,
  getRecordV2Key,
  createRecordV2Instruction,
  updateRecordV2Instruction,
  deleteRecordV2,
  RecordVersion
} from '@bonfida/spl-name-service';
import { pinDirectoryToPinata } from '../../../../utils/ipfs';
import { SNS_DOMAIN_PROGRAM } from './constants';
import { SnsError, SnsSimulationError } from './errors';

// Debug logging utility
export const debugLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = data
    ? `[SNS Debug ${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}`
    : `[SNS Debug ${timestamp}] ${message}`;
  console.log(logMessage);
};

// Domain name validation utility
export const validateAndFormatDomain = (domainName) => {
  // Remove .sol if present
  const baseName = domainName.replace(/\.sol$/, '');

  // Basic validation
  if (!baseName || baseName.length === 0) {
    throw new Error('Invalid domain name');
  }

  // Return formatted domain name
  return `${baseName}.sol`;
};

// Helper function to get record type bytes
function getRecordTypeBytes(recordType) {
  // Convert string to array of bytes
  const bytes = new Uint8Array(recordType.length);
  for (let i = 0; i < recordType.length; i++) {
    bytes[i] = recordType.charCodeAt(i);
  }
  return bytes;
}

// Helper function to format IPFS URL
export const formatIpfsUrl = (url) => {
  // If it's already in the correct format, return as is
  if (url.startsWith('ipfs://')) {
    return url;
  }
  
  // Extract the hash from various URL formats
  let hash = url;
  if (url.includes('/ipfs/')) {
    hash = url.split('/ipfs/')[1];
  } else if (url.match(/Qm[a-zA-Z0-9]{44}/)) {
    hash = url.match(/Qm[a-zA-Z0-9]{44}/)[0];
  }
  
  if (!hash) {
    throw new Error('Could not extract IPFS hash from URL');
  }
  
  // Format with ipfs:// prefix
  return `ipfs://${hash}`;
};

// Helper function to get record key
async function deriveRecordKey(domainKey, recordType) {
  const recordTypeBuffer = Buffer.from(recordType);
  return getRecordKeySync(domainKey, recordTypeBuffer);
}

// Utility to check wallet SOL balance
export const checkWalletBalance = async (connection, walletAddress, minBalance = 0.01) => {
  const balanceLamports = await connection.getBalance(new PublicKey(walletAddress));
  const balanceSol = balanceLamports / 1e9;
  debugLog('Wallet balance check', { wallet: walletAddress, balanceSol });
  if (balanceSol < minBalance) {
    throw new SnsError(
      `Insufficient SOL balance (${balanceSol} SOL). Please top up your wallet to at least ${minBalance} SOL to update SNS records.`,
      'INSUFFICIENT_BALANCE',
      { balanceSol, minBalance }
    );
  }
  return balanceSol;
};

// Utility: Debug transaction details
export const debugTransaction = (tx, label) => {
  debugLog(`${label} Transaction Details`, {
    instructions: tx.instructions.map((ix, i) => ({
      index: i,
      programId: ix.programId.toBase58(),
      keys: ix.keys.map(k => ({
        pubkey: k.pubkey.toBase58(),
        isSigner: k.isSigner,
        isWritable: k.isWritable
      }))
    })),
    recentBlockhash: tx.recentBlockhash,
    feePayer: tx.feePayer?.toBase58()
  });
};

// Utility: Get domain state with cache
const domainStateCache = new Map();
export const getDomainStateWithCache = async (connection, domainKey) => {
  const cacheKey = domainKey.toBase58();
  if (domainStateCache.has(cacheKey)) {
    debugLog('Returning cached domain state', { domainKey: cacheKey });
    return domainStateCache.get(cacheKey);
  }
  try {
    // Get account info
    const accountInfo = await connection.getAccountInfo(domainKey);
    if (!accountInfo) {
      throw new Error('Domain account not found');
    }
    debugLog('Domain account info', {
      owner: accountInfo.owner.toBase58(),
      data: accountInfo.data ? 'present' : 'absent',
      lamports: accountInfo.lamports,
      executable: accountInfo.executable,
      rentEpoch: accountInfo.rentEpoch,
      dataLength: accountInfo.data?.length
    });
    // Get domain state
    const domainState = await NameRegistryState.retrieve(connection, domainKey);
    if (!domainState) {
      throw new Error('Domain state not found');
    }
    // Get domain name
    const name = await performReverseLookup(connection, domainKey);
    const state = {
      accountInfo,
      domainState: {
        ...domainState,
        name
      }
    };
    domainStateCache.set(cacheKey, state);
    return state;
  } catch (error) {
    debugLog('Error retrieving domain state', {
      error: error.message,
      domainKey: cacheKey
    });
    throw error;
  }
};

// Add domain cache
const domainCache = new Map();

// Get domains by owner
export const getDomainsByOwner = async (connection, walletAddress) => {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    debugLog('Getting domains for wallet', { wallet: walletAddress });

    // Check cache first
    const cacheKey = walletAddress;
    if (domainCache.has(cacheKey)) {
      debugLog('Returning cached domains', { 
        count: domainCache.get(cacheKey).length 
      });
      return domainCache.get(cacheKey);
    }

    // Get all domains owned by the wallet
    const domainKeys = await getAllDomains(connection, walletPubkey);
    debugLog('Found domain keys', {
      count: domainKeys.length,
      keys: domainKeys.map(k => k.toBase58())
    });

    // Get domain info for each key
    const domains = await Promise.all(
      domainKeys.map(async (key) => {
        try {
          // Get domain state
          const domainState = await NameRegistryState.retrieve(connection, key);
          if (!domainState) {
            debugLog('No domain state found', { key: key.toBase58() });
            return null;
          }

          // Get domain name using reverse lookup
          const name = await performReverseLookup(connection, key);
          if (!name) {
            debugLog('Could not get domain name', { key: key.toBase58() });
            return null;
          }

          const owner = domainState.owner?.toBase58();
          const parent = domainState.parent?.toBase58();
          const classKey = domainState.class?.toBase58();

          debugLog('Domain info retrieved', {
            key: key.toBase58(),
            name,
            owner,
            parent,
            class: classKey
          });

          return {
            key: key.toBase58(),
            name,
            owner,
            parent,
            class: classKey
          };
        } catch (error) {
          debugLog('Error getting domain info', {
            key: key.toBase58(),
            error: error.message
          });
          return null;
        }
      })
    );

    const validDomains = domains.filter(d => d !== null);
    
    // Cache the results
    domainCache.set(cacheKey, validDomains);
    
    return validDomains;
  } catch (error) {
    debugLog('Error getting domains by owner', {
      error: error.message,
      wallet: walletAddress
    });
    throw error;
  }
};

// Export and upload to IPFS
export const exportAndUploadToIPFS = async (elements, websiteSettings, userId, generateFullHtml) => {
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

// Helper function to create record instruction
async function createRecordInstructionWithType(
  recordType,
  content,
  payerKey,
  ownerKey,
  space,
  lamports,
  domainKey,
  programIdKey
) {
  // Convert record type to bytes
  const recordTypeBytes = getRecordTypeBytes(recordType);
  
  // Create a new ArrayBuffer from the Uint8Array
  const arrayBuffer = recordTypeBytes.buffer.slice(
    recordTypeBytes.byteOffset,
    recordTypeBytes.byteOffset + recordTypeBytes.byteLength
  );
  
  // Create the instruction
  return createRecordInstruction(
    arrayBuffer,  // Pass the ArrayBuffer
    content,
    payerKey,
    ownerKey,
    space,
    lamports,
    domainKey,
    programIdKey
  );
}

// Update or create IPFS record
export async function updateOrCreateIpfsRecord(
  wallet,
  domainName,
  ipfsHash,
  debugLog = console.log
) {
  try {
    // Ensure debugLog is a function
    const log = typeof debugLog === 'function' ? debugLog : console.log;

    // Validate wallet
    if (!wallet || !wallet.publicKey) {
      throw new Error('Invalid wallet provided');
    }

    // Validate RPC endpoint
    const rpcEndpoint = process.env.REACT_APP_HELIUS_RPC_URL;
    if (!rpcEndpoint) {
      throw new Error('RPC endpoint not found in environment variables. Please check your .env file.');
    }
    log('Using RPC endpoint:', rpcEndpoint);

    // Validate domain name
    if (!domainName || typeof domainName !== 'string') {
      throw new Error('Invalid domain name provided');
    }

    // Ensure domain name is properly formatted
    const formattedDomainName = domainName.endsWith('.sol') ? domainName : `${domainName}.sol`;
    log('Formatted domain name:', formattedDomainName);

    // Create connection
    const connection = new Connection(rpcEndpoint);
    log('Connected to Solana network');

    // Get domain key
    const { pubkey: domainKey } = await getDomainKey(formattedDomainName);
    log('Domain key:', domainKey.toBase58());

    // Get domain owner
    const domainInfo = await connection.getAccountInfo(domainKey);
    if (!domainInfo) {
      throw new Error('Domain not found');
    }
    const ownerKey = new PublicKey(domainInfo.owner);
    log('Domain owner:', ownerKey.toBase58());

    // Format IPFS URL
    const formattedIpfsUrl = ipfsHash.startsWith('ipfs://') 
      ? ipfsHash 
      : `ipfs://${ipfsHash.replace('https://ipfs.io/ipfs/', '')}`;
    log('Formatted IPFS URL:', formattedIpfsUrl);

    // Get record key using sync version
    const recordType = 'IPFS';
    const recordKey = getRecordKeySync(formattedDomainName, recordType);
    log('Record key:', recordKey.toBase58());

    // Check if record exists
    const recordInfo = await connection.getAccountInfo(recordKey);
    const recordExists = recordInfo !== null;
    log('Record exists:', recordExists);

    // Create transaction
    const transaction = new Transaction();
    const payerKey = wallet.publicKey;
    const programIdKey = NAME_PROGRAM_ID;

    // Calculate space and lamports
    const space = 1000; // Fixed space for IPFS records
    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    log('Space:', space, 'Lamports:', lamports);

    let instruction;
    if (recordExists) {
      // Update existing record
      log('Updating existing record...');
      instruction = await updateRecordInstruction(
        recordKey,
        formattedIpfsUrl,
        payerKey,
        ownerKey
      );
    } else {
      // Create new record
      log('Creating new record...');
      
      // Get record type bytes using helper function
      const recordTypeBytes = getRecordTypeBytes(recordType);
      const arrayBuffer = recordTypeBytes.buffer.slice(
        recordTypeBytes.byteOffset,
        recordTypeBytes.byteOffset + recordTypeBytes.byteLength
      );
      
      log('Record type bytes:', {
        type: recordTypeBytes.constructor.name,
        isUint8Array: recordTypeBytes instanceof Uint8Array,
        length: recordTypeBytes.length,
        content: Array.from(recordTypeBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
        raw: recordTypeBytes,
        arrayBuffer: {
          type: arrayBuffer.constructor.name,
          isArrayBuffer: arrayBuffer instanceof ArrayBuffer,
          byteLength: arrayBuffer.byteLength
        }
      });

      // Log all parameters for debugging
      log('Creating record with parameters:', {
        recordTypeBytes: Array.from(recordTypeBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
        formattedIpfsUrl,
        payerKey: payerKey.toBase58(),
        ownerKey: ownerKey.toBase58(),
        space,
        lamports,
        domainKey: domainKey.toBase58(),
        programIdKey: programIdKey.toBase58()
      });

      // Create a new record using our helper function
      instruction = await createRecordInstructionWithType(
        recordType,
        formattedIpfsUrl,
        payerKey,
        ownerKey,
        space,
        lamports,
        domainKey,
        programIdKey
      );
    }

    transaction.add(instruction);

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerKey;

    // Sign and send transaction
    log('Signing transaction...');
    const signedTx = await wallet.signTransaction(transaction);
    log('Sending transaction...');
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    log('Transaction sent:', signature);

    // Confirm transaction
    log('Confirming transaction...');
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    log('Transaction confirmed:', signature);
    return signature;
  } catch (error) {
    console.error('Error in updateOrCreateIpfsRecord:', error);
    throw error;
  }
}

// Verify IPFS record update
export const verifyIpfsRecordUpdate = async (connection, domainKey, expectedIpfsUrl) => {
  try {
    const formattedExpectedUrl = formatIpfsUrl(expectedIpfsUrl);
    const recordKey = await deriveRecordKey(domainKey, 'IPFS');
    const accountInfo = await connection.getAccountInfo(recordKey);
    
    if (!accountInfo || !accountInfo.data) {
      throw new Error('IPFS record not found after update');
    }

    const recordData = accountInfo.data.toString();
    const matches = recordData === formattedExpectedUrl;
    
    debugLog('IPFS record verification', {
      domainKey: domainKey.toBase58(),
      expected: formattedExpectedUrl,
      actual: recordData,
      matches
    });

    if (!matches) {
      throw new Error('IPFS record content does not match expected value');
    }

    return true;
  } catch (error) {
    debugLog('Error verifying IPFS record', {
      error: error.message,
      domainKey: domainKey.toBase58()
    });
    throw error;
  }
};

export async function getDomainsForWallet(connection, walletPublicKey, debugLog = console.log) {
    try {
        if (!walletPublicKey) {
            throw new Error('Wallet public key is required');
        }

        debugLog('Getting domains for wallet:', {
            wallet: walletPublicKey.toString()
        });

        // Get all domains owned by the wallet
        const domainKeys = await getAllDomains(connection, walletPublicKey);
        
        if (!domainKeys || domainKeys.length === 0) {
            debugLog('No domains found for wallet');
            return [];
        }

        debugLog('Found domain keys:', {
            count: domainKeys.length,
            keys: domainKeys.map(key => key.toString())
        });

        // Get domain info for each key
        const domainInfoPromises = domainKeys.map(async (domainKey) => {
            try {
                if (!(domainKey instanceof PublicKey)) {
                    debugLog('Invalid domain key:', { domainKey });
                    return null;
                }

                const name = await performReverseLookup(connection, domainKey);
                if (!name) {
                    debugLog('Could not get domain name for key:', { key: domainKey.toString() });
                    return null;
                }

                return {
                    key: domainKey.toString(),
                    name: name
                };
            } catch (error) {
                debugLog('Error getting domain name:', {
                    key: domainKey.toString(),
                    error: error.message
                });
                return null;
            }
        });

        const domainInfo = await Promise.all(domainInfoPromises);
        const validDomains = domainInfo.filter(d => d !== null);
        
        // Set primary domain if available
        if (validDomains.length > 0) {
            const primaryDomain = validDomains[0].name;
            debugLog('Primary domain set:', { primaryDomain });
        }

        return validDomains;
    } catch (error) {
        debugLog('Error getting domains:', {
            error: error.message,
            errorType: error.constructor.name,
            stack: error.stack
        });
        throw error;
    }
} 