export const FooterConfigurations = {
  // ... existing code ...
  defiFooter: {
    type: 'footer',
    styles: {
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      borderTop: '1px solid #e5e5e5',
      width: '100%',
      boxSizing: 'border-box'
    },
    children: [
      {
        type: 'div',
        styles: { display: 'flex', alignItems: 'center', gap: '12px' },
    children: [
      {
        type: 'image',
        styles: {
          width: '32px',
          height: '32px',
          objectFit: 'cover',
              borderRadius: '8px'
        }
      },
      { 
        type: 'span', 
        styles: { 
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: '400'
            }
          }
        ]
      },
      {
        type: 'div',
        styles: { display: 'flex', gap: '24px' },
        children: [
          {
            type: 'link',
            styles: { 
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '400',
              display: 'inline-block',
              '&:hover': { color: '#5C4EFA' }
        } 
      },
      {
            type: 'link',
            styles: {
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '400',
              display: 'inline-block',
              '&:hover': { color: '#5C4EFA' }
            }
          },
          {
            type: 'link',
        styles: {
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '400',
              display: 'inline-block',
              '&:hover': { color: '#5C4EFA' }
          }
        },
          {
            type: 'link',
            styles: {
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '400',
              display: 'inline-block',
              '&:hover': { color: '#5C4EFA' }
            }
          },
          {
            type: 'link',
        styles: {
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '400',
              display: 'inline-block',
              '&:hover': { color: '#5C4EFA' }
          }
          }
        ]
      }
    ]
  }
}; 