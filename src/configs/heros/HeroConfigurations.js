export const HeroConfiguration = {
    
    heroOne: {
    type: 'hero',
    children: [
      { type: 'image', content: 'https://via.placeholder.com/1200x600?text=Background' },
      { type: 'heading', content: 'Welcome to Our Website' },
      { type: 'paragraph', content: 'Building a better future together.' },
      { type: 'button', content: 'Get Started' },
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
      { type: 'image', content: 'https://via.placeholder.com/600x400?text=Hero+Image'},
    ],
  },}