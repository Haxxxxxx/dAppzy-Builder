export const structureConfigurations = {
  customTemplate: {
    children: [
      { type: 'image', content: 'https://via.placeholder.com/150?text=Logo' },
      { type: 'span', content: '3S.Template' },
      { type: 'span', content: 'Link 1' },
      { type: 'span', content: 'Link 2' },
      { type: 'span', content: 'Link 3' },
      { type: 'span', content: 'Link 4' },
      { type: 'button', content: 'Button Text' },
      { type: 'button', content: 'Button Text' },
    ],
  },
  twoColumn: {
    children: [
      { type: 'image', content: 'https://via.placeholder.com/150?text=Logo' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'About' },
      { type: 'span', content: 'Contact' },
    ],
  },
  threeColumn: {
    children: [
      { type: 'image', content: 'https://via.placeholder.com/150?text=Logo' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'Services' },
      { type: 'span', content: 'Contact' },
      { type: 'button', content: 'Call to Action' },
    ],
  },
  heroOne: {
    type: 'hero',
    children: [
      { type: 'image', content: 'https://via.placeholder.com/1200x600?text=Background' },
      { type: 'span', content: 'Welcome to Our Website' },
      { type: 'span', content: 'Building a better future together.' },
      { type: 'button', content: 'Get Started' },
    ],
  },
  heroTwo: {
    type: 'hero',
    children: [
      { type: 'span', content: 'Discover Your Potential' },
      { type: 'span', content: 'Join us today and start making an impact.' },
      { type: 'button', content: 'Join Now' },
    ],
  },
  heroThree: {
    type: 'hero',
    children: [
      { type: 'span', content: 'CAPTION' },
      { type: 'span', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { type: 'span', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit.' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
      { type: 'image', content: 'https://via.placeholder.com/150?text=Image' },
    ],
  },
  ctaOne: {
    children: [
      { type: 'span', content: 'Get Started Today!' },
      { type: 'span', content: 'Sign up now and take the first step towards a better future.' },
      { type: 'button', content: 'Join Now' },
    ],
  },
  ctaTwo: {
    children: [
      { type: 'span', content: 'Take Action Now!' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
    ],
  },
  simple: {
    children: [
      { type: 'span', content: 'Simple Footer - © 2024 My Company' },
      { type: 'button', content: 'Subscribe' },
    ],
  },
  detailed: {
    children: [
      { type: 'span', content: 'Company Name, Address Line 1, Address Line 2' },
      { type: 'button', content: 'Contact Us' },
      { type: 'span', content: 'Privacy Policy' },
      { type: 'span', content: 'Terms of Service' },
      { type: 'span', content: 'Support' },
      { type: 'span', content: 'Follow us: [Social Links]' },
    ],
  },
  template: {
    children: [
      { type: 'span', content: 'Eleven' },
      { type: 'span', content: 'Twelve' },
      { type: 'span', content: 'Thirteen' },
      { type: 'image', content: 'https://via.placeholder.com/40' },
      { type: 'span', content: '3S Template' },
      { type: 'image', content: 'https://via.placeholder.com/24?text=YouTube' },
      { type: 'image', content: 'https://via.placeholder.com/24?text=Facebook'},
      { type: 'image', content: 'https://via.placeholder.com/24?text=Twitter'},
      { type: 'image', content: 'https://via.placeholder.com/24?text=Instagram'  },
      { type: 'image', content: 'https://via.placeholder.com/24?text=LinkedIn'},
      { type: 'span', content: 'CompanyName @ 202X. All rights reserved.'},
    ],
  },
  mintingSection: {
    children: [
      { type: 'image', content: 'https://via.placeholder.com/150?text=Logo' }, // Logo
      { type: 'title', content: 'Mint {Collection Name}', label:'title' }, // Title
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
  };
  
