export const Web3Configs = {
    mintingSection: {
        children: [
          { type: 'image', content: 'https://via.placeholder.com/150?text=Logo' }, // Logo
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
          { type: 'rare-item', content: 'https://via.placeholder.com/80?text=Rare+Item' }, // Rare Items
          { type: 'rare-item', content: 'https://via.placeholder.com/80?text=Rare+Item' },
          { type: 'rare-item', content: 'https://via.placeholder.com/80?text=Rare+Item' },
          { type: 'rare-item', content: 'https://via.placeholder.com/80?text=Rare+Item' },
          { type: 'document-item', content: 'https://via.placeholder.com/80?text=Document+Item' }, // Document Items
          { type: 'document-item', content: 'https://via.placeholder.com/80?text=Document+Item' },
          { type: 'document-item', content: 'https://via.placeholder.com/80?text=Document+Item' },
        ],
      },
      connectWalletButton: {
        content: 'Connect Wallet', // Default button text
        settings: {
          wallets: [
            { name: 'Phantom', enabled: true },
            { name: 'MetaMask', enabled: true },
            { name: 'Freighter', enabled: true },
          ],
        },
      },
}