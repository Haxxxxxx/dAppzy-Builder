import React, { useState } from "react";
import { db, doc, getDoc, setDoc } from "../firebase";
import { serverTimestamp } from "firebase/firestore";
import UAuth from "@uauth/js";
import { auth } from "../firebase";
import { signInWithCustomToken } from "firebase/auth";
import { requestAccess, signMessage } from "@stellar/freighter-api"; // Freighter API methods
import "./NewLogin.css";
import { useWalletContext } from '../context/WalletContext';

function WalletConnection({ onUserLogin }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { connectWallet } = useWalletContext();

  // Save wallet info to Firestore
  const saveWalletToFirestore = async (walletId, walletType) => {
    try {
      // First, check if user document exists
      const userRef = doc(db, "users", walletId);
      const userSnap = await getDoc(userRef);
      
      const walletRef = doc(db, "wallets", walletId);
      const walletSnap = await getDoc(walletRef);

      // Prepare wallet data
      const walletData = {
        walletId,
        lastLogin: serverTimestamp(),
        walletType,
        timestamp: serverTimestamp(),
        selectedButtons: walletSnap.exists() ? walletSnap.data().selectedButtons || {} : {}
      };

      // If user document exists, include subscription data
      if (userSnap.exists()) {
        const userData = userSnap.data();
        walletData.subscriptionStatus = userData.subscriptionStatus || 'freemium';
        walletData.subscriptionEndDate = userData.subscriptionEndDate || null;
      } else {
        // Create new user document without subscription fields
        // (subscription defaults are set by the verifySubscription Cloud Function)
        await setDoc(userRef, {
          createdAt: serverTimestamp(),
          walletId,
          walletType
        });
        walletData.subscriptionStatus = 'freemium';
        walletData.subscriptionEndDate = null;
      }

      // Save or update wallet document
      await setDoc(walletRef, walletData, { merge: true });
      
      // Store subscription data in localStorage
      localStorage.setItem('subscriptionStatus', walletData.subscriptionStatus);
      if (walletData.subscriptionEndDate) {
        localStorage.setItem('subscriptionEndDate', walletData.subscriptionEndDate);
      }

    } catch (error) {
      console.error("Error saving wallet data:", error);
      throw error;
    }
  };

  // Process login by saving session data and updating WalletContext
  const processLogin = async (userId, walletType) => {
    try {
      await saveWalletToFirestore(userId, walletType);
      if (typeof onUserLogin === "function") {
        onUserLogin(userId);
        connectWallet(); // Ensure WalletContext is updated
      } else {
        console.error("onUserLogin is not a function");
      }
    } catch (error) {
      console.error("Error processing login:", error);
      setErrorMessage("Failed to process login. Please try again.");
    }
  };

  // Fetch a one-time nonce for wallet auth challenge-response
  const fetchNonce = async (walletAddress) => {
    const res = await fetch(`${process.env.REACT_APP_CF_BASE_URL}/generateNonceV2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    if (!res.ok) throw new Error("Failed to generate nonce");
    const data = await res.json();
    return data.nonce;
  };

  // --- MetaMask Integration (with server-side signature verification) ---
  const handleLoginWithMetamask = async () => {
    setIsLoading(true);
    if (!window.ethereum) {
      setErrorMessage("MetaMask is not installed. Install it and try again");
      setIsLoading(false);
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      const nonce = await fetchNonce(account.toLowerCase());
      const message = `Sign this message to verify your identity.\n\nNonce: ${nonce}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      // Verify signature server-side and get Firebase custom token
      const response = await fetch(
        `${process.env.REACT_APP_CF_BASE_URL}/verifyMetaMaskV2`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account, signature, message, nonce }),
        }
      );
      if (!response.ok) {
        throw new Error(`Server verification failed: ${response.status}`);
      }
      const { customToken } = await response.json();
      await signInWithCustomToken(auth, customToken);
      await saveWalletToFirestore(account, "Ethereum");
      processLogin(account, "Ethereum");
    } catch (error) {
      console.error("Error with MetaMask login:", error);
      setErrorMessage("MetaMask authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Phantom Integration (unchanged) ---
  const handleLoginWithPhantom = async () => {
    setIsLoading(true);
    try {
      if ("solana" in window && window.solana?.isPhantom) {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        const nonce = await fetchNonce(publicKey);
        const messageText = `Sign this message to verify your identity.\n\nNonce: ${nonce}`;
        const message = new TextEncoder().encode(messageText);
        const { signature } = await window.solana.signMessage(message);
        const customToken = await getPhantomCustomTokenFromServer(
          publicKey,
          signature,
          messageText,
          nonce
        );
        await signInWithCustomToken(auth, customToken);
        await saveWalletToFirestore(publicKey, "Solana");
        processLogin(publicKey, "Solana");
      } else {
        setErrorMessage("Phantom wallet not found. Please install it.");
      }
    } catch (error) {
      console.error("Error connecting to Phantom or verifying signature:", error);
      setErrorMessage("Phantom authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const getPhantomCustomTokenFromServer = async (publicKey, signature, message, nonce) => {
    const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const body = { publicKey, signature: sigBase64, message, nonce };
    const response = await fetch(
      `${process.env.REACT_APP_CF_BASE_URL}/verifyPhantomV2`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();
    return data.customToken;
  };

  // --- Unstoppable Integration (with server-side token verification) ---
  const handleLoginWithUnstoppable = async () => {
    setIsLoading(true);
    const uauth = new UAuth({
      clientID: process.env.REACT_APP_UD_CLIENT_ID,
      redirectUri: process.env.REACT_APP_UD_REDIRECT_URI || window.location.origin,
      scope: "openid wallet",
    });
    try {
      const authorization = await uauth.loginWithPopup();
      const userId = authorization.idToken.sub;
      if (!userId) {
        throw new Error("Username is undefined in the authorization object");
      }

      // Verify the token server-side and get Firebase custom token
      const response = await fetch(
        `${process.env.REACT_APP_CF_BASE_URL}/verifyUnstoppableV2`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: authorization.accessToken,
            sub: userId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Server verification failed: ${response.status}`);
      }
      const { customToken } = await response.json();
      await signInWithCustomToken(auth, customToken);
      await saveWalletToFirestore(userId, "Unstoppable");
      processLogin(userId, "Unstoppable");
    } catch (error) {
      console.error("Error with Unstoppable login:", error);
      setErrorMessage("Unstoppable login failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Freighter Integration (with server-side signature verification) ---
  const handleLoginWithFreighter = async () => {
    setIsLoading(true);
    try {
      // Request access to Freighter (this will prompt the user if not already allowed)
      const accessObj = await requestAccess();
      if (accessObj.error) {
        throw new Error(accessObj.error.message);
      }
      const publicKey = accessObj.address;
      if (!publicKey) {
        throw new Error("Unable to retrieve public key from Freighter.");
      }

      // Fetch nonce and ask the user to sign a message
      const nonce = await fetchNonce(publicKey);
      const message = `Sign this message to verify your identity.\n\nNonce: ${nonce}`;
      const signResult = await signMessage(message, { address: publicKey });
      if (signResult.error) {
        throw new Error(signResult.error);
      }
      const signature = signResult.signedMessage;

      // Verify signature server-side and get Firebase custom token
      const response = await fetch(
        `${process.env.REACT_APP_CF_BASE_URL}/verifyFreighterV2`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey, signature, message, nonce }),
        }
      );
      if (!response.ok) {
        throw new Error(`Server verification failed: ${response.status}`);
      }
      const { customToken } = await response.json();
      await signInWithCustomToken(auth, customToken);
      await saveWalletToFirestore(publicKey, "Freighter");
      processLogin(publicKey, "Freighter");
    } catch (error) {
      console.error("Error with Freighter login:", error);
      setErrorMessage("Freighter authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="popup">
      <img
        className="popup-wallet-main-img"
        src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2F3s-logo.png?alt=media&token=8a69bcce-2e9f-463e-8cba-f4c2fec1a904"
        alt="Popup Logo"
      />
      <div className="popup-content">
        <h1>Connect Your Wallet</h1>
        {isLoading ? (
          <div className="wallet-loader">
            <div className="spinner"></div>
            <p>Authenticating... Please wait.</p>
          </div>
        ) : (
          <div className="wallet-list">
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            <button
              id="phantom"
              className="wallet-btn ga-wallet-btn-phantom"
              onClick={handleLoginWithPhantom}
              disabled={isLoading}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fphantom-logo.png?alt=media&token=5ffe611b-3ccd-4663-81e4-59feeb1dbba7"
                alt="phantom"
              />
              {isLoading ? "Connecting..." : "Continue with Phantom"}
            </button>
            <button
              id="metamask"
              className="wallet-btn ga-wallet-btn-metamask"
              onClick={handleLoginWithMetamask}
              disabled={isLoading}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fmetamask-logo.png?alt=media&token=507097be-0cc4-4d93-a87b-99c67d82cfe5"
                alt="metamask"
              />
              {isLoading ? "Connecting..." : "Continue with Metamask"}
            </button>
            <button
              id="freighter"
              className="wallet-btn ga-wallet-btn-freighter"
              onClick={handleLoginWithFreighter}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fstellar_logo.png?alt=media&token=320a9042-cb19-4cf9-aab0-3a9b368b5e2c" // Replace with your Freighter logo URL
                alt="freighter"
              />
              Continue with Freighter
            </button>
            {/* <button
              id="coinbase"
              className="wallet-btn ga-wallet-btn-coinbase"
              onClick={handleLoginWithCoinbase}
            >
              <img
                src="https://example.com/path-to-coinbase-logo.png" // Replace with your Coinbase logo URL
                alt="coinbase"
              />
              Continue with Coinbase
            </button> */}
            <button
              id="unstoppable"
              className="wallet-btn ga-wallet-btn-ud"
              onClick={handleLoginWithUnstoppable}
              disabled={isLoading}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Funstoppablelogo.png?alt=media&token=60b8c7c0-d644-4954-be2d-7afe3065b876"
                alt="unstoppable"
              />
              {isLoading ? "Connecting..." : "Continue with Unstoppable"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletConnection;
