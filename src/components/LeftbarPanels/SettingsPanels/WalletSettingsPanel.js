import React, { useState, useContext, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import './css/CandyMachineSettings.css';

const WalletSettingsPanel = ({ onUpdateSettings = () => {} }) => {
    const { selectedElement, updateConfiguration } = useContext(EditableContext);
    const [wallets, setWallets] = useState([
      { name: 'Phantom', enabled: true },
      { name: 'MetaMask', enabled: false },
      { name: 'Freighter', enabled: false },
    ]);
  
    useEffect(() => {
      if (selectedElement?.settings?.wallets) {
        setWallets(selectedElement.settings.wallets);
      }
    }, [selectedElement]);
  
    const toggleWallet = (index) => {
      const updatedWallets = wallets.map((wallet, i) =>
        i === index ? { ...wallet, enabled: !wallet.enabled } : wallet
      );
      setWallets(updatedWallets);
  
      // Save settings to EditableContext
      updateConfiguration(selectedElement.id, 'wallets', updatedWallets);
    };
  
    const handleSave = () => {
      onUpdateSettings({ wallets });
      alert('Wallet settings saved.');
    };
  
    return (
      <div className="wallet-settings-panel">
        <h3>Wallet Login Methods</h3>
        {wallets.map((wallet, index) => (
          <div key={index} className="wallet-setting">
            <label>
              <input
                type="checkbox"
                checked={wallet.enabled}
                onChange={() => toggleWallet(index)}
              />
              {wallet.name}
            </label>
          </div>
        ))}
        <button onClick={handleSave} className="save-button">
          Save Wallet Settings
        </button>
      </div>
    );
  };
  
export default WalletSettingsPanel;
