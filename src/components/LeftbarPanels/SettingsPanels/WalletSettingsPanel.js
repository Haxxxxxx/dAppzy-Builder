import React, { useState, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import './css/ConnectWalletSettings.css';
import CollapsibleSection from './LinkSettings/CollapsibleSection';

const WalletSettingsPanel = () => {
  const { selectedElement, updateConfiguration } = useContext(EditableContext);
  const [wallets, setWallets] = useState([]);
  const [elementId, setElementId] = useState('');

  useEffect(() => {
    // Load the selected element's data
    if (selectedElement) {
      setElementId(selectedElement.id || '');
      setWallets(selectedElement.settings?.wallets || [
        { name: 'Phantom', enabled: true },
        { name: 'MetaMask', enabled: false },
        { name: 'Freighter', enabled: false },
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
          Can’t find your wallet?{' '}
          <a
            href="https://your-feature-request-page.com"
            target="_blank"
            rel="noopener noreferrer"
            className="upvote-link"
          >
            Check our feature upvote page
          </a>
        </p>
      </CollapsibleSection>
    </div>
  );
};

export default WalletSettingsPanel;
