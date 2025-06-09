import React, { useState, useEffect } from 'react';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSubscription } from '../context/SubscriptionContext';
import { useWalletContext } from '../context/WalletContext';
import './css/UpgradePopup.css';
import { Connection, PublicKey, Transaction, clusterApiUrl, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

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

const UpgradePopup = ({ onClose }) => {
  const { setSubscriptionStatus } = useSubscription();
  const { walletAddress, isConnected, connectWallet, isLoading: walletLoading } = useWalletContext();
  const [billingCycle, setBillingCycle] = useState('annual');
  const [step, setStep] = useState('form'); // 'form' | 'paying' | 'success' | 'error'
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const [displayWallet, setDisplayWallet] = useState(null);
  const [transactionSignature, setTransactionSignature] = useState(null);

  // Dynamic pricing
  const prices = {
    monthly: { sol: 0.13 },
    annual: { sol: 1.29 },
  };
  const solPrice = prices[billingCycle].sol;

  // Get Solana wallet address
  const getSolanaWalletAddress = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const { publicKey } = await window.solana.connect();
        return publicKey.toString();
      } catch (error) {
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

        // SOL payment
        const paymentAmount = prices[billingCycle].sol;
        const lamports = Math.round(paymentAmount * LAMPORTS_PER_SOL);

        // Check SOL balance
        const balanceLamports = await connection.getBalance(fromWallet);
        if (balanceLamports < lamports) {
          setStep('error');
          setError(`Insufficient SOL balance. You need ${paymentAmount} SOL.`);
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

        // Update Firestore with new subscription
        const userRef = doc(db, 'users', displayWallet);
        await updateDoc(userRef, {
            subscriptionStatus: 'pioneer',
            upgradedAt: new Date().toISOString(),
            billingCycle,
            subscriptionStartDate: new Date().toISOString(),
            subscriptionEndDate: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
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
        <div className="upgrade-popup wide">
          <button className="close-button" onClick={onClose}>×</button>
          <h2 className="upgrade-title">Processing Payment…</h2>
          <div className="upgrade-section-label">Please approve the transaction in your wallet.</div>
          <div className="spinner" style={{margin:'2rem auto'}}></div>
        </div>
      </div>
    );
  }
  if (step === 'success') {
    return (
      <div className="upgrade-popup-overlay">
        <div className="upgrade-popup wide">
          <button className="close-button" onClick={onClose}>×</button>
          <h2 className="upgrade-title">Upgrade Successful!</h2>
          <div className="upgrade-section-label">You are now a Pioneer 🚀</div>
          {transactionSignature && (
            <div className="transaction-info">
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
          <button className="upgrade-confirm-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  if (step === 'error') {
    return (
      <div className="upgrade-popup-overlay">
        <div className="upgrade-popup wide">
          <button className="close-button" onClick={onClose}>×</button>
          <h2 className="upgrade-title">Payment Error</h2>
          <div className="upgrade-section-label">{error}</div>
          <button className="upgrade-confirm-btn" onClick={() => setStep('form')}>Try Again</button>
        </div>
      </div>
    );
  }

  // Main form (Figma look)
  return (
    <div className="upgrade-popup-overlay">
      <div className="upgrade-popup wide">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="upgrade-title">Upgrade to Pioneer</h2>
        <div className="upgrade-section-label">Membership Type</div>
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
                <span className="membership-card-price">20</span>
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
              <div className="membership-card-title">Yearly <span className="save-badge">Save 20%</span></div>
              <div className="membership-card-price-row">
                <span className="membership-card-price">16</span>
                <span className="membership-card-currency">/month</span>
              </div>
            </div>
          </label>
        </div>
        <div className="upgrade-total-row modern">
          <div>
            <span className="upgrade-total-label">Total price</span>
          </div>
          <div className="upgrade-total-value">
            <b>{solPrice} SOL</b>
          </div>
        </div>
        <div className="upgrade-warning modern">
          <span className="material-symbols-outlined warning-icon">warning</span>
          <span>
            To renew your monthly subscription, you will need to manually sign a message directly on the builder. You'll receive an email notification when it's time to renew, and you'll have <b>14 days</b> to complete the signature process to keep your access.
          </span>
        </div>
        <button className="upgrade-confirm-btn" style={{marginTop: '1.5rem'}} onClick={handleConfirmUpgrade}>Confirm Upgrade</button>
        <div className="upgrade-terms">
          By clicking "Confirm Upgrade", you agree to our <b>Terms of Service</b>.
        </div>
      </div>
    </div>
  );
};

export default UpgradePopup; 