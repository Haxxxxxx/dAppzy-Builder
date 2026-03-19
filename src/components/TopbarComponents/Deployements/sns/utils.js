import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { pinDirectoryToPinata } from '../../../../utils/ipfs';
import { SnsError } from './errors';

// Lazy-load @bonfida/spl-name-service to keep it out of the eagerly-loaded topbar chunk.
// Every function that needs it calls getSns() and awaits the result.
let _snsPromise = null;
const getSns = () => {
  if (!_snsPromise) {
    _snsPromise = import('@bonfida/spl-name-service');
  }
  return _snsPromise;
};

// Debug logging utility — no-op in production
export const debugLog = () => {};

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
  const { getRecordKeySync } = await getSns();
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

// Utility: Get domain state with cache (30s TTL)
const CACHE_TTL_MS = 30000;
const domainStateCache = new Map();
export const getDomainStateWithCache = async (connection, domainKey) => {
  const cacheKey = domainKey.toBase58();
  const cached = domainStateCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    debugLog('Returning cached domain state', { domainKey: cacheKey });
    return cached.data;
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
    const { NameRegistryState, performReverseLookup } = await getSns();
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
    domainStateCache.set(cacheKey, { data: state, timestamp: Date.now() });
    return state;
  } catch (error) {
    debugLog('Error retrieving domain state', {
      error: error.message,
      domainKey: cacheKey
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
  // 2. Upload to IPFS — fileName = siteTitle so IPFS path is /<hash>/<siteTitle>
  const siteTitle = websiteSettings.siteTitle || 'My Website';
  const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
  const files = [{ file: htmlBlob, fileName: siteTitle, type: 'text/html' }];
  const metadata = {
    name: siteTitle,
    keyvalues: { userId, timestamp: new Date().toISOString(), size: htmlBlob.size },
  };
  const ipfsHash = await pinDirectoryToPinata(files, metadata);
  if (!ipfsHash) throw new Error('No IPFS hash returned from Pinata');
  const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}/${encodeURIComponent(siteTitle)}`;
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
  const { createRecordInstruction } = await getSns();
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
  debugLog = () => {}
) {
  try {
    const log = typeof debugLog === 'function' ? debugLog : () => {};

    // Validate wallet
    if (!wallet || !wallet.publicKey) {
      throw new Error('Invalid wallet provided');
    }

    // Validate RPC endpoint
    const rpcEndpoint = import.meta.env.VITE_HELIUS_RPC_URL;
    if (!rpcEndpoint) {
      throw new Error('RPC endpoint not found in environment variables. Please check your .env file.');
    }
    log('Using RPC endpoint:', rpcEndpoint);

    // Validate domain name
    if (!domainName || typeof domainName !== 'string') {
      throw new Error('Invalid domain name provided');
    }

    // Lazy-load SNS helpers needed for this flow
    const {
      getDomainKey,
      NameRegistryState,
      getRecordKeySync,
      NAME_PROGRAM_ID,
      updateRecordInstruction,
    } = await getSns();

    // Ensure domain name is properly formatted
    const formattedDomainName = domainName.endsWith('.sol') ? domainName : `${domainName}.sol`;
    log('Formatted domain name:', formattedDomainName);

    // Create connection
    const connection = new Connection(rpcEndpoint);
    log('Connected to Solana network');

    // Get domain key
    const { pubkey: domainKey } = await getDomainKey(formattedDomainName);
    log('Domain key:', domainKey.toBase58());

    // Get domain state and verify ownership
    const domainInfo = await connection.getAccountInfo(domainKey);
    if (!domainInfo) {
      throw new Error('Domain not found');
    }
    const domainState = await NameRegistryState.retrieve(connection, domainKey);
    const ownerKey = domainState.owner;
    log('Domain owner:', ownerKey.toBase58());

    // Verify the connected wallet owns this domain
    if (ownerKey.toBase58() !== wallet.publicKey.toBase58()) {
      throw new SnsError(
        `Domain ${formattedDomainName} is not owned by your wallet`,
        'OWNERSHIP_ERROR',
        { domain: formattedDomainName, wallet: wallet.publicKey.toBase58() }
      );
    }

    // Check SOL balance before proceeding
    await checkWalletBalance(connection, wallet.publicKey.toBase58());

    // Format IPFS URL
    const formattedIpfsUrl = ipfsHash.startsWith('ipfs://')
      ? ipfsHash
      : `ipfs://${ipfsHash.replace('https://ipfs.io/ipfs/', '')}`;
    log('Formatted IPFS URL:', formattedIpfsUrl);

    // Get record key using sync version (must pass Buffer, not string)
    const recordType = 'IPFS';
    const recordKey = getRecordKeySync(domainKey, Buffer.from(recordType));
    log('Record key:', recordKey.toBase58());

    // Check if record exists
    const recordInfo = await connection.getAccountInfo(recordKey);
    const recordExists = recordInfo !== null;
    log('Record exists:', recordExists);

    // Create transaction
    const transaction = new Transaction();
    const payerKey = wallet.publicKey;
    const programIdKey = NAME_PROGRAM_ID;

    // Calculate space dynamically based on content size (min 1000 bytes for future updates)
    const contentByteLength = Buffer.byteLength(formattedIpfsUrl, 'utf-8');
    const space = Math.max(contentByteLength + 100, 1000);
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
    throw error;
  }
}

// Verify IPFS record update
export const verifyIpfsRecordUpdate = async (connection, domainKey, expectedIpfsUrl) => {
  try {
    const formattedExpectedUrl = formatIpfsUrl(expectedIpfsUrl);

    // Use getIpfsRecord to properly deserialize SNS record data
    const { getIpfsRecord } = await getSns();
    const recordContent = await getIpfsRecord(connection, domainKey);

    if (!recordContent) {
      throw new Error('IPFS record not found after update');
    }

    const matches = recordContent === formattedExpectedUrl;

    debugLog('IPFS record verification', {
      domainKey: domainKey.toBase58(),
      expected: formattedExpectedUrl,
      actual: recordContent,
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

export async function getDomainsForWallet(connection, walletPublicKey, debugLog = () => {}) {
    try {
        if (!walletPublicKey) {
            throw new Error('Wallet public key is required');
        }

        debugLog('Getting domains for wallet:', {
            wallet: walletPublicKey.toString()
        });

        // Lazy-load SNS helpers
        const { getAllDomains, performReverseLookup } = await getSns();

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