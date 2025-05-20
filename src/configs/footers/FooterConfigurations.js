export const FooterConfigurations = {
  simpleFooter: {
    type: 'footer',
    styles: {
      width: '100%',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '1rem',
      marginTop: 'auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      borderTop: '1px solid #333',
      gap: '2rem'
    },
    children: [
      {
        type: 'div',
        styles: {
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          padding: '10px',
          margin: '10px 0',
          position: 'relative'
        },
        children: [
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/facebook.svg',
            alt: 'Editable icon'
          },
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/twitter.svg',
            alt: 'Editable icon'
          },
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/linkedin.svg',
            alt: 'Editable icon'
          }
        ]
      },
      {
        type: 'span',
        content: '© 2024 Your Company. All rights reserved.',
        styles: {
          fontSize: '0.875rem',
          color: '#ffffff',
          textAlign: 'center',
          margin: '0',
          padding: '0',
          lineHeight: '1.5',
          cursor: 'text',
          border: 'none',
          outline: 'none',
          display: 'inline-block'
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    children: [
      {
        type: 'icon',
        styles: { width: '48px', height: '48px' },
        src: '/logo192.png'
      },
      {
        type: 'div',
        styles: {
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        },
        children: [
          { 
            type: 'linkblock', 
            content: 'Home', 
            styles: { fontSize: '1.1rem', color: '#fff', textDecoration: 'none' }, 
            href: '/' 
          },
          { 
            type: 'linkblock', 
            content: 'About', 
            styles: { fontSize: '1.1rem', color: '#fff', textDecoration: 'none' }, 
            href: '/about' 
          },
          { 
            type: 'linkblock', 
            content: 'Services', 
            styles: { fontSize: '1.1rem', color: '#fff', textDecoration: 'none' }, 
            href: '/services' 
      },
      {
            type: 'linkblock', 
            content: 'Contact', 
            styles: { fontSize: '1.1rem', color: '#fff', textDecoration: 'none' }, 
            href: '/contact' 
          }
        ]
      },
      {
        type: 'div',
        styles: {
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center'
        },
        children: [
          { 
            type: 'icon', 
            styles: { width: '28px', height: '28px' }, 
            src: '/icons/facebook.svg' 
          },
          { 
            type: 'icon', 
            styles: { width: '28px', height: '28px' }, 
            src: '/icons/twitter.svg' 
          },
          { 
            type: 'icon', 
            styles: { width: '28px', height: '28px' }, 
            src: '/icons/linkedin.svg' 
          }
        ]
      }
    ]
  },
  advancedFooter: {
    type: 'footer',
    styles: {
      width: '100%',
      backgroundColor: '#2D3748',
      color: '#ffffff',
      padding: '1rem',
      marginTop: 'auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      borderTop: '1px solid #4A5568',
      gap: '2rem'
    },
    children: [
      {
        type: 'heading',
        content: 'Advanced Solutions',
        styles: {
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '1rem',
          textAlign: 'center',
          lineHeight: '1.5',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          cursor: 'text',
          border: 'none',
          outline: 'none'
        }
      },
      {
        type: 'paragraph',
        content: 'Innovative solutions for modern businesses',
        styles: {
          fontSize: '1rem',
          color: '#a0a0a0',
          textAlign: 'center',
          margin: '0 0 2rem',
          padding: '0',
          lineHeight: '1.5',
          maxWidth: '600px',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          cursor: 'text',
          border: 'none',
          outline: 'none'
        }
      },
      {
        type: 'div',
        styles: {
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          padding: '10px',
          margin: '10px 0',
          position: 'relative'
        },
        children: [
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/facebook.svg',
            alt: 'Editable icon'
          },
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/twitter.svg',
            alt: 'Editable icon'
          },
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/linkedin.svg',
            alt: 'Editable icon'
          }
        ]
      },
      {
        type: 'span',
        content: '© 2024 Advanced Solutions. All rights reserved.',
        styles: {
          fontSize: '0.875rem',
          color: '#ffffff',
          textAlign: 'center',
          margin: '0',
          padding: '0',
          lineHeight: '1.5',
          cursor: 'text',
          border: 'none',
          outline: 'none',
          display: 'inline-block'
        }
      }
    ]
  },
  defiFooter: {
    type: 'footer',
    styles: {
      width: '100%',
      backgroundColor: '#1A1A1A',
      color: '#ffffff',
      padding: '1rem',
      marginTop: 'auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      borderTop: '1px solid #333',
      gap: '2rem'
    },
    children: [
      {
        type: 'heading',
        content: 'DeFi Solutions',
        styles: {
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '1rem',
          textAlign: 'center',
          lineHeight: '1.5',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          cursor: 'text',
          border: 'none',
          outline: 'none'
        }
      },
      {
        type: 'paragraph',
        content: 'Decentralized finance for the future',
        styles: {
          fontSize: '1rem',
          color: '#a0a0a0',
          textAlign: 'center',
          margin: '0 0 2rem',
          padding: '0',
          lineHeight: '1.5',
          maxWidth: '600px',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          cursor: 'text',
          border: 'none',
          outline: 'none'
        }
      },
      {
        type: 'button',
        content: 'Connect Wallet',
        styles: {
          backgroundColor: '#4D70FF',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          fontWeight: '500',
          outline: 'none'
        }
      },
      {
        type: 'div',
        styles: {
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          padding: '10px',
          margin: '10px 0',
          position: 'relative'
        },
        children: [
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/facebook.svg',
            alt: 'Editable icon'
          },
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/twitter.svg',
            alt: 'Editable icon'
          },
          { 
            type: 'icon', 
            styles: { 
              width: '28px', 
              height: '28px', 
              objectFit: 'contain',
              maxWidth: '40px',
              maxHeight: '40px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              display: 'inline-flex'
            }, 
            src: '/icons/linkedin.svg',
            alt: 'Editable icon'
          }
        ]
      },
      {
        type: 'span',
        content: '© 2024 DeFi Project. All rights reserved.',
        styles: {
          fontSize: '0.875rem',
          color: '#ffffff',
          textAlign: 'center',
          margin: '0',
          padding: '0',
          lineHeight: '1.5',
          cursor: 'text',
          border: 'none',
          outline: 'none',
          display: 'inline-block'
        }
      }
    ]
  }
};