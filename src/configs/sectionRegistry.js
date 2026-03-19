/**
 * Unified Section Registry
 *
 * Single source of truth for ALL section variant metadata.
 * Each entry defines: configuration key, section type, label, description,
 * preview image, and component name for canvas rendering.
 *
 * Children/styles are still defined in their respective config files
 * (HeroConfigurations, NavbarConfigurations, etc.) and aggregated
 * via structureConfigurations.js — this registry only adds the
 * UI metadata layer that was previously scattered across panel files.
 */

// ── Section categories ──────────────────────────────────────────────

export const SECTION_CATEGORIES = {
  NAVBAR: 'navbar',
  HERO: 'hero',
  CTA: 'cta',
  CONTENT: 'ContentSection',
  WEB3: 'web3',
  FOOTER: 'footer',
};

// ── Registry entries ────────────────────────────────────────────────

const registry = [
  // ─── Navbar ───────────────────────────────────────────────────────
  {
    configuration: 'customTemplateNavbar',
    type: 'navbar',
    category: SECTION_CATEGORIES.NAVBAR,
    label: 'Custom Navbar',
    description: 'Fully customizable navigation bar',
    imgSrc: '/img/previsu-custom-navbar.png',
    component: 'CustomTemplateNavbar',
  },
  {
    configuration: 'twoColumn',
    type: 'navbar',
    category: SECTION_CATEGORIES.NAVBAR,
    label: 'Two Columns',
    description: 'Logo left, links right',
    imgSrc: '/img/previsu-two-columns-navbar.png',
    component: 'TwoColumnNavbar',
  },
  {
    configuration: 'threeColumn',
    type: 'navbar',
    category: SECTION_CATEGORIES.NAVBAR,
    label: 'Three Columns',
    description: 'Logo, centered links, action buttons',
    imgSrc: '/img/previewcomponent.png',
    component: 'ThreeColumnNavbar',
  },
  {
    configuration: 'defiNavbar',
    type: 'navbar',
    category: SECTION_CATEGORIES.NAVBAR,
    label: 'DeFi Navbar',
    description: 'Navigation with wallet connection',
    imgSrc: '/img/previsu-defi-navbar.png',
    component: 'DeFiNavbar',
  },

  // ─── Hero ─────────────────────────────────────────────────────────
  {
    configuration: 'heroOne',
    type: 'hero',
    category: SECTION_CATEGORIES.HERO,
    label: 'Basic Hero',
    description: 'Clean hero with heading, text and CTA',
    imgSrc: '/img/previsu-basic-hero.png',
    component: 'HeroOne',
  },
  {
    configuration: 'heroTwo',
    type: 'hero',
    category: SECTION_CATEGORIES.HERO,
    label: 'Small Hero',
    description: 'Compact centered hero section',
    imgSrc: '/img/previsu-small-hero.png',
    component: 'HeroTwo',
  },
  {
    configuration: 'heroThree',
    type: 'hero',
    category: SECTION_CATEGORIES.HERO,
    label: 'Advanced Hero',
    description: 'Split layout with image and content',
    imgSrc: '/img/previsu-advanced-hero.png',
    component: 'HeroThree',
  },
  {
    configuration: 'videoHero',
    type: 'hero',
    category: SECTION_CATEGORIES.HERO,
    label: 'Video Hero',
    description: 'Full-screen background video with overlay text',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericHero',
  },

  // ─── CTA ──────────────────────────────────────────────────────────
  {
    configuration: 'ctaOne',
    type: 'cta',
    category: SECTION_CATEGORIES.CTA,
    label: 'Advanced CTA',
    description: 'Rich call-to-action with animations',
    imgSrc: '/img/previsu-advanced-cta.png',
    component: 'CTAOne',
  },
  {
    configuration: 'ctaTwo',
    type: 'cta',
    category: SECTION_CATEGORIES.CTA,
    label: 'Quick CTA',
    description: 'Streamlined call-to-action',
    imgSrc: '/img/previsu-quick-cta.png',
    component: 'CTATwo',
  },
  {
    configuration: 'ctaThree',
    type: 'cta',
    category: SECTION_CATEGORIES.CTA,
    label: 'Business CTA',
    description: 'Headline, copy, trial and demo buttons',
    imgSrc: '/img/previewcomponent.png',
    component: 'CTAOne', // same layout as ctaOne
  },

  // ─── Content Sections ─────────────────────────────────────────────
  {
    configuration: 'sectionOne',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Feature Section',
    description: 'Highlight key features with icons',
    imgSrc: '/img/previewcomponent.png',
    component: 'SectionOne',
  },
  {
    configuration: 'sectionTwo',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Content Grid',
    description: 'Flexible grid for content cards',
    imgSrc: '/img/previewcomponent.png',
    component: 'SectionTwo',
  },
  {
    configuration: 'sectionThree',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Testimonial Section',
    description: 'Customer testimonials and social proof',
    imgSrc: '/img/previewcomponent.png',
    component: 'SectionThree',
  },
  {
    configuration: 'sectionFour',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Pricing Section',
    description: 'Comparison pricing with tiered plans',
    imgSrc: '/img/previewcomponent.png',
    component: 'SectionFour',
  },
  {
    configuration: 'sectionFive',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'FAQ Section',
    description: 'Expandable questions and answers',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },
  {
    configuration: 'sectionSix',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Team Section',
    description: 'Team members with photos and roles',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },
  {
    configuration: 'sectionSeven',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Stats Section',
    description: 'Key metrics and impact numbers',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },
  {
    configuration: 'sectionEight',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Contact Section',
    description: 'Contact form for visitors',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },
  {
    configuration: 'sectionNine',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Newsletter Signup',
    description: 'Email capture with heading and subscribe button',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },
  {
    configuration: 'sectionTen',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Logo Cloud',
    description: 'Showcase partner or client logos in a row',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },
  {
    configuration: 'sectionEleven',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Steps / Process',
    description: 'Numbered steps showing how something works',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },
  {
    configuration: 'sectionTwelve',
    type: 'ContentSection',
    category: SECTION_CATEGORIES.CONTENT,
    label: 'Testimonial Slider',
    description: 'Rotating customer testimonials in a carousel',
    imgSrc: '/img/previewcomponent.png',
    component: 'GenericSection',
  },

  // ─── Web3 ─────────────────────────────────────────────────────────
  {
    configuration: 'defiSection',
    type: 'defiSection',
    category: SECTION_CATEGORIES.WEB3,
    label: 'DeFi Dashboard',
    description: 'Real-time DeFi data display',
    imgSrc: '/img/previsu-defi-dashboard.png',
    component: 'DraggableDeFi',
  },
  {
    configuration: 'mintingSection',
    type: 'mintingSection',
    category: SECTION_CATEGORIES.WEB3,
    label: 'NFT Minting',
    description: 'NFT creation and management',
    imgSrc: '/img/previewcomponent.png',
    component: 'DraggableMinting',
  },

  // ─── Footer ───────────────────────────────────────────────────────
  {
    configuration: 'simpleFooter',
    type: 'footer',
    category: SECTION_CATEGORIES.FOOTER,
    label: 'Simple Footer',
    description: 'Minimal footer with essential links',
    imgSrc: '/img/previsu-simple-footer.png',
    component: 'SimpleFooter',
  },
  {
    configuration: 'detailedFooter',
    type: 'footer',
    category: SECTION_CATEGORIES.FOOTER,
    label: 'Detailed Footer',
    description: 'Multi-section comprehensive footer',
    imgSrc: '/img/previsu-detailed-footer.png',
    component: 'DetailedFooter',
  },
  {
    configuration: 'advancedFooter',
    type: 'footer',
    category: SECTION_CATEGORIES.FOOTER,
    label: 'Advanced Footer',
    description: 'Feature-rich interactive footer',
    imgSrc: '/img/previsu-advanced-footer.png',
    component: 'TemplateFooter',
  },
  {
    configuration: 'defiFooter',
    type: 'footer',
    category: SECTION_CATEGORIES.FOOTER,
    label: 'DeFi Footer',
    description: 'Specialized for DeFi applications',
    imgSrc: '/img/previsu-defi-footer.png',
    component: 'DeFiFooter',
  },
];

// ── Derived lookups (computed once at import time) ──────────────────

/** Full registry array */
export const sectionRegistry = registry;

/** Lookup by configuration key → registry entry */
export const registryByConfig = Object.fromEntries(
  registry.map((entry) => [entry.configuration, entry])
);

/** Get all entries for a given category */
export const getByCategory = (category) =>
  registry.filter((entry) => entry.category === category);

