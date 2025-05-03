export const Web3Configs = {
    mintingSection: {
        id: 'minting-section',
        type: 'mintingSection',
        children: [
          { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' }, // Logo
          { type: 'title', content: 'Mint {Collection Name}', label: 'title' }, // Title
          { type: 'description', content: 'Lorem ipsum dolor sit amet...' }, // Description
          { type: 'timer', label: 'Time before minting', content: '17d 5h 38m 34s' }, // Timer
          { type: 'remaining', label: 'Remaining', content: '1000/1000' }, // Remaining
          { type: 'value', label: 'Price', content: '1.5' }, // Price Value
          { type: 'currency', content: 'SOL' }, // Currency
          { type: 'quantity', label: 'Quantity', content: '2' }, // Quantity Value
          { type: 'price', label: 'Total Price', content: '3 SOL' }, // Total Price
          { type: 'button', content: 'Mint', label: 'mintButton' }, // Mint Button
          { type: 'rareItemsTitle', content: 'Rarest Items' }, // Rarest Items
          { type: 'docItemsTitle', content: 'Document Items' }, // Document Items
          { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' }, // Rare Items
          { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'rare-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'document-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' }, // Document Items
          { type: 'document-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'document-item', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
        ],
      },
    defiSection: {
        id: 'defi-dashboard',
        type: 'defiSection',
        children: [
          { 
            type: 'image', 
            content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7', 
            label: 'logo' 
          },
          { 
            type: 'title', 
            content: 'DeFi Dashboard', 
            label: 'title' 
          },
          { 
            type: 'description', 
            content: 'Swap, stake, and lend your assets with ease' 
          },
          { 
            type: 'defiModule',
            moduleType: 'swap',
            title: 'Token Swap',
            stats: [
              { label: '24h Volume', value: '$1.2M' },
              { label: 'Available Pairs', value: '24' },
              { label: 'Swap Fee', value: '0.3%' }
            ],
            enabled: true
          },
          { 
            type: 'defiModule',
            moduleType: 'stake',
            title: 'Staking',
            stats: [
              { label: 'Total Value Locked', value: '$890K' },
              { label: 'APY', value: '12.5%' },
              { label: 'Lock Period', value: '30 days' }
            ],
            enabled: true
          },
          { 
            type: 'defiModule',
            moduleType: 'lend',
            title: 'Lending',
            stats: [
              { label: 'Total Supplied', value: '$450K' },
              { label: 'Borrow APR', value: '3.2%' },
              { label: 'Utilization', value: '65%' }
            ],
            enabled: true
          }
        ],
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
    }
}