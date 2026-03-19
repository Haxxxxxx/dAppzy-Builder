// Project starter templates
// Each template defines sections as config objects matching structureConfigurations format.
// buildFlatElements() converts them to the flat array format stored in Firestore.

import { generateUniqueId } from '../utils/LeftBarUtils/elementUtils';
import { PLACEHOLDER_IMAGES } from './assetUrls';

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

    const el = {
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
    };
    // Preserve optional properties
    if (config.scrollAnimation) el.scrollAnimation = config.scrollAnimation;
    if (config.className) el.className = config.className;
    if (config.href) el.href = config.href;
    if (config.src) el.src = config.src;
    if (config.moduleType) el.moduleType = config.moduleType;
    elements.push(el);

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
            { type: 'anchor', content: 'Home', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: 'inherit' } },
            { type: 'anchor', content: 'About', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: 'inherit' } },
            { type: 'anchor', content: 'Contact', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: 'inherit' } },
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
          type: 'marquee',
          content: JSON.stringify({ items: ['New: AI-powered builder', 'Drag & drop simplicity', 'Deploy to IPFS in one click', 'Web3 native'], speed: 40, direction: 'left', pauseOnHover: true }),
          styles: { backgroundColor: '#5C4EFA', color: '#fff', padding: '10px 0', fontSize: '0.875rem', fontWeight: '500' },
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
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 0, once: true },
          children: [
            { type: 'heading', content: 'Ready to start?', styles: { fontSize: '2rem', fontWeight: '700', textAlign: 'center' } },
            { type: 'paragraph', content: 'Join thousands of creators building the next generation of web experiences.', styles: { fontSize: '1rem', textAlign: 'center', color: '#4a4a4a', maxWidth: '500px' } },
            { type: 'countdown', content: JSON.stringify({ targetDate: '2026-06-01T00:00:00', label: 'Early access in', showLabels: true }), styles: { display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '16px 0' } },
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
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          },
          children: [
            { type: 'socialLinks', content: JSON.stringify({ links: [{ platform: 'twitter', url: '#' }, { platform: 'github', url: '#' }, { platform: 'discord', url: '#' }] }), styles: { display: 'flex', gap: '16px', justifyContent: 'center' } },
            { type: 'paragraph', content: '2026 MySite. All rights reserved.', styles: { fontSize: '0.875rem', color: '#999', textAlign: 'center' } },
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
            { type: 'anchor', content: 'Mint', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Roadmap', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
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
            { type: 'anchor', content: 'Swap', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Pool', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Stake', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
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
  {
    name: 'Portfolio',
    description: 'Creative portfolio with project grid',
    icon: 'palette',
    get elements() {
      return buildFlatElements([
        // Navbar
        {
          type: 'navbar',
          configuration: 'customTemplateNavbar',
          structure: 'customTemplateNavbar',
          styles: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 32px',
            backgroundColor: '#ffffff',
            flexWrap: 'wrap',
            position: 'relative',
            borderBottom: '1px solid #e5e7eb',
          },
          children: [
            { type: 'span', content: 'Portfolio', styles: { fontWeight: 'bold', fontSize: '1.3rem', color: '#6366F1' } },
            { type: 'anchor', content: 'Work', href: '#work', styles: { cursor: 'pointer', textDecoration: 'none', color: '#374151', fontWeight: '500' } },
            { type: 'anchor', content: 'About', href: '#about', styles: { cursor: 'pointer', textDecoration: 'none', color: '#374151', fontWeight: '500' } },
            { type: 'anchor', content: 'Contact', href: '#contact', styles: { cursor: 'pointer', textDecoration: 'none', color: '#374151', fontWeight: '500' } },
          ],
        },
        // Hero
        {
          type: 'hero',
          configuration: 'heroOne',
          structure: 'heroOne',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            backgroundColor: '#fafafe',
            gap: '1.25rem',
          },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 0, once: true },
          children: [
            { type: 'heading', content: 'Creative Portfolio', styles: { fontSize: '3rem', fontWeight: '800', textAlign: 'center', color: '#1f2937' } },
            { type: 'paragraph', content: 'Showcasing my best work', styles: { fontSize: '1.2rem', textAlign: 'center', maxWidth: '550px', lineHeight: '1.7', color: '#6b7280' } },
            { type: 'button', content: 'View Projects', styles: { backgroundColor: '#6366F1', color: '#fff', padding: '14px 36px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' } },
          ],
        },
        // Project Grid Section
        {
          type: 'section',
          configuration: 'sectionTwo',
          structure: 'sectionTwo',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 24px',
            backgroundColor: '#ffffff',
            gap: '40px',
          },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 100, once: true },
          children: [
            { type: 'heading', content: 'Selected Work', styles: { fontSize: '2rem', fontWeight: '700', textAlign: 'center', color: '#1f2937' } },
            {
              type: 'gridLayout',
              styles: {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                width: '100%',
                maxWidth: '1100px',
                padding: '0 16px',
              },
              children: [
                {
                  type: 'div',
                  styles: {
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    backgroundColor: '#ffffff',
                  },
                  children: [
                    { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { width: '100%', height: '200px', objectFit: 'cover' } },
                    { type: 'heading', content: 'Brand Identity', styles: { fontSize: '1.15rem', fontWeight: '600', padding: '16px 16px 4px', color: '#1f2937' } },
                    { type: 'paragraph', content: 'Complete visual identity system for a tech startup including logo, color palette, and brand guidelines.', styles: { fontSize: '0.9rem', color: '#6b7280', padding: '0 16px 16px', lineHeight: '1.5' } },
                  ],
                },
                {
                  type: 'div',
                  styles: {
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    backgroundColor: '#ffffff',
                  },
                  children: [
                    { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { width: '100%', height: '200px', objectFit: 'cover' } },
                    { type: 'heading', content: 'Mobile App UI', styles: { fontSize: '1.15rem', fontWeight: '600', padding: '16px 16px 4px', color: '#1f2937' } },
                    { type: 'paragraph', content: 'End-to-end mobile app design for a fintech product with 50+ screens and a comprehensive design system.', styles: { fontSize: '0.9rem', color: '#6b7280', padding: '0 16px 16px', lineHeight: '1.5' } },
                  ],
                },
                {
                  type: 'div',
                  styles: {
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    backgroundColor: '#ffffff',
                  },
                  children: [
                    { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { width: '100%', height: '200px', objectFit: 'cover' } },
                    { type: 'heading', content: 'Web3 Dashboard', styles: { fontSize: '1.15rem', fontWeight: '600', padding: '16px 16px 4px', color: '#1f2937' } },
                    { type: 'paragraph', content: 'Data-rich dashboard interface for a DeFi protocol featuring real-time charts and portfolio analytics.', styles: { fontSize: '0.9rem', color: '#6b7280', padding: '0 16px 16px', lineHeight: '1.5' } },
                  ],
                },
              ],
            },
          ],
        },
        // Social Links
        {
          type: 'socialLinks',
          content: JSON.stringify({ links: [{ platform: 'twitter', url: '#' }, { platform: 'github', url: '#' }, { platform: 'linkedin', url: '#' }] }),
          styles: { display: 'flex', gap: '20px', justifyContent: 'center', padding: '32px 0', backgroundColor: '#fafafe' },
        },
        // Footer
        {
          type: 'footer',
          configuration: 'simpleFooter',
          structure: 'simpleFooter',
          styles: {
            width: '100%',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          },
          children: [
            { type: 'paragraph', content: '© 2026 Portfolio. All rights reserved.', styles: { fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' } },
          ],
        },
      ]);
    },
    websiteSettings: {
      siteTitle: 'My Portfolio',
      faviconUrl: '',
      description: 'Creative portfolio showcasing my best work',
      author: '',
      bodyFont: 'Poppins',
      primaryColor: '#6366F1',
    },
  },
  {
    name: 'DAO / Community',
    description: 'Web3 DAO governance page',
    icon: 'groups',
    get elements() {
      return buildFlatElements([
        // DeFi Navbar
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
            { type: 'span', content: 'OurDAO', styles: { fontWeight: 'bold', fontSize: '1.3rem', color: '#a78bfa' } },
            { type: 'anchor', content: 'Governance', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Treasury', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Community', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Docs', href: '#', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
          ],
        },
        // Hero
        {
          type: 'hero',
          configuration: 'heroThree',
          structure: 'heroThree',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '100px 20px',
            backgroundColor: '#0f172a',
            gap: '1.5rem',
          },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 0, once: true },
          children: [
            { type: 'heading', content: 'Join Our DAO', styles: { fontSize: '3.5rem', fontWeight: '800', textAlign: 'center', color: '#ffffff' } },
            { type: 'paragraph', content: 'Decentralized governance for the future', styles: { fontSize: '1.25rem', textAlign: 'center', maxWidth: '600px', lineHeight: '1.7', color: '#94a3b8' } },
            { type: 'button', content: 'Enter App', styles: { backgroundColor: '#8B5CF6', color: '#fff', padding: '14px 40px', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer' } },
          ],
        },
        // Stats Section
        {
          type: 'section',
          configuration: 'sectionSeven',
          structure: 'sectionSeven',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 24px',
            backgroundColor: '#1e293b',
            gap: '32px',
          },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 100, once: true },
          children: [
            {
              type: 'div',
              styles: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '40px',
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '1000px',
              },
              children: [
                {
                  type: 'div',
                  styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 32px', backgroundColor: '#0f172a', borderRadius: '12px', minWidth: '180px' },
                  children: [
                    { type: 'heading', content: '1,234', styles: { fontSize: '2.5rem', fontWeight: '700', color: '#a78bfa', textAlign: 'center', lineHeight: '1' } },
                    { type: 'paragraph', content: 'Members', styles: { fontSize: '1rem', color: '#94a3b8', textAlign: 'center' } },
                  ],
                },
                {
                  type: 'div',
                  styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 32px', backgroundColor: '#0f172a', borderRadius: '12px', minWidth: '180px' },
                  children: [
                    { type: 'heading', content: '45', styles: { fontSize: '2.5rem', fontWeight: '700', color: '#a78bfa', textAlign: 'center', lineHeight: '1' } },
                    { type: 'paragraph', content: 'Proposals', styles: { fontSize: '1rem', color: '#94a3b8', textAlign: 'center' } },
                  ],
                },
                {
                  type: 'div',
                  styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 32px', backgroundColor: '#0f172a', borderRadius: '12px', minWidth: '180px' },
                  children: [
                    { type: 'heading', content: '$2.1M', styles: { fontSize: '2.5rem', fontWeight: '700', color: '#a78bfa', textAlign: 'center', lineHeight: '1' } },
                    { type: 'paragraph', content: 'Treasury', styles: { fontSize: '1rem', color: '#94a3b8', textAlign: 'center' } },
                  ],
                },
                {
                  type: 'div',
                  styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 32px', backgroundColor: '#0f172a', borderRadius: '12px', minWidth: '180px' },
                  children: [
                    { type: 'heading', content: '99%', styles: { fontSize: '2.5rem', fontWeight: '700', color: '#a78bfa', textAlign: 'center', lineHeight: '1' } },
                    { type: 'paragraph', content: 'Uptime', styles: { fontSize: '1rem', color: '#94a3b8', textAlign: 'center' } },
                  ],
                },
              ],
            },
          ],
        },
        // Countdown
        {
          type: 'countdown',
          content: JSON.stringify({ targetDate: '2026-07-01T00:00:00', label: 'Next governance vote in', showLabels: true }),
          styles: { display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0', padding: '40px 20px', backgroundColor: '#0f172a', color: '#ffffff' },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 150, once: true },
        },
        // Alert Banner
        {
          type: 'alert',
          content: JSON.stringify({ variant: 'info', message: 'Governance Vote #45 is live — cast your vote before Friday', dismissible: false }),
          styles: { padding: '16px 24px', backgroundColor: '#1e1b4b', borderLeft: '4px solid #8B5CF6', color: '#c4b5fd', fontSize: '0.95rem', margin: '0' },
        },
        // Footer
        {
          type: 'footer',
          configuration: 'simpleFooter',
          structure: 'simpleFooter',
          styles: {
            width: '100%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '32px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            borderTop: '1px solid #1e293b',
          },
          children: [
            { type: 'socialLinks', content: JSON.stringify({ links: [{ platform: 'discord', url: '#' }, { platform: 'twitter', url: '#' }, { platform: 'github', url: '#' }] }), styles: { display: 'flex', gap: '16px', justifyContent: 'center' } },
            { type: 'paragraph', content: '© 2026 OurDAO. Governed by the community.', styles: { fontSize: '0.875rem', color: '#64748b', textAlign: 'center' } },
          ],
        },
      ]);
    },
    websiteSettings: {
      siteTitle: 'DAO Governance',
      faviconUrl: '',
      description: 'Decentralized autonomous organization governance portal',
      author: '',
      bodyFont: 'Inter',
      primaryColor: '#8B5CF6',
      bodyBackgroundColor: '#0F172A',
    },
  },
  {
    name: 'Token Launch',
    description: 'Token/NFT launch page with minting',
    icon: 'rocket_launch',
    get elements() {
      return buildFlatElements([
        // Navbar
        {
          type: 'navbar',
          configuration: 'customTemplateNavbar',
          structure: 'customTemplateNavbar',
          styles: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 32px',
            backgroundColor: '#1a1a2e',
            borderBottom: '1px solid #2a2a4a',
          },
          children: [
            { type: 'span', content: 'TokenX', styles: { fontWeight: 'bold', fontSize: '1.3rem', color: '#F59E0B' } },
            { type: 'anchor', content: 'About', href: '#about', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Tokenomics', href: '#tokenomics', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'Mint', href: '#mint', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
            { type: 'anchor', content: 'FAQ', href: '#faq', styles: { cursor: 'pointer', textDecoration: 'none', color: '#94a3b8' } },
          ],
        },
        // Hero
        {
          type: 'hero',
          configuration: 'heroOne',
          structure: 'heroOne',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '100px 20px',
            backgroundColor: '#1a1a2e',
            gap: '1.5rem',
          },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 0, once: true },
          children: [
            { type: 'heading', content: 'The Future of TokenX', styles: { fontSize: '3.5rem', fontWeight: '800', textAlign: 'center', color: '#ffffff' } },
            { type: 'paragraph', content: 'A next-generation utility token powering decentralized commerce, governance, and community rewards across multiple chains.', styles: { fontSize: '1.2rem', textAlign: 'center', maxWidth: '650px', lineHeight: '1.7', color: '#94a3b8' } },
            {
              type: 'div',
              styles: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
              children: [
                { type: 'button', content: 'Buy Token', styles: { backgroundColor: '#F59E0B', color: '#1a1a2e', padding: '14px 36px', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer' } },
                { type: 'button', content: 'Read Docs', styles: { backgroundColor: 'transparent', color: '#F59E0B', padding: '14px 36px', border: '2px solid #F59E0B', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer' } },
              ],
            },
          ],
        },
        // Marquee ticker
        {
          type: 'marquee',
          content: JSON.stringify({ items: ['TokenX Live Price: $0.042', 'Market Cap: $4.2M', 'Holders: 12,500+', 'Staking APY: 24%', 'Next Burn: 500K Tokens'], speed: 35, direction: 'left', pauseOnHover: true }),
          styles: { backgroundColor: '#F59E0B', color: '#1a1a2e', padding: '12px 0', fontSize: '0.9rem', fontWeight: '600' },
        },
        // Minting Section
        {
          type: 'mintingSection',
          configuration: 'mintingSection',
          structure: 'mintingSection',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '60px 20px',
            backgroundColor: '#16162a',
            alignItems: 'center',
            gap: '24px',
          },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 100, once: true },
          children: [
            { type: 'heading', content: 'Mint TokenX NFT Pass', styles: { fontSize: '2.25rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' } },
            { type: 'paragraph', content: 'Hold an NFT pass to unlock premium staking tiers, governance voting power, and exclusive airdrops.', styles: { color: '#94a3b8', textAlign: 'center', maxWidth: '550px', lineHeight: '1.6' } },
          ],
        },
        // FAQ Section
        {
          type: 'section',
          configuration: 'sectionFive',
          structure: 'sectionFive',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '80px 24px',
            backgroundColor: '#1a1a2e',
            gap: '32px',
          },
          scrollAnimation: { type: 'fadeInUp', duration: 600, delay: 150, once: true },
          children: [
            {
              type: 'div',
              styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '700px', textAlign: 'center' },
              children: [
                { type: 'heading', content: 'Frequently Asked Questions', styles: { fontSize: '2.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px' } },
                { type: 'paragraph', content: 'Everything you need to know about TokenX.', styles: { fontSize: '1.1rem', color: '#94a3b8', marginBottom: '40px' } },
              ],
            },
            {
              type: 'accordion',
              content: JSON.stringify({
                items: [
                  { title: 'What is TokenX?', body: 'TokenX is a multi-chain utility token designed to power decentralized commerce, governance, and community rewards.' },
                  { title: 'How do I buy TokenX?', body: 'You can buy TokenX on major DEXs like Raydium and Jupiter. Connect your Solana wallet and swap SOL for TokenX.' },
                  { title: 'What are the staking rewards?', body: 'Staking TokenX earns up to 24% APY. NFT pass holders receive boosted rates and priority access to new pools.' },
                  { title: 'When is the next token burn?', body: 'Token burns happen quarterly. The next scheduled burn will remove 500K tokens from circulation.' },
                ],
                allowMultiple: true,
              }),
              styles: { width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '12px' },
            },
          ],
        },
        // Footer
        {
          type: 'footer',
          configuration: 'simpleFooter',
          structure: 'simpleFooter',
          styles: {
            width: '100%',
            backgroundColor: '#0f0f1e',
            color: '#ffffff',
            padding: '32px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            borderTop: '1px solid #2a2a4a',
          },
          children: [
            { type: 'socialLinks', content: JSON.stringify({ links: [{ platform: 'discord', url: '#' }, { platform: 'twitter', url: '#' }, { platform: 'github', url: '#' }] }), styles: { display: 'flex', gap: '16px', justifyContent: 'center' } },
            { type: 'paragraph', content: '© 2026 TokenX. Built on Solana.', styles: { fontSize: '0.875rem', color: '#64748b', textAlign: 'center' } },
          ],
        },
      ]);
    },
    websiteSettings: {
      siteTitle: 'TokenX Launch',
      faviconUrl: '',
      description: 'TokenX — the future of decentralized utility tokens',
      author: '',
      bodyFont: 'Inter',
      primaryColor: '#F59E0B',
      bodyBackgroundColor: '#1A1A2E',
    },
  },
];
