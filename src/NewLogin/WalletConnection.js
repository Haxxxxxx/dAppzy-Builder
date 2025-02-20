import React, { useState } from "react";
import { db, doc, getDoc, setDoc } from "../firebase";
import UAuth from "@uauth/js";
import { auth } from "../firebase";
import { signInWithCustomToken } from "firebase/auth";
import "./NewLogin.css";

function WalletConnection({ onUserLogin }) {
  const [phantomInitiated, setPhantomInitiated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const authenticateWithSolana = async (publicKey) => {
    try {
      const message = new TextEncoder().encode(
        "Please sign this message to confirm your identity."
      );
      const { signature } = await window.solana.signMessage(message);
      processLogin(publicKey, "Solana");
    } catch (error) {
      console.error("Error during Solana authentication:", error);
      setErrorMessage("Solana authentication failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

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

  const processLogin = (userId, walletType) => {
    if (typeof onUserLogin === "function") {
      onUserLogin(userId);
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userAccount", userId);
    } else {
      console.error("onUserLogin is not a function");
    }
  };

  const getPhantomCustomTokenFromServer = async (publicKey, signature) => {
    const body = { publicKey, signature: Array.from(signature) };
    const response = await fetch(
      "https://us-central1-third--space.cloudfunctions.net/verifyPhantom",
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

  const saveWalletToFirestore = async (publicKey) => {
    const walletRef = doc(db, "wallets", publicKey);
    const walletSnap = await getDoc(walletRef);
    const timestamp = new Date().toISOString();

    if (!walletSnap.exists()) {
      await setDoc(walletRef, {
        walletId: publicKey,
        lastLogin: timestamp,
        walletType: "Solana",
      });
      console.log("Wallet ID saved to Firestore:", publicKey);
    } else {
      console.log("Wallet data retrieved:", walletSnap.data());
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
        const walletRef = doc(db, "wallets", account);
        const walletSnap = await getDoc(walletRef);
        const timestamp = new Date().toISOString();

        if (!walletSnap.exists()) {
          await setDoc(walletRef, {
            walletId: account,
            lastLogin: timestamp,
            walletType: "Ethereum",
          });
          console.log("Wallet ID saved to Firestore:", account);
        } else {
          console.log("Wallet data retrieved:", walletSnap.data());
        }
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

  const handleLoginWithPhantom = async () => {
    setIsLoading(true);
    try {
      if ("solana" in window && window.solana?.isPhantom) {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        const message = new TextEncoder().encode(
          "Please sign this message to confirm your identity."
        );
        const { signature } = await window.solana.signMessage(message);
        const customToken = await getPhantomCustomTokenFromServer(
          publicKey,
          signature
        );
        const userCredential = await signInWithCustomToken(auth, customToken);
        console.log("Firebase Auth user:", userCredential.user);
        await saveWalletToFirestore(publicKey);
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
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fphantom-logo.png?alt=media&token=5ffe611b-3ccd-4663-81e4-59feeb1dbba7"
                alt="phantom"
              />
              Continue with Phantom
            </button>
            <button
              id="metamask"
              className="wallet-btn ga-wallet-btn-metamask"
              onClick={handleLoginWithMetamask}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fmetamask-logo.png?alt=media&token=507097be-0cc4-4d93-a87b-99c67d82cfe5"
                alt="metamask"
              />
              Continue with Metamask
            </button>
            <button
              id="unstoppable"
              className="wallet-btn ga-wallet-btn-ud"
              onClick={handleLoginWithUnstoppable}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Funstoppablelogo.png?alt=media&token=60b8c7c0-d644-4954-be2d-7afe3065b876"
                alt="unstoppable"
              />
              Continue with Unstoppable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletConnection;
