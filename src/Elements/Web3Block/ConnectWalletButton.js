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

export const generateWalletConnectScript = () => {
  return `
    <!-- Add Web3 and ethers dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js"></script>
    <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
    <script>
      // Wait for all scripts to load
      window.addEventListener('load', function() {
        // Check if Web3 is available
        if (typeof Web3 === 'undefined') {
          console.error('Web3 is not loaded');
          return;
        }

        // Initialize Web3 instance
        let web3;
        let provider;

        // DeFi data state
        const defiState = {
          totalPools: 'Loading...',
          totalValueLocked: '$0',
          bestAPY: 'Not Connected',
          investmentRange: '$10,000',
          supportedAssets: '20+',
          historicalData: '5 Years',
          supportedChains: 'Select Chain',
          transferTime: 'Select Chain',
          securityScore: '0.1%',
          userStakedAmount: '$0',
          userEarnings: '$0',
          topPerformingPools: [],
          userPortfolio: {
            totalValue: '$0',
            dailyChange: '0%',
            weeklyChange: '0%',
            monthlyChange: '0%'
          },
          recommendedStrategies: [],
          recentTransfers: []
        };

        // Wallet state management
        const walletState = {
          walletAddress: '',
          balance: 0,
          isConnected: false,
          isLoading: false,
          walletId: '',
          chainId: null,
          disconnect: async () => {
            try {
              if (window.ethereum) {
                // Clear state
                walletState.walletAddress = '';
                walletState.balance = 0;
                walletState.isConnected = false;
                walletState.walletId = '';
                walletState.chainId = null;
                
                // Reset provider state
                provider = null;
                web3 = null;

                // Reset DeFi data
                resetDefiData();
              }
              if (window.solana) {
                await window.solana.disconnect();
              }
              updateWalletUI();
              updateDeFiUI();
            } catch (error) {
              console.error('Error disconnecting:', error);
              showError('Error disconnecting wallet');
            }
          },
          setIsConnected: (connected) => {
            walletState.isConnected = connected;
            updateWalletUI();
            if (connected) {
              fetchDefiData();
            } else {
              resetDefiData();
            }
          },
          setWalletAddress: (address) => {
            walletState.walletAddress = address;
            walletState.walletId = address;
            updateWalletUI();
          }
        };

        // Reset DeFi data to default values
        function resetDefiData() {
          Object.assign(defiState, {
            totalPools: 'Not Connected',
            totalValueLocked: '$0',
            bestAPY: 'Not Connected',
            investmentRange: '$10,000',
            supportedAssets: '20+',
            historicalData: '5 Years',
            supportedChains: 'Select Chain',
            transferTime: 'Select Chain',
            securityScore: '0.1%',
            userStakedAmount: '$0',
            userEarnings: '$0',
            topPerformingPools: [],
            userPortfolio: {
              totalValue: '$0',
              dailyChange: '0%',
              weeklyChange: '0%',
              monthlyChange: '0%'
            },
            recommendedStrategies: [],
            recentTransfers: []
          });
          updateDeFiUI();
        }

        // Show error message
        function showError(message) {
          const errorDiv = document.getElementById('wallet-error');
          if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
              errorDiv.style.display = 'none';
            }, 3000);
          }
        }

        // Update UI based on wallet state
        function updateWalletUI() {
          const button = document.getElementById('connect-wallet-button');
          const addressDiv = document.getElementById('wallet-address');
          
          if (button) {
            button.textContent = walletState.isConnected ? 'Disconnect' : 'Connect Wallet';
            button.disabled = walletState.isLoading;
          }
          
          if (addressDiv) {
            if (walletState.isConnected && walletState.walletAddress) {
              addressDiv.textContent = \`\${walletState.walletAddress.slice(0, 6)}...\${walletState.walletAddress.slice(-4)}\`;
              addressDiv.style.display = 'block';
            } else {
              addressDiv.style.display = 'none';
            }
          }
        }

        // Update DeFi UI with current state
        function updateDeFiUI() {
          // Update Aggregator Module
          updateAggregatorModule();
          
          // Update Simulation Module
          updateSimulationModule();
          
          // Update Bridge Module
          updateBridgeModule();
        }

        // Update Aggregator Module UI
        function updateAggregatorModule() {
          const aggregatorStats = document.querySelectorAll('.defi-aggregator-stat');
          aggregatorStats.forEach(stat => {
            const label = stat.getAttribute('data-label');
            switch(label) {
              case 'Connected Wallet':
                stat.textContent = walletState.isConnected ? 
                  \`\${walletState.walletAddress.slice(0, 6)}...\${walletState.walletAddress.slice(-4)}\` : 
                  'Not Connected';
                break;
              case 'Total Pools':
                stat.textContent = defiState.totalPools;
                break;
              case 'Total Value Locked':
                stat.textContent = defiState.totalValueLocked;
                break;
              case 'Best APY':
                stat.textContent = defiState.bestAPY;
                break;
              case 'Your Staked Amount':
                stat.textContent = defiState.userStakedAmount;
                break;
              case 'Your Earnings':
                stat.textContent = defiState.userEarnings;
                break;
            }
          });
        }

        // Update Simulation Module UI
        function updateSimulationModule() {
          const simulationStats = document.querySelectorAll('.defi-simulation-stat');
          simulationStats.forEach(stat => {
            const label = stat.getAttribute('data-label');
            switch(label) {
              case 'Portfolio Value':
                stat.textContent = defiState.userPortfolio.totalValue;
                break;
              case '24h Change':
                stat.textContent = defiState.userPortfolio.dailyChange;
                break;
              case '7d Change':
                stat.textContent = defiState.userPortfolio.weeklyChange;
                break;
              case '30d Change':
                stat.textContent = defiState.userPortfolio.monthlyChange;
                break;
              case 'Supported Assets':
                stat.textContent = defiState.supportedAssets;
                break;
              case 'Historical Data':
                stat.textContent = defiState.historicalData;
                break;
            }
          });
        }

        // Update Bridge Module UI
        function updateBridgeModule() {
          const bridgeStats = document.querySelectorAll('.defi-bridge-stat');
          bridgeStats.forEach(stat => {
            const label = stat.getAttribute('data-label');
            switch(label) {
              case 'Supported Chains':
                stat.textContent = defiState.supportedChains;
                break;
              case 'Transfer Time':
                stat.textContent = defiState.transferTime;
                break;
              case 'Security Score':
                stat.textContent = defiState.securityScore;
                break;
            }
          });
        }

        // Initialize Web3 with provider
        async function initializeWeb3() {
          if (window.ethereum) {
            try {
              // Modern dapp browsers
              web3 = new Web3(window.ethereum);
              provider = new ethers.providers.Web3Provider(window.ethereum);
              
              // Listen for account changes
              window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                  walletState.disconnect();
                } else {
                  walletState.setWalletAddress(accounts[0]);
                  fetchDefiData();
                }
              });

              // Listen for chain changes
              window.ethereum.on('chainChanged', (chainId) => {
                walletState.chainId = chainId;
                fetchDefiData();
              });

              return true;
            } catch (error) {
              console.error('Error initializing Web3:', error);
              return false;
            }
          }
          return false;
        }

        // Fetch DeFi data for connected wallet
        async function fetchDefiData() {
          if (!walletState.isConnected || !walletState.walletId) {
            resetDefiData();
            return;
          }

          try {
            // Simulate fetching data from various DeFi protocols
            const [aggregatorData, simulationData, bridgeData] = await Promise.all([
              fetchAggregatorData(),
              fetchSimulationData(),
              fetchBridgeData()
            ]);

            // Update state with fetched data
            Object.assign(defiState, {
              ...aggregatorData,
              ...simulationData,
              ...bridgeData
            });

            // Update UI with new data
            updateDeFiUI();
          } catch (error) {
            console.error('Error fetching DeFi data:', error);
            showError('Error fetching DeFi data');
          }
        }

        // Simulate fetching aggregator data
        async function fetchAggregatorData() {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            totalPools: '150+',
            totalValueLocked: '$1.5B',
            bestAPY: '12.5%',
            userStakedAmount: '$1,000',
            userEarnings: '$125',
            topPerformingPools: [
              { name: 'ETH-USDC', apy: '8.5%', tvl: '$500M' },
              { name: 'BTC-ETH', apy: '7.2%', tvl: '$300M' },
              { name: 'SOL-USDT', apy: '12.5%', tvl: '$200M' }
            ]
          };
        }

        // Simulate fetching simulation data
        async function fetchSimulationData() {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          return {
            investmentRange: '$100 - $1M',
            supportedAssets: '50+',
            historicalData: '7 Years',
            userPortfolio: {
              totalValue: '$10,500',
              dailyChange: '+2.5%',
              weeklyChange: '+5.8%',
              monthlyChange: '+12.3%'
            },
            recommendedStrategies: [
              { name: 'Conservative', apy: '5-8%', risk: 'Low' },
              { name: 'Balanced', apy: '8-15%', risk: 'Medium' },
              { name: 'Aggressive', apy: '15-25%', risk: 'High' }
            ]
          };
        }

        // Simulate fetching bridge data
        async function fetchBridgeData() {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          return {
            supportedChains: 'ETH, BSC, SOL, AVAX',
            transferTime: '2-5 minutes',
            securityScore: '9.8%',
            recentTransfers: [
              { from: 'ETH', to: 'BSC', amount: '$500', status: 'Completed' },
              { from: 'SOL', to: 'ETH', amount: '$1000', status: 'Pending' }
            ]
          };
        }

        // Handle MetaMask connection
        async function connectMetaMask() {
          if (!window.ethereum) {
            showError('MetaMask is not installed');
            return false;
          }

          try {
            walletState.isLoading = true;
            updateWalletUI();

            // Initialize Web3 if not already done
            if (!web3) {
              const initialized = await initializeWeb3();
              if (!initialized) {
                throw new Error('Failed to initialize Web3');
              }
            }

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              walletState.setWalletAddress(accounts[0]);
              walletState.setIsConnected(true);
              
              // Get chain ID
              const chainId = await window.ethereum.request({ method: 'eth_chainId' });
              walletState.chainId = chainId;

              // Get balance
              const balance = await web3.eth.getBalance(accounts[0]);
              walletState.balance = web3.utils.fromWei(balance, 'ether');

              // Fetch DeFi data
              await fetchDefiData();

              return true;
            }
            return false;
          } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            showError(error.message || 'Error connecting to MetaMask');
            return false;
          } finally {
            walletState.isLoading = false;
            updateWalletUI();
          }
        }

        // Handle Solana wallet connection
        async function connectSolana() {
          if (!window.solana) {
            showError('Phantom wallet is not installed');
            return false;
          }

          try {
            walletState.isLoading = true;
            updateWalletUI();

            const { publicKey } = await window.solana.connect();
            if (publicKey) {
              walletState.setWalletAddress(publicKey.toString());
              walletState.setIsConnected(true);
              
              // Fetch DeFi data
              await fetchDefiData();
              
              return true;
            }
            return false;
          } catch (error) {
            console.error('Error connecting to Solana wallet:', error);
            showError(error.message || 'Error connecting to Phantom');
            return false;
          } finally {
            walletState.isLoading = false;
            updateWalletUI();
          }
        }

        // Initialize wallet functionality
        async function initializeWallet() {
          try {
            // Check for existing connections
            if (window.ethereum) {
              const initialized = await initializeWeb3();
              if (initialized) {
                const accounts = await web3.eth.getAccounts();
                if (accounts && accounts.length > 0) {
                  walletState.setWalletAddress(accounts[0]);
                  walletState.setIsConnected(true);
                  await fetchDefiData();
                }
              }
            }
            
            if (window.solana?.isConnected) {
              const publicKey = await window.solana.publicKey;
              if (publicKey) {
                walletState.setWalletAddress(publicKey.toString());
                walletState.setIsConnected(true);
                await fetchDefiData();
              }
            }
          } catch (error) {
            console.error('Error initializing wallet:', error);
          }
        }

        // Attach event listeners to the connect wallet button
        const button = document.getElementById('connect-wallet-button');
        if (button) {
          button.addEventListener('click', async () => {
            if (walletState.isConnected) {
              await walletState.disconnect();
            } else {
              // Try MetaMask first, then Solana
              const metaMaskConnected = await connectMetaMask();
              if (!metaMaskConnected) {
                await connectSolana();
              }
            }
          });
        }

        // Initialize wallet state
        initializeWallet();
      });
    </script>
  `;
};

export const generateExportedHTML = (id, styles, content) => {
  return `
    <div class="wallet-connect-container">
      <button 
        id="connect-wallet-button" 
        style="${Object.entries(styles).map(([key, value]) => `${key}: ${value}`).join(';')}"
      >
        ${content || 'Connect Wallet'}
      </button>
      <div id="wallet-address" style="
        font-family: monospace;
        font-size: 13px;
        margin-top: 8px;
        color: #1f2937;
        display: none;
      "></div>
      <div id="wallet-error" style="
        color: #ef4444;
        font-size: 12px;
        margin-top: 4px;
        display: none;
      "></div>

      <!-- DeFi Dashboard -->
      <div class="defi-dashboard" style="
        margin-top: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      ">
        <!-- Aggregator Module -->
        <div class="defi-module aggregator-module" style="
          background-color: rgb(42, 42, 60);
          padding: 1.5rem;
          border-radius: 12px;
          color: white;
        ">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">DeFi Aggregator</h3>
          <div class="defi-stats">
            <div class="defi-stat">
              <span class="defi-aggregator-stat" data-label="Connected Wallet">Not Connected</span>
            </div>
            <div class="defi-stat">
              <span>Total Pools:</span>
              <span class="defi-aggregator-stat" data-label="Total Pools">Loading...</span>
            </div>
            <div class="defi-stat">
              <span>Total Value Locked:</span>
              <span class="defi-aggregator-stat" data-label="Total Value Locked">$0</span>
            </div>
            <div class="defi-stat">
              <span>Best APY:</span>
              <span class="defi-aggregator-stat" data-label="Best APY">Not Connected</span>
            </div>
            <div class="defi-stat">
              <span>Your Staked Amount:</span>
              <span class="defi-aggregator-stat" data-label="Your Staked Amount">$0</span>
            </div>
            <div class="defi-stat">
              <span>Your Earnings:</span>
              <span class="defi-aggregator-stat" data-label="Your Earnings">$0</span>
            </div>
          </div>
        </div>

        <!-- Simulation Module -->
        <div class="defi-module simulation-module" style="
          background-color: rgb(42, 42, 60);
          padding: 1.5rem;
          border-radius: 12px;
          color: white;
        ">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">Investment Simulator</h3>
          <div class="defi-stats">
            <div class="defi-stat">
              <span>Portfolio Value:</span>
              <span class="defi-simulation-stat" data-label="Portfolio Value">$0</span>
            </div>
            <div class="defi-stat">
              <span>24h Change:</span>
              <span class="defi-simulation-stat" data-label="24h Change">0%</span>
            </div>
            <div class="defi-stat">
              <span>7d Change:</span>
              <span class="defi-simulation-stat" data-label="7d Change">0%</span>
            </div>
            <div class="defi-stat">
              <span>30d Change:</span>
              <span class="defi-simulation-stat" data-label="30d Change">0%</span>
            </div>
            <div class="defi-stat">
              <span>Supported Assets:</span>
              <span class="defi-simulation-stat" data-label="Supported Assets">20+</span>
            </div>
            <div class="defi-stat">
              <span>Historical Data:</span>
              <span class="defi-simulation-stat" data-label="Historical Data">5 Years</span>
            </div>
          </div>
        </div>

        <!-- Bridge Module -->
        <div class="defi-module bridge-module" style="
          background-color: rgb(42, 42, 60);
          padding: 1.5rem;
          border-radius: 12px;
          color: white;
        ">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">Cross-Chain Bridge</h3>
          <div class="defi-stats">
            <div class="defi-stat">
              <span>Supported Chains:</span>
              <span class="defi-bridge-stat" data-label="Supported Chains">Select Chain</span>
            </div>
            <div class="defi-stat">
              <span>Transfer Time:</span>
              <span class="defi-bridge-stat" data-label="Transfer Time">Select Chain</span>
            </div>
            <div class="defi-stat">
              <span>Security Score:</span>
              <span class="defi-bridge-stat" data-label="Security Score">0.1%</span>
            </div>
          </div>
        </div>
      </div>

      <style>
        .defi-stats {
          display: grid;
          gap: 1rem;
        }
        .defi-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .defi-stat span:first-child {
          opacity: 0.8;
        }
        .defi-stat span:last-child {
          font-weight: bold;
        }
        .defi-module {
          transition: all 0.3s ease;
        }
        .defi-module:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        @media (max-width: 768px) {
          .defi-dashboard {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </div>
  `;
};

export default ConnectWalletButton;
