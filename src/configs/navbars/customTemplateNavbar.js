export const customTemplateNavbar = {
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
    ],
  };
  