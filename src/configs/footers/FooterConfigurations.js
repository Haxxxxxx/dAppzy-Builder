export const FooterConfigurations = {
  customTemplate: {
    children: [
      { type: 'span', content: 'Simple Footer - © 2024 My Company' },
      { type: 'button', content: 'Subscribe' },
    ],
  },
  detailedFooter: {
    children: [
      { type: 'span', content: 'Company Name, Address Line 1, Address Line 2' },
      { type: 'button', content: 'Contact Us' },
      { type: 'span', content: 'Privacy Policy' },
      { type: 'span', content: 'Terms of Service' },
      { type: 'span', content: 'Support' },
      { type: 'span', content: 'Follow us: [Social Links]' },
    ],
  },
  templateFooter: {
    type: 'footer',
    children: [
      { type: 'span', content: 'Eleven', styles: { fontSize: '1rem', color: '#E5E7EB' } },
      { type: 'span', content: 'Twelve', styles: { fontSize: '1rem', color: '#E5E7EB' } },
      { type: 'span', content: 'Thirteen', styles: { fontSize: '1rem', color: '#E5E7EB' } },
      { type: 'span', content: '3S Template', styles: { fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff' } },
      { type: 'span', content: 'CompanyName © 202X. All rights reserved.', styles: { fontSize: '0.9rem', color: '#9CA3AF' } },
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7', styles: { width: '40px', height: '40px' } },
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7', styles: { width: '40px', height: '40px' } },
    ],
  },
  defiFooter: {
    children: [
      { type: 'image', content: './img/defi-logo.png', styles: { width: '32px', height: '32px', borderRadius: '8px' } },
      { type: 'span', content: '© 2024 DeFi Project', styles: { color: '#ffffff' } },
      { type: 'link', content: 'Whitepaper', styles: { color: '#ffffff', textDecoration: 'none' } },
      { type: 'link', content: 'Audit', styles: { color: '#ffffff', textDecoration: 'none' } },
      { type: 'link', content: 'Governance', styles: { color: '#ffffff', textDecoration: 'none' } },
      { type: 'link', content: 'Docs', styles: { color: '#ffffff', textDecoration: 'none' } },
      { type: 'link', content: 'Connect Wallet', styles: { color: '#ffffff', textDecoration: 'none' } }
    ],
  }
};