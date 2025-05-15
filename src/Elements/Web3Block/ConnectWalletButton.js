import React, { useContext, useRef, useEffect, useState, useCallback, useMemo, forwardRef } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { useWalletContext } from '../../context/WalletContext';
import { useDappWallet } from '../../context/DappWalletContext';
import { useWeb3 } from '../../context/Web3Provider';
import { structureConfigurations } from '../../configs/structureConfigurations';
import { validateEthAddress } from '../../utils/securityUtils';
import { Button } from '../SelectableElements';

// Create a forwardRef wrapper for the Button component
const ButtonWithRef = forwardRef(({ content, styles, onClick, onMouseDown, ...props }, ref) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        ...styles,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      {...props}
    >
      {content}
    </div>
  );
});

const ConnectWalletButton = ({
  id,
  preventHeroModal,
  handlePanelToggle = () => {},
  content: propContent,
  styles: propStyles,
  handleSelect
}) => {
  const { selectedElement, setSelectedElement, updateContent, updateStyles, elements, findElementById } =
    useContext(EditableContext);
  
  // Determine if we're in builder mode or dapp mode
  const isBuilderMode = !window.location.pathname.includes('/preview') && !window.location.pathname.includes('/export');
  
  // Always call hooks at the top level
  const builderWallet = useWalletContext();
  const dappWallet = useDappWallet();
  const { account, connect, isConnected: isWeb3Connected, provider } = useWeb3();
  
  // Select the appropriate wallet context based on mode
  const walletContext = isBuilderMode ? builderWallet : dappWallet;
  const { walletAddress, isConnected, disconnect, isLoading: contextIsLoading, walletId, connectWallet, disconnectWallet, error: walletError } = walletContext || {};

  const buttonRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isTestConnected, setIsTestConnected] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle wallet connection
  const handleConnect = useCallback(async () => {
    try {
      setLocalError(null);
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setLocalError(error.message || 'Failed to connect wallet');
    }
  }, [connectWallet]);

  // Handle wallet disconnection
  const handleDisconnect = useCallback(async () => {
    try {
      setLocalError(null);
      await disconnectWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setLocalError(error.message || 'Failed to disconnect wallet');
    }
  }, [disconnectWallet]);

  // Handle button click with combined functionality
  const handleButtonClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isBuilderMode) {
      // Check if Ctrl/Cmd key is pressed for wallet testing
      if (e.ctrlKey || e.metaKey) {
        // Show wallet popup for testing
          setShowWalletPopup(true);
        setIsEditing(false);
        // Don't select the button when testing wallet
        return;
      } else {
        // Normal click for editing
        setIsEditing(true);
        setShowWalletPopup(false);
        if (handleSelect) {
          handleSelect(e);
        }
        setSelectedElement({ id, type: 'connectWalletButton', styles });
      }
    } else {
      // In dapp mode, handle actual wallet connection
    if (isConnected) {
        handleDisconnect();
      } else {
        handleConnect();
      }
    }
  }, [handleSelect, id, setSelectedElement, styles, isBuilderMode, isConnected, handleDisconnect, handleConnect]);

  // Handle mouse down to prevent event bubbling
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle wallet selection from popup
  const handleWalletSelect = async (wallet) => {
    console.log('Selected wallet:', wallet);
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Keep the button selected while testing wallet
      if (handleSelect) {
        handleSelect();
      }
      setSelectedElement({ id, type: 'connectWalletButton', styles });
      
      switch (wallet.type) {
        case 'ethereum':
          if (window.ethereum) {
            console.log('Connecting to Ethereum wallet');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: ['Please sign this message to verify your wallet connection.', accounts[0]]
              });
              if (signature) {
                console.log('Ethereum wallet connected successfully');
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
          } else {
            throw new Error('MetaMask is not installed');
          }
          break;
          
        case 'solana':
          if (window.solana) {
            try {
              console.log('Connecting to Solana wallet');
              // Request wallet connection
              const { publicKey } = await window.solana.connect();
              if (publicKey) {
                // Request signature for verification
                const message = new TextEncoder().encode("Please sign this message to verify your wallet connection.");
                const { signature } = await window.solana.signMessage(message);
                
                if (signature) {
                  console.log('Solana wallet connected successfully');
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
          } else {
            throw new Error('Solana wallet is not installed');
          }
          break;
          
        case 'stellar':
          if (window.freighter) {
            console.log('Connecting to Stellar wallet');
            const publicKey = await window.freighter.getPublicKey();
            if (publicKey) {
              const signature = await window.freighter.signMessage('Please sign this message to verify your wallet connection.');
              if (signature) {
                console.log('Stellar wallet connected successfully');
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
          } else {
            throw new Error('Freighter wallet is not installed');
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

  // Prevent selection when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowWalletPopup(false);
        setErrorMessage("");
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
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
    if (isLoading || contextIsLoading) return "Connecting...";
    if (isBuilderMode) {
      if (isTestConnected) return "Disconnect";
      return content || "Connect Wallet";
    }
    if (isConnected) return "Disconnect";
    return content || "Connect Wallet";
  };

  // Get button text based on connection state
  const buttonText = useMemo(() => {
    if (isLoading || contextIsLoading) return 'Connecting...';
    if (isConnected && walletAddress) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
    return content;
  }, [isLoading, contextIsLoading, isConnected, walletAddress, content]);

  // Get button styles based on state
  const buttonStyles = useMemo(() => ({
    ...styles,
    position: 'relative',
    transition: 'all 0.2s ease',
    opacity: isLoading || contextIsLoading ? 0.7 : 1,
    cursor: isLoading || contextIsLoading ? 'wait' : 'pointer',
    transform: isHovered ? 'translateY(-1px)' : 'none',
    boxShadow: isHovered ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
    backgroundColor: isConnected ? '#4CAF50' : styles.backgroundColor || '#2196F3',
    color: styles.color || '#ffffff',
    padding: styles.padding || '10px 20px',
    borderRadius: styles.borderRadius || '8px',
    border: styles.border || 'none',
    fontSize: styles.fontSize || '16px',
    fontWeight: styles.fontWeight || '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }), [styles, isLoading, contextIsLoading, isHovered, isConnected]);

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseDown={handleMouseDown}
    >
      <ButtonWithRef
          id={id}
          ref={buttonRef}
        content={buttonText}
        styles={buttonStyles}
        onClick={handleButtonClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(false)}
        disabled={isLoading || contextIsLoading}
        aria-label={isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
        role="button"
        tabIndex={0}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
      />
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
          Click to edit text, Ctrl/Cmd + Click to test wallet connections
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
          onMouseDown={handleMouseDown}
          >
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Test Wallet Connections</h4>
            {wallets
              .filter(wallet => wallet && wallet.enabled)
              .map((wallet, index) => (
                <button
                  key={index}
                  onMouseDown={(e) => {
                    console.log("Wallet button clicked:", wallet.name);
                  e.preventDefault();
                    e.stopPropagation();
                    handleWalletSelect(wallet);
                  }}
                disabled={isLoading || contextIsLoading}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    marginBottom: '5px',
                  backgroundColor: isLoading || contextIsLoading ? '#e0e0e0' : '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  cursor: isLoading || contextIsLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                  opacity: isLoading || contextIsLoading ? 0.7 : 1,
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
      {(localError || walletError) && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ff4444',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            marginTop: '8px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {localError || walletError}
        </div>
      )}
      {(isLoading || contextIsLoading) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            border: '2px solid #ffffff',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default React.memo(ConnectWalletButton);
