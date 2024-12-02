export const structureConfigurations = {
  customTemplate: {
    children: [
      { type: 'image', content: 'Logo' },
      { type: 'span', content: '3S.Template' },
      { type: 'span', content: 'Link 1' },
      { type: 'span', content: 'Link 2' },
      { type: 'span', content: 'Link 3' },
      { type: 'span', content: 'Link 4' },
      { type: 'button', content: 'Button Text' },
      { type: 'button', content: 'Button Text' },
    ],
  },
  twoColumn: {
    children: [
      { type: 'image', content: 'Logo' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'About' },
      { type: 'span', content: 'Contact' },
    ],
  },
  threeColumn: {
    children: [
      { type: 'image', content: 'Logo' },
      { type: 'span', content: 'Home' },
      { type: 'span', content: 'Services' },
      { type: 'span', content: 'Contact' },
      { type: 'button', content: 'Call to Action' },
    ],
  },
  heroOne: {
    children: [
      { type: 'image', content: 'background-image-url', styles: { width: '100%', height: 'auto', position: 'absolute', top: 0, left: 0 } },
      { type: 'span', content: 'Welcome to Our Website', styles: { fontSize: '2.5rem', fontWeight: 'bold' } },
      { type: 'span', content: 'Building a better future together.', styles: { margin: '16px 0', fontSize: '1.25rem' } },
      { type: 'button', content: 'Get Started', styles: { marginTop: '24px', padding: '10px 20px', backgroundColor: '#61dafb', color: '#000', border: 'none', borderRadius: '4px' } },
    ],
  },
  heroTwo: {
    children: [
      { type: 'span', content: 'Discover Your Potential' },
      { type: 'span', content: 'Join us today and start making an impact.' },
      { type: 'button', content: 'Join Now' },
    ],
  },
  heroThree: {
    children: [
      { type: 'span', content: 'CAPTION' },
      { type: 'span', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { type: 'span', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit.' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
      { type: 'image', content: '' },
    ],
  },
  ctaOne: {
    children: [
      { type: 'span', content: 'Get Started Today!' },
      { type: 'span', content: 'Sign up now and take the first step towards a better future.' },
      { type: 'button', content: 'Join Now' },
    ],
  },
  ctaTwo: {
    children: [
      { type: 'span', content: 'Take Action Now!' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
    ],
  },
  simple: {
    children: [
      { type: 'span', content: 'Simple Footer - © 2024 My Company' },
      { type: 'button', content: 'Subscribe' },
    ],
  },
  detailed: {
    children: [
      { type: 'span', content: 'Company Name, Address Line 1, Address Line 2' },
      { type: 'button', content: 'Contact Us' },
      { type: 'span', content: 'Privacy Policy' },
      { type: 'span', content: 'Terms of Service' },
      { type: 'span', content: 'Support' },
      { type: 'span', content: 'Follow us: [Social Links]' },
    ],
  },
  template: {
    children: [
      { type: 'span', content: 'Eleven' },
      { type: 'span', content: 'Twelve' },
      { type: 'span', content: 'Thirteen' },
      { type: 'image', content: 'default-logo.png', styles: { width: '40px', height: '40px', borderRadius: '50%' } },
      { type: 'span', content: '3S Template', styles: { fontSize: '1.5rem', fontWeight: 'bold' } },
      { type: 'image', content: 'social-youtube-icon.png', styles: { width: '24px', height: '24px', social: true } },
      { type: 'image', content: 'social-facebook-icon.png', styles: { width: '24px', height: '24px', social: true } },
      { type: 'image', content: 'social-twitter-icon.png', styles: { width: '24px', height: '24px', social: true } },
      { type: 'image', content: 'social-instagram-icon.png', styles: { width: '24px', height: '24px', social: true } },
      { type: 'image', content: 'social-linkedin-icon.png', styles: { width: '24px', height: '24px', social: true } },
      { type: 'span', content: 'CompanyName @ 202X. All rights reserved.', styles: { fontSize: '0.875rem' } },
    ],
  },
  mintingSection :{
    children: [
      { type: 'image', content: 'logo-image-url' }, // Logo
      { type: 'title', content: 'Mint {Collection Name}' }, // Title
      { type: 'description', content: 'Lorem ipsum dolor sit amet...' }, // Description
      { type: 'timer', content: '17d 5h 38m 34s' }, // Timer
      { type: 'remaining', content: '1000/1000', label: 'Remaining' }, // Remaining
      { type: 'value', content: '1.5', label: 'Price' }, // Price Value
      { type: 'currency', content: 'SOL' }, // Currency
      { type: 'quantity', content: '2', label: 'Quantity' }, // Quantity Value
      { type: 'price', content: '3 SOL', label: 'Total Price' }, // Total Price
      { type: 'span', content: 'Rarest Items' }, // Rarest Items 
      { type: 'span', content: 'Document Items' }, // Document Items 
      { type: 'image', content: 'rare-item-1-image-url' }, // Rare Items
      { type: 'image', content: 'rare-item-2-image-url' },
      { type: 'image', content: 'rare-item-3-image-url' },
      { type: 'image', content: 'rare-item-4-image-url' },
      { type: 'image', content: 'document-item-1-image-url' }, // Document Items
      { type: 'image', content: 'document-item-2-image-url' },
      { type: 'image', content: 'document-item-3-image-url' },
    ],
  },
};
