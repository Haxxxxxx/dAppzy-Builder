export const FooterConfigurations = {
  simpleFooter: {
    type: 'footer',
    styles: {
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    children: [
      {
        type: 'heading',
        content: 'Subscribe to our newsletter',
        styles: {
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }
      },
      {
        type: 'button',
        content: 'Subscribe',
        styles: {
          backgroundColor: '#4D70FF',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500'
        }
      }
    ]
  },
  detailedFooter: {
    type: 'footer',
    styles: {
      backgroundColor: '#1F2937',
      color: '#ffffff',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    children: [
      {
        type: 'heading',
        content: 'Company Name',
        styles: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }
      },
      {
        type: 'paragraph',
        content: 'Your trusted partner in digital solutions',
        styles: {
          fontSize: '1.1rem',
          textAlign: 'center',
          maxWidth: '600px',
          marginBottom: '2rem'
        }
      },
      {
        type: 'span',
        content: '© 2024 Company Name. All rights reserved.',
        styles: {
          fontSize: '0.9rem',
          textAlign: 'center'
        }
      }
    ]
  },
  advancedFooter: {
    type: 'footer',
    styles: {
      backgroundColor: '#2D3748',
      color: '#ffffff',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    children: [
      {
        type: 'heading',
        content: 'Advanced Solutions',
        styles: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }
      },
      {
        type: 'paragraph',
        content: 'Innovative solutions for modern businesses',
        styles: {
          fontSize: '1.1rem',
          textAlign: 'center',
          maxWidth: '600px',
          marginBottom: '2rem'
        }
      },
      {
        type: 'span',
        content: '© 2024 Advanced Solutions. All rights reserved.',
        styles: {
          fontSize: '0.9rem',
          textAlign: 'center'
        }
      }
    ]
  },
  defiFooter: {
    type: 'footer',
    styles: {
      backgroundColor: '#1A1A1A',
      color: '#ffffff',
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    children: [
      {
        type: 'heading',
        content: 'DeFi Solutions',
        styles: {
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }
      },
      {
        type: 'paragraph',
        content: 'Decentralized finance for the future',
        styles: {
          fontSize: '1.1rem',
          textAlign: 'center',
          maxWidth: '600px',
          marginBottom: '2rem'
        }
      },
      {
        type: 'button',
        content: 'Connect Wallet',
        styles: {
          backgroundColor: '#4D70FF',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500'
        }
      }
    ]
  }
};