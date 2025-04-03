export const Web3Configs = {
    mintingSection: {
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