export const NavbarConfigurations = {
  customTemplate: {
    styles: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#ffffff',
      flexWrap: 'wrap',
      position: 'relative',
      borderRadius: '4px',
    },
    children: [
      {
        type: 'image',
        content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
        styles: {
          width: '40px',
          height: '40px',
          borderRadius: '50%',
        },
      },
      {
        type: 'span',
        content: '3S.Template',
        styles: { cursor: 'pointer' },
      },
      {
        type: 'span',
        content: 'Link 1',
        styles: { cursor: 'pointer', marginRight: '16px' },
      },
      {
        type: 'span',
        content: 'Link 2',
        styles: { cursor: 'pointer', marginRight: '16px' },
      },
      {
        type: 'span',
        content: 'Link 3',
        styles: { cursor: 'pointer', marginRight: '16px' },
      },
      {
        type: 'span',
        content: 'Link 4',
        styles: { cursor: 'pointer', marginRight: '16px' },
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
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'About' },
      { type: 'span', content: 'Contact' },
    ],
  },
  threeColumn: {
    children: [
      { 
        type: 'image', 
        content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
        styles: {
          width: '40px',
          height: '40px',
          borderRadius: '50%'
        }
      },
      { 
        type: 'span', 
        content: 'Home',
        styles: {
          color: '#1a1a1a',
          cursor: 'pointer'
        }
      },
      { 
        type: 'span', 
        content: 'Services',
        styles: {
          color: '#1a1a1a',
          cursor: 'pointer'
        }
      },
      { 
        type: 'span', 
        content: 'Contact',
        styles: {
          color: '#1a1a1a',
          cursor: 'pointer'
        }
      },
      { 
        type: 'button', 
        content: 'Call to Action',
        styles: {
          border: 'none',
          padding: '10px 20px',
          backgroundColor: '#334155',
          color: '#ffffff',
          cursor: 'pointer'
        }
      }
    ],
  },
  defiNavbar: {
    styles: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    },
    children: [
      {
        type: 'image',
        content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
        styles: {
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          objectFit: 'cover',
        }
      },
      { 
        type: 'span', 
        content: 'DeFi Dashboard', 
        styles: { 
          color: '#1a1a1a', 
          fontWeight: 'bold', 
          fontSize: '1.2rem',
          marginLeft: '12px'
        } 
      },
      {
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
          marginLeft: 'auto',
          ':hover': {
            backgroundColor: '#475569'
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
    ]
  }
};
