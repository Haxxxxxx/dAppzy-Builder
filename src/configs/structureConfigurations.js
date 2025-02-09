export const structureConfigurations = {
  customTemplate: {
    // 1) Styles for the parent "navbar" container
    styles: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#ffffff',
      flexWrap: 'wrap',
      position: 'relative',
      borderBottom: '1px solid transparent',
      borderRadius: '4px',
    },
    // 2) Children array, each with its own styles
    children: [
      {
        type: 'image',
        content: 'https://via.placeholder.com/150?text=Logo',
        styles: {
          width: '40px',
          height: '40px',
          borderRadius: '50%',
        },
      },
      {
        type: 'span',
        content: '3S.Template',
        styles: {
          cursor: 'pointer',
        },
      },
      {
        type: 'span',
        content: 'Link 1',
        styles: {
          cursor: 'pointer',
          marginRight: '16px',
        },
      },
      {
        type: 'span',
        content: 'Link 2',
        styles: {
          cursor: 'pointer',
          marginRight: '16px',
        },
      },
      {
        type: 'span',
        content: 'Link 3',
        styles: {
          cursor: 'pointer',
          marginRight: '16px',
        },
      },
      {
        type: 'span',
        content: 'Link 4',
        styles: {
          cursor: 'pointer',
          marginRight: '16px',
        },
      },
      {
        type: 'button',
        content: 'Button Text',
        styles: {
          border: 'none',
          padding: '10px 20px',
          backgroundColor: '#334155',
          color: '#ffffff',
          cursor: 'pointer',
        },
      },
      {
        type: 'button',
        content: 'Button Text',
        styles: {
          border: 'none',
          padding: '10px 20px',
          backgroundColor: '#64748b',
          color: '#ffffff',
          cursor: 'pointer',
        },
      },
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
      { type: 'title', content: 'Welcome to Our Website' },
      { type: 'paragraph', content: 'Building a better future together.' },
      { type: 'button', content: 'Get Started' },
    ],
  },
  heroTwo: {
    type: 'hero',
    children: [
      { type: 'title', content: 'Discover Your Potential' },
      { type: 'paragraph', content: 'Join us today and start making an impact.' },
      { type: 'button', content: 'Join Now' },
    ],
  },
  heroThree: {
    type: 'hero',
    children: [
      { type: 'span', content: 'CAPTION', styles: { fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' } },
      { type: 'heading', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', styles: { fontSize: '3rem', fontWeight: 'bold', color: '#1e293b' } },
      { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit.', styles: { fontSize: '1.2rem', lineHeight: '1.6', color: '#475569' } },
      { type: 'button', content: 'Primary Action', styles: { backgroundColor: '#1e40af', color: '#ffffff', padding: '14px 28px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' } },
      { type: 'button', content: 'Secondary Action', styles: { backgroundColor: 'transparent', color: '#1e40af', padding: '12px 24px', border: '2px solid #1e40af', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' } },
      { type: 'image', content: 'https://via.placeholder.com/600x400?text=Hero+Image', styles: { width: '100%', maxWidth: '500px', height: 'auto', borderRadius: '8px' } },
    ],
  },
  ctaOne: {
    children: [
      { type: "title", content: "Get Started Today!", styles: { fontSize: "2.5rem", fontWeight: "bold", color: "#1F2937" } },
      { type: "paragraph", content: "Sign up now and take the first step towards a better future.", styles: { fontSize: "1.2rem", color: "#4B5563" } },
      { type: "button", content: "Join Now", styles: { backgroundColor: "#1a1aff", color: "#ffffff", fontSize: "1rem", borderRadius: "8px" } },
      { type: "button", content: "Learn More", styles: { backgroundColor: "transparent", color: "#1a1aff", border: "2px solid #1a1aff", fontSize: "1rem", borderRadius: "8px" } },
      { type: "image", content: "https://via.placeholder.com/300x200?text=CTA+Image", styles: { maxWidth: "300px", borderRadius: "8px" } },
    ],
  },
  
  ctaTwo: {
    children: [
      { type: 'title', content: 'Take Action Now!' },
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
    type: 'footer',
    children: [
      { type: 'span', content: 'Eleven', styles: { fontSize: '1rem', color: '#E5E7EB' } },
      { type: 'span', content: 'Twelve', styles: { fontSize: '1rem', color: '#E5E7EB' } },
      { type: 'span', content: 'Thirteen', styles: { fontSize: '1rem', color: '#E5E7EB' } },
      { type: 'span', content: '3S Template', styles: { fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff' } },
      { type: 'span', content: 'CompanyName © 202X. All rights reserved.', styles: { fontSize: '0.9rem', color: '#9CA3AF' } },
      { type: 'image', content: 'https://via.placeholder.com/24?text=YouTube', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://via.placeholder.com/24?text=Facebook', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://via.placeholder.com/24?text=Twitter', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://via.placeholder.com/24?text=Instagram', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://via.placeholder.com/24?text=LinkedIn', styles: { width: '40px', height: '40px' } },
    ],
  },
  

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
};

