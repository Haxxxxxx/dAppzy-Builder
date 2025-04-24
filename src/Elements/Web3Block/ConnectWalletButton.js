import React, { useContext, useRef, useEffect, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useWalletContext } from '../../context/WalletContext';
import { structureConfigurations } from '../../configs/structureConfigurations';
import { db, doc, getDoc, setDoc } from '../../firebase';

const ConnectWalletButton = ({
  id,
  preventHeroModal,
  handlePanelToggle = () => {},
  content: propContent,
  styles: propStyles,
}) => {
  const { selectedElement, setSelectedElement, updateContent, updateStyles, elements, findElementById } =
    useContext(EditableContext);
  const { walletAddress, isConnected, disconnect } = useWalletContext();
  const buttonRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Default settings for wallets
  const defaultSettings = {
    wallets: [
      { name: 'Phantom', enabled: true, type: 'solana' },
      { name: 'Solflare', enabled: true, type: 'solana' },
      { name: 'Backpack', enabled: true, type: 'solana' },
      { name: 'Glow', enabled: true, type: 'solana' },
      { name: 'Slope', enabled: true, type: 'solana' },
      { name: 'MetaMask', enabled: true, type: 'ethereum' },
      { name: 'Freighter', enabled: true, type: 'stellar' },
    ],
  };

  // Default styles for the connect wallet button
  const defaultStyles = {
    backgroundColor: 'rgb(51, 65, 85)',
    padding: '10px 20px',
    color: 'rgb(255, 255, 255)',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    position: 'relative',
    boxSizing: 'border-box',
    ':hover': {
      opacity: 0.9,
    },
  };

  // Get element data dynamically with fallbacks
  const elementData = findElementById(id, elements) || {};
  const settings = elementData.settings || defaultSettings;
  const wallets = Array.isArray(settings.wallets) ? settings.wallets : defaultSettings.wallets;
  const content = elementData.content || "Connect Wallet";
  const styles = elementData.styles || defaultStyles;

  // Save wallet info to Firestore
  const saveWalletToFirestore = async (walletId, walletType) => {
    const walletRef = doc(db, "wallets", walletId);
    const walletSnap = await getDoc(walletRef);
    const timestamp = new Date().toISOString();

    if (!walletSnap.exists()) {
      await setDoc(walletRef, {
        walletId,
        lastLogin: timestamp,
        walletType,
      });
      console.log("Wallet ID saved to Firestore:", walletId);
    } else {
      console.log("Wallet data retrieved:", walletSnap.data());
    }
  };

  // Process login by saving session data
  const processLogin = (userId, walletType) => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userAccount", userId);
  };

  // Handle Solana wallet connection
  const handleSolanaWalletConnection = async (walletName) => {
    console.log(`Attempting ${walletName} connection...`);
    if ("solana" in window && window.solana) {
      try {
        console.log(`${walletName} wallet found, connecting...`);
        const response = await window.solana.connect();
        console.log(`${walletName} connect response:`, response);
        const publicKey = response.publicKey.toString();
        console.log(`Connected to ${walletName}:`, publicKey);

        console.log("Requesting signature...");
        const message = "Testing signature in builder mode";
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await window.solana.signMessage(encodedMessage, "utf8");
        
        console.log(`${walletName} signature test successful:`, {
          publicKey,
          signature: signedMessage.signature,
        });
        setErrorMessage(`${walletName} connection and signature successful!`);
      } catch (error) {
        console.error(`Error connecting to ${walletName}:`, error);
        setErrorMessage(`${walletName} connection failed: ${error.message}`);
      }
    } else {
      console.log(`${walletName} wallet not found`);
      setErrorMessage(`${walletName} wallet not found. Please install it.`);
    }
  };

  // Handle button click
  const handleClick = async (e) => {
    console.log("Main button clicked");
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're in editor mode
    const isEditorMode = !window.location.pathname.includes('/preview') && !window.location.pathname.includes('/export');
    
    if (isEditorMode) {
      // If Ctrl is pressed and we're in edit mode, show wallet selection popup
      if (e.ctrlKey && isEditing) {
        console.log("Ctrl+Click detected in editor mode");
        const enabledWallets = wallets.filter(wallet => wallet && wallet.enabled);
        
        if (enabledWallets.length > 0) {
          console.log("Showing wallet popup with enabled wallets:", enabledWallets);
          setShowWalletPopup(true);
        } else {
          console.log("No enabled wallets found");
          setErrorMessage("Please enable at least one wallet to test the connection.");
        }
        return;
      }

      // Normal editor mode behavior
      if (selectedElement?.id === id) {
        setIsEditing(true);
        if (buttonRef.current) {
          buttonRef.current.focus();
        }
      } else {
    setSelectedElement({ id, type: 'connectWalletButton', styles, settings });
        setIsEditing(true);
      }
      return;
    }

    // Live mode behavior
    if (isConnected) {
      disconnect();
      return;
    }

    const enabledWallets = wallets.filter(wallet => wallet && wallet.enabled);
    
    if (enabledWallets.length === 0) {
      setErrorMessage("No wallets are enabled. Please enable at least one wallet in the settings.");
      return;
    }

    if (enabledWallets.length > 1) {
      setShowWalletPopup(true);
    } else if (enabledWallets.length === 1) {
      const wallet = enabledWallets[0];
      if (wallet.name === 'Phantom') {
        await handleSolanaWalletConnection(wallet.name);
      } else if (wallet.name === 'MetaMask') {
        await handleSolanaWalletConnection(wallet.name);
      }
    }
  };

  // Handle wallet selection from popup
  const handleWalletSelect = async (wallet, e) => {
    console.log("handleWalletSelect called with wallet:", wallet);
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setSelectedWallet(wallet);
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (wallet.type === 'solana') {
        await handleSolanaWalletConnection(wallet.name);
        // After successful connection, update the wallet context
        if (window.solana && window.solana.publicKey) {
          const publicKey = window.solana.publicKey.toString();
          console.log('Setting wallet context with public key:', publicKey);
          // Force a re-render of components using the wallet context
          window.dispatchEvent(new CustomEvent('walletConnected', { 
            detail: { 
              publicKey,
              walletType: wallet.type,
              walletName: wallet.name
            } 
          }));
        }
      } else if (wallet.name === 'MetaMask') {
        console.log("Attempting MetaMask connection...");
        if (window.ethereum) {
          console.log("MetaMask found, connecting...");
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          console.log("MetaMask accounts:", accounts);
          const account = accounts[0];
          console.log("Connected to MetaMask:", account);
          
          console.log("Requesting signature...");
          const message = "Testing signature in builder mode";
          const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [message, account],
          });
          
          console.log("MetaMask signature test successful:", {
            account,
            signature,
          });
          setErrorMessage("MetaMask connection and signature successful!");
        } else {
          console.log("MetaMask not found");
          setErrorMessage("MetaMask is not installed. Install it and try again");
        }
      } else if (wallet.name === 'Freighter') {
        console.log("Attempting Freighter connection...");
        if (window.freighter) {
          try {
            const publicKey = await window.freighter.getPublicKey();
            console.log("Connected to Freighter:", publicKey);
            
            const message = "Testing signature in builder mode";
            const signature = await window.freighter.signMessage(message);
            
            console.log("Freighter signature test successful:", {
              publicKey,
              signature,
            });
            setErrorMessage("Freighter connection and signature successful!");
          } catch (error) {
            console.error("Error with Freighter connection:", error);
            setErrorMessage("Freighter connection failed: " + error.message);
          }
        } else {
          console.log("Freighter not found");
          setErrorMessage("Freighter wallet not found. Please install it.");
        }
      }
    } catch (error) {
      console.error(`Error with ${wallet.name} signature:`, error);
      setErrorMessage(`${wallet.name} signature test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowWalletPopup(false);
        setErrorMessage(""); // Clear error message when closing popup
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      const newContent = e.target.innerText.trim() || "Connect Wallet";
      updateContent(id, newContent);
      setIsEditing(false);
    }
  };

  // Handle key down for content editing
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
    }
  };

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [selectedElement, id]);

  // Combine styles from props and element data
  const combinedStyles = {
    ...defaultStyles,
    ...styles,
    ...propStyles,
    cursor: isEditing ? 'text' : 'pointer',
    outline: isEditing ? '2px solid #3b82f6' : 'none', // Add visual feedback when editing
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
    <button
      id={id}
      ref={buttonRef}
          onClick={handleClick}
          contentEditable={isEditing}
      onBlur={handleBlur}
          onKeyDown={handleKeyDown}
      suppressContentEditableWarning={true}
          style={combinedStyles}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : (isConnected ? "Disconnect" : (propContent || content || "Connect Wallet"))}
        </button>
        {isEditing && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '5px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            maxWidth: '300px',
            wordWrap: 'break-word',
          }}>
            Press Ctrl + Click to test wallet connections
          </div>
        )}
        {showWalletPopup && (
          <div 
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px',
              marginTop: '5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '200px',
              maxWidth: '300px',
            }}
            onMouseDown={(e) => {
              console.log("Popup clicked");
              e.stopPropagation();
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Test Wallet Connections</h4>
            {wallets
              .filter(wallet => wallet && wallet.enabled)
              .map((wallet, index) => (
                <button
                  key={index}
                  onMouseDown={(e) => {
                    console.log("Wallet button clicked:", wallet.name);
                    e.stopPropagation();
                    handleWalletSelect(wallet, e);
                  }}
                  disabled={isLoading}
      style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    marginBottom: '5px',
                    backgroundColor: isLoading ? '#e0e0e0' : '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    opacity: isLoading ? 0.7 : 1,
      }}
    >
                  {isLoading && selectedWallet?.name === wallet.name ? "Connecting..." : wallet.name}
    </button>
              ))}
            {errorMessage && (
              <div style={{ 
                marginTop: '10px',
                padding: '8px',
                backgroundColor: errorMessage.includes('successful') ? '#e6ffe6' : '#ffe6e6',
                border: `1px solid ${errorMessage.includes('successful') ? '#4CAF50' : '#f44336'}`,
                borderRadius: '4px',
                fontSize: '12px',
                color: errorMessage.includes('successful') ? '#2e7d32' : '#d32f2f',
                wordWrap: 'break-word',
              }}>
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>
      {!showWalletPopup && errorMessage && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
          {errorMessage}
        </div>
      )}
    </>
  );
};

export default ConnectWalletButton;
