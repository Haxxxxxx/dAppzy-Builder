import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { buttonStyles } from './DefaultWeb3Styles';

const ConnectWalletButton = ({
  id,
  preventHeroModal,
  handlePanelToggle = () => {},
}) => {
  const { selectedElement, setSelectedElement, updateStyles, findElementById, elements } =
    useContext(EditableContext);

  const buttonRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [enabledWallets, setEnabledWallets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Load configuration for ConnectWalletButton
  const { connectWalletButton } = structureConfigurations.connectWalletButton;

  // Find the element by ID or use defaults
  const elementData = findElementById(id, elements) || {};
  const {
    content = connectWalletButton.content,
    styles = connectWalletButton.styles,
    settings = connectWalletButton.settings,
  } = elementData;

  useEffect(() => {
    if (settings?.wallets) {
      const activeWallets = settings.wallets.filter((wallet) => wallet.enabled);
      setEnabledWallets(activeWallets);
    }
  }, [settings]);

  // Request Signature
  const requestSignature = async (message) => {
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      alert('Signature approved. Proceeding to connect...');
      return true;
    } catch (err) {
      alert('Signature approval required to proceed.');
      return false;
    }
  };

  // Wallet Connection Handlers
  const connectPhantom = async () => {
    if (window.solana && window.solana.isPhantom) {
      const isSigned = await requestSignature("Please sign this message to confirm your identity.");
      if (isSigned) {
        const wallet = await window.solana.connect();
        alert(`Phantom wallet connected: ${wallet.publicKey.toString()}`);
      }
    } else {
      alert('Please install the Phantom wallet extension.');
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      alert(`MetaMask connected: ${accounts[0]}`);
    } else {
      alert('Please install the MetaMask extension.');
    }
  };

  const connectFreighter = async () => {
    if (window.freighterApi) {
      const isSigned = await requestSignature("Please sign this message to confirm your identity.");
      if (isSigned) {
        const publicKey = await window.freighterApi.getPublicKey();
        alert(`Freighter connected: ${publicKey}`);
      }
    } else {
      alert('Please install the Freighter wallet extension.');
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

  // Handle button click
  const handleButtonClick = (e) => {
    if (preventHeroModal) e.stopPropagation();
    setSelectedElement({ id, type: 'connectWalletButton', styles });
    setShowPopup(!showPopup);
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
        style={{ ...styles, ...buttonStyles.button }}
      >
        {content}
      </button>

      {/* Wallet Selection Popup */}
      {showPopup && (
        <div style={buttonStyles.popup}>
          <div style={buttonStyles.popupContent}>
            <h3>Select Wallet</h3>
            {enabledWallets.length > 0 ? (
              enabledWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelection(wallet.name)}
                  style={buttonStyles.walletOption}
                >
                  Connect with {wallet.name}
                </button>
              ))
            ) : (
              <p style={buttonStyles.noWallets}>No wallets available for connection.</p>
            )}
            <button onClick={() => setShowPopup(false)} style={buttonStyles.closeButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default ConnectWalletButton;

