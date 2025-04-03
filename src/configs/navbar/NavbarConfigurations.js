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
      borderBottom: '1px solid transparent',
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
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'Services' },
      { type: 'span', content: 'Contact' },
      { type: 'button', content: 'Call to Action' },
    ],
  },
};
