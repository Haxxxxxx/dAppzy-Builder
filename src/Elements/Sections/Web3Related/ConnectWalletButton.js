import React, { useContext, useRef, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { structureConfigurations } from '../../../configs/structureConfigurations';
import { buttonStyles } from './DefaultWeb3Styles';

const ConnectWalletButton = ({
  id,
  preventHeroModal,
  handlePanelToggle = () => {},
}) => {
  const { selectedElement, setSelectedElement, updateContent, updateStyles, elements, findElementById } =
    useContext(EditableContext);
  const buttonRef = useRef(null);

  // Get element data dynamically
  const elementData = findElementById(id, elements) || {};
  const {
    content = "Connect Wallet", // Default content
    styles = structureConfigurations.connectWalletButton?.styles || {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
    },
    settings = structureConfigurations.connectWalletButton?.settings || {
      wallets: [
        { name: 'Phantom', enabled: true },
        { name: 'MetaMask', enabled: false },
        { name: 'Freighter', enabled: false },
      ],
    },
  } = elementData;

  // Handle selection
  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement({ id, type: 'connectWalletButton', styles, settings });
  };

  // Update content on blur
  const handleBlur = (e) => {
    if (selectedElement?.id === id) {
      updateContent(id, e.target.innerText.trim() || "Connect Wallet"); // Default text if empty
    }
  };

  // Autofocus when selected
  useEffect(() => {
    if (selectedElement?.id === id && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [selectedElement, id]);

  return (
    <button
      id={id}
      ref={buttonRef}
      onClick={handleSelect}
      contentEditable={selectedElement?.id === id}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      style={{
        ...styles, // Use styles from configuration or element data
        cursor: selectedElement?.id === id ? 'text' : 'pointer',
      }}
    >
      {content || "Connect Wallet"} {/* Use content from configuration or default */}
    </button>
  );
};

export default ConnectWalletButton;
