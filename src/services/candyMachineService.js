/**
 * @deprecated This service uses @metaplex-foundation/js v0.20.1 which is deprecated.
 * TODO: Migrate to @metaplex-foundation/umi for candy machine operations.
 * See production roadmap Phase 2.1.
 */
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';

/**
 * Creates a candy machine on Solana using Metaplex.
 *
 * @param {Object} config - The configuration for the candy machine.
 *   Expected fields include:
 *    - price: mint price in SOL.
 *    - remaining: total supply (number of items available).
 *    - timer: go-live date/time (ISO string).
 *    - title: title for the collection.
 *    - description: description for the NFT collection.
 *    - image: URL or Base64 data for the image.
 *    - currency: either 'SOL' or a token mint address.
 *    - ownerWalletId: the public key of the owner wallet (string).
 * @param {Object} wallet - The wallet object (Keypair) to sign transactions.
 * @returns {Object} The created candy machine object.
 */
export const createCandyMachine = async (config, wallet) => {
  try {
    const connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('devnet')
    );

    // Initialize Metaplex with the user's wallet.
    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

    const {
      price,
      remaining,
      timer,
      title,
      description,
      image,
      currency,
      ownerWalletId,
    } = config;

    // Ensure the go-live date is a Date object.
    const goLiveDate = timer ? new Date(timer) : new Date();

    // Build the candy machine configuration.
    const candyMachineConfig = {
      itemsAvailable: parseInt(remaining, 10),
      sellerFeeBasisPoints: 500, // Example: 5% royalty.
      symbol: 'NFT',
      maxEditionSupply: 0, // 0 means unlimited editions.
      isMutable: true,
      price: parseFloat(price), // Mint price in SOL.
      goLiveDate: goLiveDate,
      // For SOL, treasuryMint is null; for other currencies, provide the token mint address.
      treasuryMint: currency === 'SOL' ? null : new PublicKey(currency),
      // Note: Additional metadata (title, description, image) is usually uploaded off‑chain.
    };

    // Create the candy machine.
    const { candyMachine } = await metaplex.candyMachines().create(candyMachineConfig);

    return candyMachine;
  } catch (error) {
    throw new Error(`Candy machine creation failed: ${error.message}`);
  }
};

