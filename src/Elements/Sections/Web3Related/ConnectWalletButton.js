import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';

const ConnectWalletButton = ({ id, content: initialContent, styles: customStyles, preventHeroModal,   handlePanelToggle = () => {},}) => {
  const { selectedElement, setSelectedElement, elements, findElementById, updateStyles } = useContext(EditableContext);
  const buttonRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [enabledWallets, setEnabledWallets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {}, settings = {} } = elementData;

  // Update enabled wallets based on settings
  useEffect(() => {
    if (settings?.wallets) {
      const activeWallets = settings.wallets.filter((wallet) => wallet.enabled);
      setEnabledWallets(activeWallets);
    }
  }, [settings]);

  // Common signature request
  const requestSignature = async (message) => {
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      console.log('Signature:', signedMessage.signature);
      alert('Signature approved. Proceeding to connect...');
      return true;
    } catch (err) {
      console.error('Signature request failed:', err);
      alert('Signature approval required to proceed.');
      return false;
    }
  };

  // Wallet connection handlers
  const connectPhantom = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const message = "Please sign this message to confirm your identity.";
        const isSigned = await requestSignature(message);
        if (isSigned) {
          const wallet = await window.solana.connect();
          console.log('Phantom wallet connected:', wallet.publicKey.toString());
          alert(`Phantom wallet connected: ${wallet.publicKey.toString()}`);
        }
      } else {
        alert('Please install the Phantom wallet extension.');
      }
    } catch (err) {
      console.error('Phantom connection failed:', err);
    }
  };

  const connectMetaMask = async () => {
    try {
      if (window.ethereum) {
        const message = "Please sign this message to confirm your identity.";
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('MetaMask connected:', accounts[0]);
        alert(`MetaMask connected: ${accounts[0]}`);
      } else {
        alert('Please install the MetaMask extension.');
      }
    } catch (err) {
      console.error('MetaMask connection failed:', err);
    }
  };

  const connectFreighter = async () => {
    try {
      if (window.freighterApi) {
        const message = "Please sign this message to confirm your identity.";
        const isSigned = await requestSignature(message);
        if (isSigned) {
          const publicKey = await window.freighterApi.getPublicKey();
          console.log('Freighter connected:', publicKey);
          alert(`Freighter connected: ${publicKey}`);
        }
      } else {
        alert('Please install the Freighter wallet extension.');
      }
    } catch (err) {
      console.error('Freighter connection failed:', err);
    }
  };

  // Handle wallet selection
  const handleWalletSelection = (walletName) => {
    switch (walletName) {
      case 'Phantom':
        connectPhantom();
        break;
      case 'MetaMask':
        connectMetaMask();
        break;
      case 'Freighter':
        connectFreighter();
        break;
      default:
        alert(`Wallet ${walletName} is not supported.`);
    }
    setShowPopup(false);
  };

  // Button click handler
  const handleButtonClick = (e) => {
    if (preventHeroModal) {
      e.stopPropagation(); // Prevent click from triggering parent behavior
    }
    e.stopPropagation(); // Prevent click from triggering parent behavior
    setSelectedElement({ id, type: 'connectWalletButton', styles });
    setShowPopup(!showPopup);
    handlePanelToggle('settings');
  };

  // Close editing panel
  const handleCloseEditing = () => {
    setIsEditing(false);
    buttonRef.current?.focus(); // Retain focus on the button
  };

  // Update styles
  const handleStyleChange = (newStyles) => {
    updateStyles(id, newStyles);
  };

  return (
    <>
      <button
        id={id}
        ref={buttonRef}
        onClick={handleButtonClick}
        style={{
          ...styles,
          ...customStyles,
          border: selectedElement?.id === id ? '1px dashed blue' : 'none',
          cursor: 'pointer',
        }}
      >
        {content || 'Connect Wallet'}
      </button>

      {/* Wallet Selection Popup */}
      {showPopup && (
        <div className="wallet-popup">
          <div className="popup-content">
            <h3>Select Wallet</h3>
            {enabledWallets.length > 0 ? (
              enabledWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelection(wallet.name)}
                  className="wallet-option"
                >
                  Connect with {wallet.name}
                </button>
              ))
            ) : (
              <p>No wallets available for connection.</p>
            )}
            <button onClick={() => setShowPopup(false)} className="close-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Style Editing Panel */}
      {isEditing && (
        <div className="settings-popup">
          <h3>Edit Button Styles</h3>
          <div>
            <label>
              Background Color:
              <input
                type="color"
                value={styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
              />
            </label>
          </div>
          <div>
            <label>
              Text Color:
              <input
                type="color"
                value={styles.color || '#000000'}
                onChange={(e) => handleStyleChange({ color: e.target.value })}
              />
            </label>
          </div>
          <button onClick={handleCloseEditing} className="close-button">
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default ConnectWalletButton;
