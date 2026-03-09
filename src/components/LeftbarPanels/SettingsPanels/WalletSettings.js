import React, { useState, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import './css/ConnectWalletSettings.css';
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const WalletSettingsPanel = () => {
  const { selectedElement, updateConfiguration, updateContent } = useContext(EditableContext);
  const [wallets, setWallets] = useState([]);
  const [elementId, setElementId] = useState('');
  const [buttonText, setButtonText] = useState('Connect Wallet');
  const [connectedText, setConnectedText] = useState('');

  useEffect(() => {
    // Load the selected element's data
    if (selectedElement) {
      setElementId(selectedElement.id || '');
      setButtonText(selectedElement.content || 'Connect Wallet');
      setConnectedText(selectedElement.settings?.connectedText || '');
      setWallets(selectedElement.settings?.wallets || [
        { name: 'Phantom', enabled: true, type: 'solana' },
        { name: 'Solflare', enabled: true, type: 'solana' },
        { name: 'Backpack', enabled: true, type: 'solana' },
        { name: 'Glow', enabled: true, type: 'solana' },
        { name: 'MetaMask', enabled: false, type: 'ethereum' },
        { name: 'Freighter', enabled: false, type: 'stellar' },
      ]);
    }
  }, [selectedElement]);

  const toggleWallet = (index) => {
    const updatedWallets = wallets.map((wallet, i) =>
      i === index ? { ...wallet, enabled: !wallet.enabled } : wallet
    );
    setWallets(updatedWallets);

    // Persist changes to the context
    if (selectedElement) {
      updateConfiguration(selectedElement.id, 'wallets', updatedWallets);
    }
  };

  const handleButtonTextChange = (e) => {
    const text = e.target.value;
    setButtonText(text);
    if (selectedElement) {
      updateContent(selectedElement.id, text || 'Connect Wallet');
    }
  };

  const handleConnectedTextChange = (e) => {
    const text = e.target.value;
    setConnectedText(text);
    if (selectedElement) {
      updateConfiguration(selectedElement.id, 'connectedText', text);
    }
  };

  const handleIdChange = (e) => {
    const newId = e.target.value;
    setElementId(newId);

    // Persist changes to the context
    if (selectedElement) {
      updateConfiguration(selectedElement.id, 'id', newId);
    }
  };

  return (
    <div className="wallet-settings-panel">
      <hr />
      <div className="settings-group">
        <label htmlFor="elementId">ID</label>
        <input
          type="text"
          id="elementId"
          value={elementId}
          onChange={handleIdChange}
          placeholder="Enter element ID"
          className="settings-input"
        />
      </div>
      <hr />
      <CollapsibleSection title={"Button Text"}>
        <div className="settings-group">
          <label htmlFor="buttonText">Button Label</label>
          <input
            type="text"
            id="buttonText"
            value={buttonText}
            onChange={handleButtonTextChange}
            placeholder="Connect Wallet"
            className="settings-input"
          />
        </div>
        <div className="settings-group">
          <label htmlFor="connectedText">Connected Label</label>
          <input
            type="text"
            id="connectedText"
            value={connectedText}
            onChange={handleConnectedTextChange}
            placeholder="Leave empty to show address"
            className="settings-input"
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title={"Connect Wallet Settings"}>
        {wallets.map((wallet, index) => (
          <div key={index} className="wallet-setting">
            <label className="switch-label">
              <div className="switch">
                <input
                  type="checkbox"
                  checked={wallet.enabled}
                  onChange={() => toggleWallet(index)}
                />
                <span className="slider"></span>
              </div>
            </label>
            <span>{wallet.name}</span>
          </div>
        ))}
        <p className="upvote-message">
          Can't find your wallet? More wallets coming soon!
        </p>
      </CollapsibleSection>
    </div>
  );
};

export default WalletSettingsPanel;
