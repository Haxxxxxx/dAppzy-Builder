export const HeroConfiguration = {
    
    heroOne: {
    type: 'hero',
    children: [
      { 
        type: 'image', 
        content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
        styles: {
          maxWidth: '100%',
          height: '400px',
          backgroundColor: '#334155',
          objectFit: 'cover',
          borderRadius: '8px'
        }
      },
      { 
        type: 'heading', 
        content: 'Welcome to Our Website',
        styles: {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '16px'
        }
      },
      { 
        type: 'paragraph', 
        content: 'Building a better future together.',
        styles: {
          fontSize: '1rem',
          lineHeight: '1.5',
          marginBottom: '24px'
        }
      },
      { 
        type: 'button', 
        content: 'Get Started',
        styles: {
          backgroundColor: '#334155',
          color: '#ffffff',
          padding: '12px 24px',
          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          fontSize: '1rem'
        }
      },
    ],
  },
  heroTwo: {
    type: 'hero',
    children: [
      { type: 'heading', content: 'Discover Your Potential' },
      { type: 'paragraph', content: 'Join us today and start making an impact.' },
      { type: 'button', content: 'Join Now' },
    ],
  },
  heroThree: {
    type: 'hero',
    children: [
      { type: 'span', content: 'CAPTION'},
      { type: 'heading', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit.' },
      { type: 'button', content: 'Primary Action'},
      { type: 'button', content: 'Secondary Action'},
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7'},
    ],
  },}