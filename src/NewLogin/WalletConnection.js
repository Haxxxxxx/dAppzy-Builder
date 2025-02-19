// src/components/WalletConnection.js
import React, { useState } from "react";
import { db, doc, getDoc, setDoc } from "../firebase"; // <-- Adjust path as needed
import UAuth from "@uauth/js";
import { auth } from "../firebase";
import { signInWithCustomToken } from "firebase/auth";
import './NewLogin.css'

function WalletConnection({
    saveLoginEvent,
    logEvent,
    checkWalletData,
    checkForWallet,
    walletAvailable,
    onUserLogin,
}) {
    const [phantomInitiated, setPhantomInitiated] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const authenticateWithEthereum = async (walletId) => {
        try {
            const message = "Please sign this message to confirm your identity.";
            // request signature
            await window.ethereum.request({
                method: "personal_sign",
                params: [message, walletId],
            });

            processLogin(walletId, "Ethereum");
        } catch (error) {
            console.error("Error during Ethereum authentication:", error);
            setErrorMessage("Ethereum authentication failed. Please try again");
        }
    };

    const authenticateWithSolana = async (publicKey) => {
        try {
            const message = new TextEncoder().encode(
                "Please sign this message to confirm your identity."
            );
            const { signature } = await window.solana.signMessage(message);
            // signature is a Buffer; we don't necessarily need to do anything with it
            processLogin(publicKey, "Solana");
        } catch (error) {
            console.error("Error during Solana authentication:", error);
            setErrorMessage("Solana authentication failed. Please try again");
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
        }
    };

    // Called after a successful signature/verification
    const processLogin = (userId, walletType) => {
        if (typeof onUserLogin === "function") {
            onUserLogin(userId);
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("userAccount", userId);

            if (checkWalletData) checkWalletData(userId);
            if (saveLoginEvent) saveLoginEvent(userId, walletType);
        } else {
            console.error("onUserLogin is not a function");
        }
    };
    // that verifies the signature & returns a custom token
    const getPhantomCustomTokenFromServer = async (publicKey, signature) => {
        const body = { publicKey, signature: Array.from(signature) };
        // pass your signature as an array of bytes, or base64, whichever your server expects

        const response = await fetch("https://us-central1-third--space.cloudfunctions.net/verifyPhantom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        return data.customToken; // { customToken: "..." }
    };
    // Example Firestore save function
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
    // -------- Metamask --------
    const handleLoginWithMetamask = async () => {
        if (logEvent) logEvent("Click", "Metamask Login Attempt");

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

                authenticateWithEthereum(account);
            } catch (error) {
                console.error("Error with MetaMask login:", error);
                setErrorMessage("MetaMask authentication failed. Please try again");
            }
        } else {
            setErrorMessage("MetaMask is not installed. Install it and try again");
        }
    };

    // -------- Phantom --------
    const handleLoginWithPhantom = async () => {
        try {
            if ("solana" in window && window.solana?.isPhantom) {
                const response = await window.solana.connect();
                const publicKey = response.publicKey.toString();

                // 1) Sign the message (already in your code)
                const message = new TextEncoder().encode("Please sign this message to confirm your identity.");
                const { signature } = await window.solana.signMessage(message);

                // 2) Send to backend to verify + create custom token
                const customToken = await getPhantomCustomTokenFromServer(publicKey, signature);

                // 3) Sign in with that custom token in the client
                const userCredential = await signInWithCustomToken(auth, customToken);

                // Now the user is registered/logged into Firebase Auth
                console.log("Firebase Auth user:", userCredential.user);

                // 4) (Optional) Store the wallet in Firestore as well
                await saveWalletToFirestore(publicKey);

                // 5) Trigger your existing logic
                processLogin(publicKey, "Solana");
            } else {
                // handle case: no Phantom
            }
        } catch (error) {
            console.error("Error connecting to Phantom or verifying signature:", error);
            setErrorMessage("Phantom authentication failed. Please try again");
        }
    };

    // -------- Unstoppable Domains --------
    const handleLoginWithUnstoppable = async () => {
        if (logEvent) logEvent("Click", "Unstoppable Login Attempt");

        const uauth = new UAuth({
            clientID: "65f44ad3-b7ad-4e87-b782-9654d7257a4c", // Replace with your clientID
            redirectUri: "http://localhost:3000",            // Adjust for production
            scope: "openid wallet",
        });

        try {
            const authorization = await uauth.loginWithPopup();
            authenticateWithUnstoppable(authorization);
        } catch (error) {
            console.error("Error with Unstoppable login:", error);
            setErrorMessage("Unstoppable login failed. Please try again");
        }
    };
  // --------------------- Render ---------------------

  return (
    <div className="popup">
      {/* Optional: main logo/image at the top */}
      <img
        className="popup-wallet-main-img"
        src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2F3s-logo.png?alt=media&token=8a69bcce-2e9f-463e-8cba-f4c2fec1a904"
        alt="Popup Logo"
      />

      <div className="popup-content">
        <h1>Connect Your Wallet</h1>

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
      </div>
    </div>
  );
}

export default WalletConnection;
