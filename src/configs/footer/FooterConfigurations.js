export const FooterConfigurations = {
  // ... existing code ...
  defiFooter: {
    styles: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
      borderTop: '1px solid #333',
      width: '100%',
      position: 'relative',
      bottom: 0,
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
          color: '#fff', 
          fontWeight: '500', 
          fontSize: '1rem' 
        } 
      },
      { 
        type: 'link',
        href: '/terms',
        content: 'Terms of Service',
        styles: {
          color: '#bbb',
          textDecoration: 'none',
          fontSize: '0.9rem',
          ':hover': {
            color: '#fff'
          }
        }
      },
      { 
        type: 'link',
        href: '/privacy',
        content: 'Privacy Policy',
        styles: {
          color: '#bbb',
          textDecoration: 'none',
          fontSize: '0.9rem',
          ':hover': {
            color: '#fff'
          }
        }
      },
      { 
        type: 'link',
        href: 'https://twitter.com',
        content: '𝕏',
        styles: {
          color: '#bbb',
          textDecoration: 'none',
          fontSize: '1.2rem',
          ':hover': {
            color: '#fff'
          }
        }
      },
      { 
        type: 'link',
        href: 'https://discord.com',
        content: 'Discord',
        styles: {
          color: '#bbb',
          textDecoration: 'none',
          fontSize: '1.2rem',
          ':hover': {
            color: '#fff'
          }
        }
      },
      { 
        type: 'link',
        href: 'https://github.com',
        content: 'GitHub',
        styles: {
          color: '#bbb',
          textDecoration: 'none',
          fontSize: '1.2rem',
          ':hover': {
            color: '#fff'
          }
        }
      }
    ]
  }
}; 