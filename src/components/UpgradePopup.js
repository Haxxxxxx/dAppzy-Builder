import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSubscription } from '../context/SubscriptionContext';
import { useWalletContext } from '../context/WalletContext';
import './css/UpgradePopup.css';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getPlanPrice, PLANS, getPlanFeatures } from '../utils/planConfig';

const ADMIN_WALLET = process.env.REACT_APP_SOLANA_ADMIN_WALLET;

// Configure RPC endpoints
const HELIUS_RPC = process.env.REACT_APP_HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_API_KEY}`
  : null;

// Fallback RPC endpoints in case Helius fails
const FALLBACK_RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana'
];

// Combine all endpoints, prioritizing Helius if available
const RPC_ENDPOINTS = [
  HELIUS_RPC,
  ...FALLBACK_RPC_ENDPOINTS
].filter(Boolean); // Remove null/undefined values

const isValidSolanaAddress = (address) => {
  try {
    if (!address) return false;
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

const UpgradePopup = ({ onClose, userProfile, userPlan }) => {
  const { setSubscriptionStatus } = useSubscription();
  const { walletAddress, isConnected, connectWallet, isLoading: walletLoading } = useWalletContext();
  const [selectedPlan, setSelectedPlan] = useState('pioneer');
  const [billingCycle, setBillingCycle] = useState('annual');
  const [step, setStep] = useState('select-plan'); // 'select-plan' | 'form' | 'paying' | 'success' | 'error'
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const [displayWallet, setDisplayWallet] = useState(null);
  const [transactionSignature, setTransactionSignature] = useState(null);
  const [toggleYearly, setToggleYearly] = useState(true);
  const planBillingCycle = toggleYearly ? 'yearly' : 'monthly';
  const pioneerPrice = getPlanPrice('pioneer', planBillingCycle) || 20;
  const [solUsd, setSolUsd] = useState(null);

  // Fetch SOL price
  useEffect(() => {
    async function fetchSolPriceUSD() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await res.json();
        setSolUsd(data.solana.usd);
      } catch (err) {
        console.error('Failed to fetch SOL price:', err);
        setSolUsd(null);
      }
    }
    fetchSolPriceUSD();
    const interval = setInterval(fetchSolPriceUSD, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Update the price display in the UI
  const renderPrice = (planType, showSolPrice = false) => {
    const price = getPlanPrice(planType, billingCycle);
    const solEquivalent = solUsd ? (price / solUsd).toFixed(4) : '...';
    
    return (
      <div className="membership-card-price-row">
        <div className="membership-card-price">
          <img src='../img/usdc-logo.png' alt="USDC" />
          {price}
        </div>
        <span className="membership-card-currency">/month</span>
        {showSolPrice && planType === 'pioneer' && (
          <span className="sol-price">
            ≈ {solEquivalent} SOL
          </span>
        )}
      </div>
    );
  };

  // Calculate prices and discounts
  const usdcPrice = getPlanPrice('pioneer', billingCycle);
  const solPrice = solUsd ? (usdcPrice / solUsd).toFixed(4) : null;
  
  const hasAdminDiscount = userProfile?.community === 'Admin';
  const hasSuperteamDiscount = userProfile?.community === 'Superteam' && userProfile?.referralCode === 'SUPERTEAM25';
  
  const finalSolPrice = hasAdminDiscount ? 0 : 
                       hasSuperteamDiscount ? (solPrice / 2).toFixed(4) : 
                       solPrice;

  // Get Solana wallet address
  const getSolanaWalletAddress = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        // If already connected, just get the public key
        if (window.solana.isConnected) {
          const { publicKey } = window.solana;
          if (!publicKey) {
            throw new Error('No account found in Phantom wallet');
          }
          return publicKey.toString();
        }

        // Try to connect with a timeout
        const connectPromise = window.solana.connect();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );

        try {
          const { publicKey } = await Promise.race([connectPromise, timeoutPromise]);
          if (!publicKey) {
            throw new Error('No account found in Phantom wallet');
          }
          return publicKey.toString();
        } catch (err) {
          if (err.code === 4001) {
            throw new Error('Wallet connection was cancelled');
          } else if (err.message.includes('wallet must has at least one account')) {
            throw new Error('No account found in Phantom wallet');
          }
          throw err;
        }
      } catch (error) {
        console.error('Failed to get wallet address:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const getWallet = async () => {
      const solanaAddress = await getSolanaWalletAddress();
      setDisplayWallet(solanaAddress);
    };
    getWallet();
  }, [isConnected]);

  // Try to get a working connection
  const getWorkingConnection = async () => {
    for (const endpoint of RPC_ENDPOINTS) {
      try {
        setDebug(`Trying to connect to ${endpoint}...`);
        const connection = new Connection(endpoint, 'confirmed');
        // Test the connection
        await connection.getLatestBlockhash();
        setDebug(`Successfully connected to ${endpoint}`);
        return connection;
      } catch (error) {
        console.warn(`Failed to connect to ${endpoint}:`, error);
        setDebug(`Failed to connect to ${endpoint}: ${error.message}`);
        continue;
      }
    }
    throw new Error('Failed to connect to any Solana RPC endpoint');
  };

  // Payment handler
  const handleConfirmUpgrade = async () => {
    setStep('paying');
    setError('');
    setDebug('');
    try {
      if (!displayWallet || !isValidSolanaAddress(displayWallet)) {
        setStep('error');
        setError('Please connect a valid Solana wallet before proceeding.');
        return;
      }
      if (!window.solana || !isConnected) {
        setStep('error');
        setError('Phantom wallet not connected. Please connect your wallet.');
        return;
      }

      const connection = await getWorkingConnection();
      const fromWallet = new PublicKey(displayWallet);
      const toWallet = new PublicKey(ADMIN_WALLET);

      // Calculate final price with discounts
      const usdcPrice = getPlanPrice('pioneer', billingCycle);
      const solPrice = solUsd ? (usdcPrice / solUsd) : 0;
      const hasAdminDiscount = userProfile?.community === 'Admin';
      const hasSuperteamDiscount = userProfile?.community === 'Superteam' && userProfile?.referralCode === 'SUPERTEAM25';
      
      const finalSolPrice = hasAdminDiscount ? 0 : 
                           hasSuperteamDiscount ? solPrice / 2 : 
                           solPrice;

      const lamports = Math.round(finalSolPrice * LAMPORTS_PER_SOL);

      // Check SOL balance
      const balanceLamports = await connection.getBalance(fromWallet);
      if (balanceLamports < lamports) {
        setStep('error');
        setError(`Insufficient SOL balance. You need ${finalSolPrice.toFixed(4)} SOL.`);
        return;
      }

      // Create SOL transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromWallet,
          toPubkey: toWallet,
          lamports,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromWallet;

      const signed = await window.solana.signTransaction(transaction);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });

      // Store the transaction signature
      setTransactionSignature(sig);

      const confirmation = await connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      // Create transaction record
      const transactionRecord = {
        walletId: displayWallet,
        PlanTitle: 'Pioneer Plan',
        solAmount: finalSolPrice.toFixed(4),
        solLink: `https://solscan.io/tx/${sig}`,
        price: `$ ${usdcPrice.toFixed(2)}`,
        date: new Date().toISOString()
      };

      // Add transaction to transactions collection
      await addDoc(collection(db, "transactions"), transactionRecord);

      // Update Firestore with new subscription
      const userRef = doc(db, 'users', displayWallet);
      await updateDoc(userRef, {
        subscriptionStatus: 'pioneer',
        upgradedAt: new Date().toISOString(),
        billingCycle,
        subscriptionStartDate: new Date().toISOString(),
        subscriptionEndDate: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        appliedDiscount: hasAdminDiscount ? 'admin' : hasSuperteamDiscount ? 'superteam' : null,
        originalPrice: usdcPrice,
        finalPrice: finalSolPrice
      });

      setSubscriptionStatus('pioneer');
      setStep('success');
    } catch (e) {
      setStep('error');
      setError(`An error occurred while processing your payment: ${e.message}`);
      console.error('Upgrade payment error:', e);
    }
  };

  // Overlay modals for paying, success, error
  if (step === 'paying') {
    return (
      <div className="upgrade-popup-overlay">
        <div className="upgrade-popup wide" style={{ paddingBottom: '50px' }}>
          <div className='upgrade-popup-title-box-right'>
            <button className="upgrade-popup-close-button" onClick={onClose}>×</button>
          </div>
          <div className="upgrade-popup-spinner"></div>

          <h2 className="upgrade-title">Processing Payment…</h2>
          <div className="upgrade-section-label">Please approve the transaction in your wallet.</div>
        </div>
      </div>
    );
  }
  if (step === 'success') {
    return (
      <div className="upgrade-popup-overlay">
        <div className="upgrade-popup wide">
          <div className='upgrade-popup-title-box-right'>
            <button className="upgrade-popup-close-button" onClick={() => {
              onClose();
              window.location.reload();
            }}>×</button>
          </div>
          <i className="bi bi-check2-circle" style={{ fontSize: '40px', color: 'var(--purple)' }}></i>
          <h2 className="upgrade-title">Upgrade Successful!</h2>
          <div className="upgrade-section-label">You are now a Pioneer 🚀</div>
          {transactionSignature && (
            <div className="upgrade-confirm-btn">
              <a
                href={`https://solscan.io/tx/${transactionSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="solscan-link"
              >
                View Transaction on Solscan
              </a>
            </div>
          )}
          
        </div>
      </div>
    );
  }
  if (step === 'error') {
    return (
      <div className="upgrade-popup-overlay">
        <div className="upgrade-popup wide" style={{ paddingBottom: '50px' }}>
          <div className='upgrade-popup-title-box-right'>
            <button className="upgrade-popup-close-button" onClick={onClose}>×</button>
          </div>
          <i class="bi bi-x-circle" style={{ fontSize: '40px', color: 'var(--purple)' }}></i>
          <h2 className="upgrade-title">Payment Error</h2>
          <div className="upgrade-section-label">{error}</div>
          <button className="upgrade-confirm-btn" onClick={() => setStep('form')}>Try Again</button>
        </div>
      </div>
    );
  }

  // Plan selection UI
  if (step === 'select-plan') {
    return (
      <div className="upgrade-popup-overlay">
        <div className="upgrade-popup wide">
          <div className='upgrade-popup-title-box'>
            <h2 className="upgrade-title">Choose Your Plan</h2>
            <button className="upgrade-popup-close-button" onClick={onClose}>×</button>
          </div>

          <div className='upgrade-popup-section-column'>
            {/* Plan List */}
            <div className='membership-toggle-cards modern'>
              <div
                className={`membership-card${selectedPlan === 'freemium' ? ' selected' : ''}`}
                onClick={() => setSelectedPlan('freemium')}
              >
                <div className="membership-card-content">
                  <div className="membership-card-title">Starter</div>
                  {renderPrice('freemium', false)}
                </div>
              </div>
              <div
                className={`membership-card${selectedPlan === 'pioneer' ? ' selected' : ''}`}
                onClick={() => setSelectedPlan('pioneer')}
              >
                <div className="membership-card-content">
                  <div className="membership-card-title">Pioneer</div>
                  {renderPrice('pioneer', false)}
                </div>
              </div>
            </div>
            {/* Plan Details */}
            <div className='membership-card-details'>
              <div className='membership-card-details-header'>
                <p className='membership-card-details-title'>{selectedPlan === 'freemium' ? PLANS.freemium.name : PLANS.pioneer.name}</p>
                {selectedPlan === 'pioneer' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label className="membership-card-details-switchbox">
                      <input
                        type="checkbox"
                        checked={billingCycle === 'annual'}
                        onChange={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
                      />
                      <span className="membership-card-details-slider"></span>
                    </label>
                    <p className='membership-card-details-switchbox-text'>{billingCycle === 'annual' ? 'Yearly' : 'Monthly'}</p>
                  </div>
                )}
              </div>
              <div className='membership-card-details-content'>
                <div className='membership-card-details-price-box'>
                  {selectedPlan === 'pioneer' && billingCycle === 'annual' && (
                    <span className="membership-card-details-save-badge">Save 20%</span>
                  )}

                  <div className="membership-details-card-price-row">
                    <div className="membership-details-card-price">{renderPrice(selectedPlan, false)}</div>
                  </div>
                </div>
                <ul className='membership-card-details-check-list'>
                  {getPlanFeatures(selectedPlan).map((f, i) => (
                    <li key={i} className='membership-card-details-check-item'>
                      <i class="bi bi-check-circle-fill"></i> {f}
                    </li>
                  ))}
                </ul>
                {selectedPlan === 'pioneer' ? (
                  <button className="membership-card-details-purchase-btn" onClick={() => setStep('form')}>Purchase Plan</button>
                ) : (
                  <button className="membership-card-details-current-plan-btn" disabled><i class="bi bi-lock-fill"></i>Current Plan</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form (Figma look)
  if (step === 'form') {
    return (
      <div className="upgrade-popup-overlay">
        <div className="upgrade-popup wide">
          <div className='upgrade-popup-title-box'>
            <h2 className="upgrade-title">Upgrade to Pioneer</h2>
            <button className="upgrade-popup-close-button" onClick={onClose}>×</button>
          </div>
          <div className="upgrade-popup-section">
            <p className="upgrade-section-label">Membership Type</p>
            <div className="membership-toggle-cards modern">
              <label className={`membership-card ${billingCycle === 'monthly' ? 'active' : ''}`}>
                <input
                  type="radio"
                  checked={billingCycle === 'monthly'}
                  onChange={() => setBillingCycle('monthly')}
                  name="membership"
                />
                <div className="membership-card-content">
                  <div className="membership-card-title">Monthly</div>
                  <div className="membership-card-price-row">
                    <div className="membership-card-price">
                      <img src='../img/usdc-logo.png' alt="USDC" />
                      {getPlanPrice('pioneer', 'monthly')}
                    </div>
                    <span className="membership-card-currency">/month</span>
                  </div>
                </div>
              </label>
              <label className={`membership-card ${billingCycle === 'annual' ? 'active' : ''}`}>
                <input
                  type="radio"
                  checked={billingCycle === 'annual'}
                  onChange={() => setBillingCycle('annual')}
                  name="membership"
                />
                <div className="membership-card-content">
                  <div className="membership-card-title">
                    Yearly <span className="save-badge">Save 20%</span>
                  </div>
                  <div className="membership-card-price-row">
                    <div className="membership-card-price">
                      <img src='../img/usdc-logo.png' alt="USDC" />
                      {getPlanPrice('pioneer', 'annual')}
                    </div>
                    <span className="membership-card-currency">/month</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="upgrade-total-row modern">
            <div>
              <p className="upgrade-total-label">Total price</p>
            </div>
            <div className="upgrade-total-value">
              <b>
                {getPlanPrice('pioneer', billingCycle)} USDC
                <span style={{ margin: '0 8px', color: '#A9A9B3' }}>≈</span>
                {solUsd ? (getPlanPrice('pioneer', billingCycle) / solUsd).toFixed(4) : '...'} SOL
              </b>
            </div>
          </div>
          <div className="upgrade-warning modern">
            <i class="bi bi-exclamation-triangle"></i>
            <p className='upgrade-warning-text'>
              To renew your monthly subscription, you will need to manually sign a message directly on the builder. You'll receive an email notification when it's time to renew, and you'll have <b>14 days</b> to complete the signature process to keep your access.
            </p>
          </div>
          <button className="upgrade-confirm-btn" onClick={handleConfirmUpgrade}>Confirm Upgrade</button>
          <div className="upgrade-terms">
            By clicking "Confirm Upgrade", you agree to our <a href='/terms' className='upgrade-terms-link' target='_blank'>Terms of Service</a>.
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UpgradePopup; 