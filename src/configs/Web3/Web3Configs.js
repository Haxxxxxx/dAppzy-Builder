export const Web3Configs = {
    mintingSection: {
        id: 'minting-section',
        type: 'mintingSection',
        styles: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px',
            margin: '0',
            backgroundColor: 'rgba(42, 42, 60, 0.5)',
            outline: '2px solid var(--purple, #5C4EFA)',
            borderInline: '0.5px solid var(--purple, #5C4EFA)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
        },
        children: [
          { 
            type: 'mintingModule',
            moduleType: 'minting',
            styles: {
                position: 'relative',
                boxSizing: 'border-box',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: 'rgba(42, 42, 60, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
            },
            content: {
              title: 'Mint {Collection Name}',
              description: 'Lorem ipsum dolor sit amet...',
              stats: [
                { label: 'Total Supply', value: '10,000' },
                { label: 'Minted', value: '0' },
                { label: 'Price', value: '1.5 SOL' },
                { label: 'Time Left', value: '24:00:00' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              }
            }
          },
          { 
            type: 'mintingModule',
            moduleType: 'gallery',
            styles: {
                position: 'relative',
                boxSizing: 'border-box',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: 'rgba(42, 42, 60, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
            },
            content: {
              title: 'Rarest Items',
              items: [
                { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
                { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
                { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
                { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' }
              ],
              settings: {
                showTitle: true,
                showDescription: true,
                customColor: '#2A2A3C'
              }
            }
          },
          { 
            type: 'mintingModule',
            moduleType: 'documents',
            styles: {
                position: 'relative',
                boxSizing: 'border-box',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: 'rgba(42, 42, 60, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
            },
            content: {
              title: 'Document Items',
              items: [
                { type: 'document-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
                { type: 'document-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
                { type: 'document-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' }
              ],
              settings: {
                showTitle: true,
                showDescription: true,
                customColor: '#2A2A3C'
              }
            }
          }
        ]
    },
    defiSection: {
        id: 'defi-dashboard',
        type: 'defiSection',
        styles: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px',
            margin: '0',
            backgroundColor: 'rgba(42, 42, 60, 0.5)',
            outline: '2px solid var(--purple, #5C4EFA)',
            borderInline: '0.5px solid var(--purple, #5C4EFA)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
        },
        children: [
          { 
            type: 'defiModule',
            moduleType: 'aggregator',
            styles: {
                position: 'relative',
                boxSizing: 'border-box',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: 'rgba(42, 42, 60, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
            },
            content: {
              title: 'DeFi Aggregator',
              description: 'Access multiple DeFi protocols through a single interface',
              stats: [
                { label: 'Connected Wallet', value: 'Not Connected' },
                { label: 'Total Pools', value: 'Loading...' },
                { label: 'Total Value Locked', value: '$0' },
                { label: 'Best APY', value: 'Not Connected' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              }
            }
          },
          { 
            type: 'defiModule',
            moduleType: 'simulation',
            styles: {
                position: 'relative',
                boxSizing: 'border-box',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: 'rgba(42, 42, 60, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
            },
            content: {
              title: 'Investment Simulator',
              description: 'Simulate different investment strategies',
              stats: [
                { label: 'Investment Range', value: '$10,000' },
                { label: 'Supported Assets', value: '20+' },
                { label: 'Historical Data', value: '5 Years' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              }
            }
          },
          { 
            type: 'defiModule',
            moduleType: 'bridge',
            styles: {
                position: 'relative',
                boxSizing: 'border-box',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: 'rgba(42, 42, 60, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
            },
            content: {
              title: 'Cross-Chain Bridge',
              description: 'Transfer assets between different blockchains',
              stats: [
                { label: 'Supported Chains', value: 'Select Chain' },
                { label: 'Transfer Time', value: 'Select Chain' },
                { label: 'Security Score', value: '0.1%' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              }
            }
          }
        ]
    },
    connectWalletButton: {
        type: 'connectWalletButton',
        content: 'Connect Wallet',
        styles: {
            backgroundColor: '#334155',
            color: '#ffffff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            ':hover': {
                opacity: '0.9'
            }
        },
        settings: {
            wallets: [
                { name: 'Phantom', enabled: true, type: 'solana' },
                { name: 'Solflare', enabled: true, type: 'solana' },
                { name: 'Backpack', enabled: true, type: 'solana' },
                { name: 'Glow', enabled: true, type: 'solana' },
                { name: 'Slope', enabled: true, type: 'solana' },
                { name: 'MetaMask', enabled: true, type: 'ethereum' },
                { name: 'Freighter', enabled: true, type: 'stellar' }
            ]
        }
    },
    // RPC Configuration
    rpc: {
        // Helius RPC (Primary)
        helius: {
            endpoint: 'https://mainnet.helius-rpc.com',
            apiKey: process.env.REACT_APP_HELIUS_API_KEY || '',
            getUrl: function() {
                return this.apiKey ? `${this.endpoint}/?api-key=${this.apiKey}` : null;
            },
            // SNS-specific configuration
            snsConfig: {
                commitment: 'confirmed',
                confirmTransactionInitialTimeout: 60000,
                wsEndpoint: function() {
                    return this.apiKey ? `wss://mainnet.helius-rpc.com/?api-key=${this.apiKey}` : null;
                }
            }
        },
        // Public RPC (Fallback)
        public: {
            endpoint: 'https://api.devnet-beta.solana.com',
            getUrl: function() {
                return this.endpoint;
            }
        },
        // Get all configured RPC endpoints
        getEndpoints: function() {
            const endpoints = [];
            
            // Add Helius if configured (prioritized for SNS)
            const heliusUrl = this.helius.getUrl();
            if (heliusUrl) {
                endpoints.push(heliusUrl);
            }
            
            // Add public endpoint as fallback
            endpoints.push(this.public.getUrl());
            
            return endpoints;
        }
    },
    // SNS Configuration
    sns: {
        // SNS Program IDs
        domainProgram: '58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx',
        domainRegistry: '58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx',
        // SNS Token Program ID
        tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        // SNS-specific settings
        settings: {
            commitment: 'confirmed',
            maxRetries: 3,
            retryDelay: 1000, // 1 second
            timeout: 30000 // 30 seconds
        }
    }
}