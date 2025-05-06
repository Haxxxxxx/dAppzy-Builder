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
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
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
        type: 'image',
        content: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg',
        styles: {
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          transition: 'opacity 0.3s',
          ':hover': {
            opacity: 0.7
          }
        },
        link: 'https://twitter.com/yourprofile'
      },
      {
        type: 'image',
        content: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg',
        styles: {
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          transition: 'opacity 0.3s',
          ':hover': {
            opacity: 0.7
          }
        },
        link: 'https://github.com/yourrepo'
      }
    ]
  }
}; 