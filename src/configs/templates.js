// Project starter templates
// Each template defines sections as config objects matching structureConfigurations format.
// buildFlatElements() converts them to the flat array format stored in Firestore.

import { generateUniqueId } from '../utils/LeftBarUtils/elementUtils';

export function buildFlatElements(sectionConfigs) {
  const elements = [];
  const existingIds = new Set();

  function buildElement(config, parentId) {
    let newId = generateUniqueId(config.type || 'element');
    while (existingIds.has(newId)) {
      newId = generateUniqueId(config.type || 'element');
    }
    existingIds.add(newId);

    const childConfigs = config.children || [];
    const childrenIds = childConfigs.map(childConfig => buildElement(childConfig, newId));

    elements.push({
      id: newId,
      type: config.type,
      configuration: config.configuration || null,
      structure: config.structure || config.configuration || null,
      styles: config.styles || {},
      content: config.content || '',
      label: config.label || '',
      parentId: parentId || null,
      settings: config.settings || {},
      children: childrenIds,
    });

    return newId;
  }

  sectionConfigs.forEach(config => buildElement(config, null));
  return elements;
}

export const TEMPLATES = [
  {
    name: 'Blank',
    description: 'Start from scratch',
    icon: 'draft',
    elements: [],
    websiteSettings: {
      siteTitle: 'Untitled Project',
      faviconUrl: '',
      description: '',
      author: '',
    },
  },
  {
    name: 'Landing Page',
    description: 'Hero + Navbar + CTA + Footer',
    icon: 'web',
    get elements() {
      return buildFlatElements([
        {
          type: 'navbar',
          configuration: 'customTemplateNavbar',
          structure: 'customTemplateNavbar',
          styles: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#ffffff',
            flexWrap: 'wrap',
            position: 'relative',
          },
          children: [
            { type: 'span', content: 'MySite', styles: { fontWeight: 'bold', fontSize: '1.2rem' } },
            { type: 'span', content: 'Home', styles: { cursor: 'pointer' } },
            { type: 'span', content: 'About', styles: { cursor: 'pointer' } },
            { type: 'span', content: 'Contact', styles: { cursor: 'pointer' } },
          ],
        },
        {
          type: 'hero',
          configuration: 'heroOne',
          structure: 'heroOne',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8fafc',
            gap: '1rem',
          },
          children: [
            { type: 'heading', content: 'Build Something Amazing', styles: { fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center' } },
            { type: 'paragraph', content: 'Create beautiful websites with our drag-and-drop builder. No coding required.', styles: { fontSize: '1.1rem', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6', color: '#4a4a4a' } },
            { type: 'button', content: 'Get Started', styles: { backgroundColor: '#5C4EFA', color: '#fff', padding: '12px 32px', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' } },
          ],
        },
        {
          type: 'section',
          configuration: 'ctaOne',
          structure: 'ctaOne',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            backgroundColor: '#ffffff',
            gap: '24px',
          },
          children: [
            { type: 'heading', content: 'Ready to start?', styles: { fontSize: '2rem', fontWeight: '700', textAlign: 'center' } },
            { type: 'paragraph', content: 'Join thousands of creators building the next generation of web experiences.', styles: { fontSize: '1rem', textAlign: 'center', color: '#4a4a4a', maxWidth: '500px' } },
            { type: 'button', content: 'Sign Up Now', styles: { backgroundColor: '#334155', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' } },
          ],
        },
        {
          type: 'footer',
          configuration: 'simpleFooter',
          structure: 'simpleFooter',
          styles: {
            width: '100%',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          children: [
            { type: 'paragraph', content: '2026 MySite. All rights reserved.', styles: { fontSize: '0.875rem', color: '#ffffff', textAlign: 'center' } },
          ],
        },
      ]);
    },
    websiteSettings: {
      siteTitle: 'My Landing Page',
      faviconUrl: '',
      description: 'A beautiful landing page',
      author: '',
    },
  },
  {
    name: 'NFT Mint Page',
    description: 'Navbar + Minting Section + Footer',
    icon: 'token',
    get elements() {
      return buildFlatElements([
        {
          type: 'navbar',
          configuration: 'customTemplateNavbar',
          structure: 'customTemplateNavbar',
          styles: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          },
          children: [
            { type: 'span', content: 'NFT Collection', styles: { fontWeight: 'bold', fontSize: '1.2rem', color: '#ffffff' } },
            { type: 'span', content: 'Mint', styles: { cursor: 'pointer', color: '#94a3b8' } },
            { type: 'span', content: 'Roadmap', styles: { cursor: 'pointer', color: '#94a3b8' } },
          ],
        },
        {
          type: 'mintingSection',
          configuration: 'mintingSection',
          structure: 'mintingSection',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '40px 20px',
            backgroundColor: '#1e293b',
            alignItems: 'center',
          },
          children: [
            { type: 'heading', content: 'Mint Your NFT', styles: { fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' } },
            { type: 'paragraph', content: 'Connect your wallet and mint from our exclusive collection.', styles: { color: '#94a3b8', textAlign: 'center', maxWidth: '500px' } },
          ],
        },
        {
          type: 'footer',
          configuration: 'simpleFooter',
          structure: 'simpleFooter',
          styles: {
            width: '100%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          children: [
            { type: 'paragraph', content: '2026 NFT Collection. All rights reserved.', styles: { fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center' } },
          ],
        },
      ]);
    },
    websiteSettings: {
      siteTitle: 'NFT Mint Page',
      faviconUrl: '',
      description: 'NFT minting page',
      author: '',
    },
  },
  {
    name: 'DeFi Dashboard',
    description: 'DeFi Navbar + DeFi Section + Footer',
    icon: 'account_balance',
    get elements() {
      return buildFlatElements([
        {
          type: 'defiNavbar',
          configuration: 'defiNavbar',
          structure: 'defiNavbar',
          styles: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
          },
          children: [
            { type: 'span', content: 'DeFi Protocol', styles: { fontWeight: 'bold', fontSize: '1.2rem', color: '#ffffff' } },
            { type: 'span', content: 'Swap', styles: { cursor: 'pointer', color: '#94a3b8' } },
            { type: 'span', content: 'Pool', styles: { cursor: 'pointer', color: '#94a3b8' } },
            { type: 'span', content: 'Stake', styles: { cursor: 'pointer', color: '#94a3b8' } },
          ],
        },
        {
          type: 'defiSection',
          configuration: 'defiSection',
          structure: 'defiSection',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '40px 20px',
            backgroundColor: '#1e293b',
            alignItems: 'center',
            gap: '24px',
          },
          children: [
            { type: 'heading', content: 'DeFi Dashboard', styles: { fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' } },
            { type: 'paragraph', content: 'Swap, stake, and manage your DeFi portfolio in one place.', styles: { color: '#94a3b8', textAlign: 'center', maxWidth: '500px' } },
          ],
        },
        {
          type: 'footer',
          configuration: 'defiFooter',
          structure: 'defiFooter',
          styles: {
            width: '100%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid #1e293b',
          },
          children: [
            { type: 'paragraph', content: '2026 DeFi Protocol. All rights reserved.', styles: { fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center' } },
          ],
        },
      ]);
    },
    websiteSettings: {
      siteTitle: 'DeFi Dashboard',
      faviconUrl: '',
      description: 'DeFi dashboard application',
      author: '',
    },
  },
];
