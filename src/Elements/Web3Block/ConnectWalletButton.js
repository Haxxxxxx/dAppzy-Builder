import React, { useContext, useRef, useEffect, useState } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useWalletContext } from '../../context/WalletContext';
import { useDappWallet } from '../../context/DappWalletContext';
import { useWeb3 } from '../../context/Web3Provider';
import { structureConfigurations } from '../../configs/structureConfigurations';
import { validateEthAddress } from '../../utils/securityUtils';

const ConnectWalletButton = ({
  id,
  preventHeroModal,
  handlePanelToggle = () => {},
  content: propContent,
  styles: propStyles,
}) => {
  const { selectedElement, setSelectedElement, updateContent, updateStyles, elements, findElementById } =
    useContext(EditableContext);
  
  // Determine if we're in builder mode or dapp mode
  const isBuilderMode = !window.location.pathname.includes('/preview') && !window.location.pathname.includes('/export');
  
  // Always call hooks at the top level
  const builderWallet = useWalletContext();
  const dappWallet = useDappWallet(); // Always call the hook
  const { account, connect, isConnected: isWeb3Connected, provider } = useWeb3();
  
  // Select the appropriate wallet context based on mode
  const walletContext = isBuilderMode ? builderWallet : dappWallet;
  const { walletAddress, isConnected, disconnect } = walletContext || {};

  const buttonRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isTestConnected, setIsTestConnected] = useState(false);

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

  // Handle button click
  const handleClick = async (e) => {
    console.log("Main button clicked");
    e.preventDefault();
    e.stopPropagation();
    
    if (isBuilderMode) {
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

      // Handle disconnect if button shows "Disconnect"
      if (isTestConnected) {
        try {
          setIsLoading(true);
          // Reset all connection states
          setIsTestConnected(false);
          setSelectedWallet(null);
          setErrorMessage("");
          setShowWalletPopup(false);
          console.log("Successfully disconnected test wallet");
        } catch (error) {
          console.error('Error disconnecting test wallet:', error);
          setErrorMessage(error.message);
        } finally {
          setIsLoading(false);
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

    // Live mode behavior (dapp mode)
    if (isConnected) {
      // Handle disconnect
      try {
        setIsLoading(true);
        await disconnect();
        setIsLoading(false);
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
        setErrorMessage(error.message);
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      // In dapp mode, we want to use the dapp's wallet connection
      if (!isBuilderMode) {
        // Check if we're in a preview or export mode
        const isPreview = window.location.pathname.includes('/preview');
        const isExport = window.location.pathname.includes('/export');
        
        if (isPreview || isExport) {
          // Use the dapp's wallet connection
          await connect();
        } else {
          // This is the actual dapp, use the dapp's wallet connection
          await connect();
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  // Handle wallet selection from popup
  const handleWalletSelect = async (wallet) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      switch (wallet.type) {
        case 'ethereum':
          if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: ['Please sign this message to verify your wallet connection.', accounts[0]]
              });
              if (signature) {
                setIsTestConnected(true);
                setSelectedWallet(wallet);
                setShowWalletPopup(false);
                // Update wallet context
                if (walletContext) {
                  walletContext.setWalletAddress(accounts[0]);
                  walletContext.setIsConnected(true);
                }
              }
            }
          }
          break;
          
        case 'solana':
          if (walletContext) {
            try {
              // Request wallet connection
              const { publicKey } = await window.solana.connect();
              if (publicKey) {
                // Request signature for verification
                const message = new TextEncoder().encode("Please sign this message to verify your wallet connection.");
                const { signature } = await window.solana.signMessage(message);
                
                if (signature) {
                  setIsTestConnected(true);
                  setSelectedWallet(wallet);
                  setShowWalletPopup(false);
                  // Update wallet context
                  walletContext.setWalletAddress(publicKey.toString());
                  walletContext.setIsConnected(true);
                }
              }
            } catch (err) {
              console.error('Solana wallet connection error:', err);
              throw new Error(`Failed to connect to Solana wallet: ${err.message}`);
            }
          }
          break;
          
        case 'stellar':
          if (window.freighter) {
            const publicKey = await window.freighter.getPublicKey();
            if (publicKey) {
              const signature = await window.freighter.signMessage('Please sign this message to verify your wallet connection.');
              if (signature) {
                setIsTestConnected(true);
                setSelectedWallet(wallet);
                setShowWalletPopup(false);
                // Update wallet context
                if (walletContext) {
                  walletContext.setWalletAddress(publicKey);
                  walletContext.setIsConnected(true);
                }
              }
            }
          }
          break;
          
        default:
          throw new Error(`Unsupported wallet type: ${wallet.type}`);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setErrorMessage(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle test disconnect
  const handleTestDisconnect = async () => {
    try {
      setIsLoading(true);
      // Reset all connection states
      setIsTestConnected(false);
      setSelectedWallet(null);
      setErrorMessage("");
      setShowWalletPopup(false);
      
      // Reset wallet context
      if (walletContext) {
        walletContext.setWalletAddress("");
        walletContext.setIsConnected(false);
        // Reset other wallet context data
        if (walletContext.setBalance) walletContext.setBalance(0);
        if (walletContext.setWalletId) walletContext.setWalletId("");
      }
      
      // Force a re-render by updating the content
      if (content === "Disconnect") {
        updateContent(id, "Connect Wallet");
      }
      console.log("Successfully disconnected test wallet and reset dashboard data");
    } catch (error) {
      console.error('Error disconnecting test wallet:', error);
      setErrorMessage(error.message);
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
    outline: isEditing ? '2px solid #3b82f6' : 'none',
  };

  // Determine button text based on mode and connection state
  const getButtonText = () => {
    if (isLoading) return "Connecting...";
    if (isBuilderMode) {
      if (isTestConnected) return "Disconnect";
      return content || "Connect Wallet";
    }
    if (isConnected) return "Disconnect";
    return content || "Connect Wallet";
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          id={id}
          ref={buttonRef}
          onClick={isBuilderMode && isTestConnected ? handleTestDisconnect : handleClick}
          contentEditable={isEditing}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
          style={combinedStyles}
          disabled={isLoading}
        >
          {getButtonText()}
        </button>
        {isEditing && !isTestConnected && (
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
                    handleWalletSelect(wallet);
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
