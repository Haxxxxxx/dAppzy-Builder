import React, { useState, useEffect } from "react";
import "./PopupWallet.css";
import { db, doc, getDoc, setDoc } from '../../../firebaseConfig';
import UAuth from '@uauth/js';

function WalletConnection({ saveLoginEvent, logEvent, checkWalletData, checkForWallet, onClose, walletAvailable, onUserLogin }) {
  const [phantomInitiated, setPhantomInitiated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if Phantom is installed on component mount
  useEffect(() => {
    if ("solana" in window && window.solana.isPhantom) {
      setPhantomInitiated(true);
      console.log("[Wallet] Phantom wallet detected");
    }
  }, []);

  const authenticateWithEthereum = async (walletId) => {
    try {
      console.log("[Wallet] Starting Ethereum authentication for wallet:", walletId);
      const message = "Please sign this message to confirm your identity.";
      console.log("[Wallet] Requesting signature for message");
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletId],
      });
      console.log("[Wallet] Ethereum signature received successfully");
      processLogin(walletId, 'Ethereum');
    } catch (error) {
      console.error("[Wallet] Error during Ethereum authentication:", error);
      setErrorMessage("Ethereum authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithSolana = async (publicKey) => {
    try {
      console.log("[Wallet] Starting Solana authentication for wallet:", publicKey);
      const message = new TextEncoder().encode("Please sign this message to confirm your identity.");
      console.log("[Wallet] Requesting Solana signature");
      const { signature } = await window.solana.signMessage(message);
      console.log("[Wallet] Solana signature received successfully");
      const signedMessage = Buffer.from(signature).toString('hex');
      console.log("[Wallet] Processing Solana login");
      processLogin(publicKey, 'Solana');
    } catch (error) {
      console.error("[Wallet] Error during Solana authentication:", error);
      setErrorMessage("Solana authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };
  

  const authenticateWithUnstoppable = async (authorization) => {
    try {
      console.log("[Wallet] Starting Unstoppable authentication");
      const userId = authorization.idToken.sub;
      if (!userId) {
        console.error("[Wallet] Username is undefined in the authorization object");
        throw new Error("Username is undefined in the authorization object");
      }
      console.log("[Wallet] Unstoppable authentication successful");
      processLogin(userId, 'Unstoppable');
    } catch (error) {
      console.error("[Wallet] Error during Unstoppable authentication:", error);
      setErrorMessage('Unstoppable authentication failed. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const processLogin = (userId, walletType) => {
    console.log("[Wallet] Processing login for wallet type:", walletType);
    if (typeof onUserLogin === "function") {
      console.log("[Wallet] Calling onUserLogin callback");
      onUserLogin(userId);
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userAccount", userId);
      console.log("[Wallet] Session storage updated");
      checkWalletData(userId);
      console.log("[Wallet] Checking wallet data");
      saveLoginEvent(userId, walletType);
      console.log("[Wallet] Login event saved");
    } else {
      console.error("[Wallet] onUserLogin is not a function");
    }
  };
  

  const handleLoginWithMetamask = async () => {
    setIsLoading(true);
    setErrorMessage("");
    logEvent('Click', 'Metamask Login Attempt');
    console.log("[Wallet] Initiating MetaMask login");
    
    if (window.ethereum) {
      try {
        console.log("[Wallet] Requesting MetaMask accounts");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];
        console.log("[Wallet] MetaMask account received:", account);
        
        const walletRef = doc(db, 'wallets', account);
        const walletSnap = await getDoc(walletRef);
        const timestamp = new Date().toISOString();

        if (!walletSnap.exists()) {
          console.log("[Wallet] Creating new wallet record in Firestore");
          await setDoc(walletRef, { walletId: account, lastLogin: timestamp, walletType:'Ethereum' });
        } else {
          console.log("[Wallet] Existing wallet record found in Firestore");
        }

        await authenticateWithEthereum(account);
      } catch (error) {
        console.error("[Wallet] Error with MetaMask login:", error);
        setErrorMessage('MetaMask authentication failed. Please try again');
        setIsLoading(false);
      }
    } else {
      console.log("[Wallet] MetaMask not detected");
      setErrorMessage('MetaMask is not installed. Install it and try again');
      setIsLoading(false);
    }
  };

  const handleLoginWithPhantom = async () => {
    setIsLoading(true);
    setErrorMessage("");
    logEvent('Click', 'Phantom Login Attempt');
    console.log("[Wallet] Initiating Phantom login");
    
    if ("solana" in window && window.solana.isPhantom) {
      try {
        console.log("[Wallet] Requesting Phantom connection");
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        console.log("[Wallet] Phantom connected successfully, public key:", publicKey);
        
        const walletRef = doc(db, 'wallets', publicKey);
        const walletSnap = await getDoc(walletRef);
        const timestamp = new Date().toISOString();

        if (!walletSnap.exists()) {
          console.log("[Wallet] Creating new wallet record in Firestore");
          await setDoc(walletRef, { walletId: publicKey, lastLogin: timestamp, walletType:'Solana' });
        } else {
          console.log("[Wallet] Existing wallet record found in Firestore");
        }

        await authenticateWithSolana(publicKey);
      } catch (error) {
        console.error("[Wallet] Error connecting to Phantom:", error);
        setErrorMessage('Phantom authentication failed. Please try again');
        setIsLoading(false);
      }
    } else {
      if (phantomInitiated) {
        console.log("[Wallet] Checking wallet availability");
        checkForWallet();
        if (walletAvailable) {
          setErrorMessage("Phantom wallet is now available. Please try connecting again");
        } else {
          setErrorMessage('Phantom wallet is not available. Please refresh the page and try again');
        }
      } else {
        setErrorMessage('Phantom wallet installation isn\'t completed or not initiated. Please finish or install the Phantom wallet to continue');
        setPhantomInitiated(true);
      }
      setIsLoading(false);
    }
  };

  const handleLoginWithUnstoppable = async () => {
    setIsLoading(true);
    setErrorMessage("");
    logEvent('Click', 'Unstoppable Login Attempt');
    console.log("[Wallet] Initiating Unstoppable login");
    
    const uauth = new UAuth({
      clientID: "65f44ad3-b7ad-4e87-b782-9654d7257a4c",
      redirectUri: "http://localhost:3000",
      scope: "openid wallet"
    });

    try {
      console.log("[Wallet] Requesting Unstoppable authorization");
      const authorization = await uauth.loginWithPopup();
      console.log("[Wallet] Unstoppable authorization received");
      await authenticateWithUnstoppable(authorization);
    } catch (error) {
      console.error("[Wallet] Error with Unstoppable login:", error);
      setErrorMessage('Unstoppable login failed. Please try again');
      setIsLoading(false);
    }
  };

  return (
    <div className="wallet-list">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button
        id="phantom"
        className="wallet-btn ga-wallet-btn-phantom"
        onClick={handleLoginWithPhantom}
        disabled={isLoading}
      >
        <img src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fphantom-logo.png?alt=media&token=5ffe611b-3ccd-4663-81e4-59feeb1dbba7" alt="" />
        {isLoading ? "Connecting..." : "Continue with Phantom"}
      </button>
      <button
        id="metamask"
        className="wallet-btn ga-wallet-btn-metamask"
        onClick={handleLoginWithMetamask}
        disabled={isLoading}
      >
        <img src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fmetamask-logo.png?alt=media&token=507097be-0cc4-4d93-a87b-99c67d82cfe5" alt="" />
        {isLoading ? "Connecting..." : "Continue with Metamask"}
      </button>
      <button
        id="unstoppable"
        className="wallet-btn ga-wallet-btn-ud"
        onClick={handleLoginWithUnstoppable}
        disabled={isLoading}
      >
        <img src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Funstoppablelogo.png?alt=media&token=60b8c7c0-d644-4954-be2d-7afe3065b876" alt="" />
        {isLoading ? "Connecting..." : "Continue with Unstoppable"}
      </button>
    </div>
  );
}

export default WalletConnection;
