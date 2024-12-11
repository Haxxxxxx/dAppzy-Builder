import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';

const ConnectWalletButton = ({
  id,
  content: initialContent,
  styles: customStyles,
  preventHeroModal,
  handlePanelToggle = () => {},
}) => {
  const { selectedElement, setSelectedElement, elements, findElementById, updateStyles } =
    useContext(EditableContext);
  const buttonRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [enabledWallets, setEnabledWallets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const elementData = findElementById(id, elements) || {};
  const { content = initialContent, styles = {}, settings = {} } = elementData;

  useEffect(() => {
    if (settings?.wallets) {
      const activeWallets = settings.wallets.filter((wallet) => wallet.enabled);
      setEnabledWallets(activeWallets);
    }
  }, [settings]);

  const handleStyleChange = (newStyles) => {
    updateStyles(id, newStyles);
  };

  const handleButtonClick = (e) => {
    if (preventHeroModal) {
      e.stopPropagation();
    }
    setSelectedElement({ id, type: 'connectWalletButton', styles });
    setShowPopup(!showPopup);
  };

  const handleCloseEditing = () => {
    setIsEditing(false);
    buttonRef.current?.focus();
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
          cursor: 'pointer',
          padding: '8px 12px',
          border: '2px solid #4caf50', // Default border style
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 'bold',
          backgroundColor: styles.backgroundColor || '#4caf50',
          color: styles.color || '#ffffff',
        }}
        className="connect-wallet-button"
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
                  onClick={() => alert(`Connecting to ${wallet.name}`)}
                  className="wallet-option"
                  style={{
                    margin: '5px 0',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                  }}
                >
                  Connect with {wallet.name}
                </button>
              ))
            ) : (
              <p>No wallets available for connection.</p>
            )}
            <button
              onClick={() => setShowPopup(false)}
              className="close-button"
              style={{
                padding: '8px 12px',
                marginTop: '10px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#d9534f',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
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
                value={styles.backgroundColor || '#4caf50'}
                onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
              />
            </label>
          </div>
          <div>
            <label>
              Text Color:
              <input
                type="color"
                value={styles.color || '#ffffff'}
                onChange={(e) => handleStyleChange({ color: e.target.value })}
              />
            </label>
          </div>
          <div>
            <label>
              Border Radius:
              <input
                type="range"
                min="0"
                max="20"
                value={styles.borderRadius || 8}
                onChange={(e) => handleStyleChange({ borderRadius: `${e.target.value}px` })}
              />
            </label>
          </div>
          <button
            onClick={handleCloseEditing}
            className="close-button"
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default ConnectWalletButton;
