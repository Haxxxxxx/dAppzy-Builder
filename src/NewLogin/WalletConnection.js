import React, { useState } from "react";
import { db, doc, getDoc, setDoc } from "../firebase";
import UAuth from "@uauth/js";
import { auth } from "../firebase";
import { signInWithCustomToken } from "firebase/auth";
import { requestAccess, signMessage } from "@stellar/freighter-api"; // Freighter API methods
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Web3 from "web3";
import "./NewLogin.css";
import { useWalletContext } from '../context/WalletContext';
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

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
      
      const timestamp = new Date().toISOString();
      const walletRef = doc(db, "wallets", walletId);
      const walletSnap = await getDoc(walletRef);

      // Prepare wallet data
      const walletData = {
        walletId,
        lastLogin: timestamp,
        walletType,
        timestamp: new Date().toISOString(),
        selectedButtons: walletSnap.exists() ? walletSnap.data().selectedButtons || {} : {}
      };

      // If user document exists, include subscription data
      if (userSnap.exists()) {
        const userData = userSnap.data();
        walletData.subscriptionStatus = userData.subscriptionStatus || 'freemium';
        walletData.subscriptionEndDate = userData.subscriptionEndDate || null;
      } else {
        // Create new user document with default subscription
        await setDoc(userRef, {
          subscriptionStatus: 'freemium',
          subscriptionEndDate: null,
          createdAt: timestamp,
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

      console.log("Wallet data saved to Firestore:", walletData);
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

  // --- MetaMask Integration (unchanged) ---
  const authenticateWithEthereum = async (walletId) => {
    try {
      const message = "Please sign this message to confirm your identity.";
      await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletId],
      });
      processLogin(walletId, "Ethereum");
    } catch (error) {
      console.error("Error during Ethereum authentication:", error);
      setErrorMessage("Ethereum authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithMetamask = async () => {
    setIsLoading(true);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        await saveWalletToFirestore(account, "Ethereum");
        await authenticateWithEthereum(account);
      } catch (error) {
        console.error("Error with MetaMask login:", error);
        setErrorMessage("MetaMask authentication failed. Please try again");
        setIsLoading(false);
      }
    } else {
      setErrorMessage("MetaMask is not installed. Install it and try again");
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
        const message = new TextEncoder().encode(
          "Lets create your beta accout reserved for testing issues ! Thanks for your QA and enjoy your time."
        );
        const { signature } = await window.solana.signMessage(message);
        const customToken = await getPhantomCustomTokenFromServer(
          publicKey,
          signature
        );
        const userCredential = await signInWithCustomToken(auth, customToken);
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

  const getPhantomCustomTokenFromServer = async (publicKey, signature) => {
    const body = { publicKey, signature: Array.from(signature) };
    const response = await fetch(
      "https://us-central1-third--space.cloudfunctions.net/verifyPhantomV2",
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

  // --- Unstoppable Integration (unchanged) ---
  const authenticateWithUnstoppable = async (authorization) => {
    try {
      const userId = authorization.idToken.sub;
      if (!userId) {
        throw new Error("Username is undefined in the authorization object");
      }
      processLogin(userId, "Unstoppable");
    } catch (error) {
      console.error("Error during Unstoppable authentication:", error);
      setErrorMessage("Unstoppable authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithUnstoppable = async () => {
    setIsLoading(true);
    const uauth = new UAuth({
      clientID: "65f44ad3-b7ad-4e87-b782-9654d7257a4c",
      redirectUri: "http://localhost:3000",
      scope: "openid wallet",
    });
    try {
      const authorization = await uauth.loginWithPopup();
      await authenticateWithUnstoppable(authorization);
    } catch (error) {
      console.error("Error with Unstoppable login:", error);
      setErrorMessage("Unstoppable login failed. Please try again");
      setIsLoading(false);
    }
  };

  // --- Freighter Integration Using @stellar/freighter-api ---
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
      
      // Ask the user to sign a message to mimic other wallet flows
      const message = "Please sign this message to confirm your identity.";
      const signResult = await signMessage(message, { address: publicKey });
      if (signResult.error) {
        throw new Error(signResult.error);
      }
      const signature = signResult.signedMessage;
      console.log("Freighter signature:", signature);
      
      await saveWalletToFirestore(publicKey, "Freighter");
      processLogin(publicKey, "Freighter");
    } catch (error) {
      console.error("Error with Freighter login:", error);
      setErrorMessage("Freighter authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // // --- Coinbase Wallet Integration ---
  // const handleLoginWithCoinbase = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Initialize Coinbase Wallet SDK with your app details.
  //     const coinbaseWallet = new CoinbaseWalletSDK({
  //       appName: "Your App Name", // Replace with your app name
  //       appLogoUrl: "https://example.com/logo.png", // Replace with your app logo URL
  //       darkMode: false,
  //     });
      
  //     // Create a Web3 provider using Coinbase Wallet.
  //     // Here we use the Polygon mainnet endpoint so the chain ID should be 137.
  //     const ethereum = coinbaseWallet.makeWeb3Provider(
  //       "https://polygon-mainnet.infura.io/v3/065dcf3394a94a4cab29ac97be680697",
  //       137
  //     );
      
  //     const web3 = new Web3(ethereum);
  //     const accounts = await web3.eth.getAccounts();
  //     const account = accounts[0];
      
  //     await saveWalletToFirestore(account, "Coinbase");
  //     processLogin(account, "Coinbase");
  //   } catch (error) {
  //     console.error("Error with Coinbase Wallet login:", error);
  //     setErrorMessage("Coinbase Wallet authentication failed. Please try again");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
