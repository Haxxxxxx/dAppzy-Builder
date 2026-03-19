import { PLACEHOLDER_IMAGES } from '../assetUrls';
import { defaultHeroStyles, heroTwoStyles, CustomTemplateHeroStyles } from '../../Elements/Sections/Heros/defaultHeroStyles';

export const HeroConfiguration = {
  heroOne: {
    type: 'hero',
    styles: {
      section: defaultHeroStyles.heroSection,
      left: defaultHeroStyles.heroLeftContent,
      right: defaultHeroStyles.heroRightContent,
      heroTitle: defaultHeroStyles.heroTitle,
      heroDescription: defaultHeroStyles.heroDescription,
      primaryButton: defaultHeroStyles.primaryButton,
      heroImage: defaultHeroStyles.heroImage,
    },
    children: [
      {
        type: 'div',
        idSuffix: 'left',
        styles: { key: 'left' },
        children: [
          { type: 'heading', content: 'Welcome to Our Website', styles: { key: 'heroTitle' } },
          { type: 'paragraph', content: 'Building a better future together.', styles: { key: 'heroDescription' } },
          { type: 'button', content: 'Get Started', styles: { key: 'primaryButton' } },
        ]
      },
      {
        type: 'div',
        idSuffix: 'right',
        styles: { key: 'right' },
        children: [
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'heroImage' } },
        ]
      }
    ],
  },
  heroTwo: {
    type: 'hero',
    styles: {
      section: heroTwoStyles.heroSection,
      content: heroTwoStyles.heroContent,
      heroTitle: heroTwoStyles.heroTitle,
      heroDescription: heroTwoStyles.heroDescription,
      primaryButton: heroTwoStyles.primaryButton,
    },
    children: [
      {
        type: 'div',
        idSuffix: 'content',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Discover Your Potential', styles: { key: 'heroTitle' } },
          { type: 'paragraph', content: 'Join us today and start making an impact.', styles: { key: 'heroDescription' } },
          { type: 'button', content: 'Join Now', styles: { key: 'primaryButton' } },
        ]
      }
    ],
  },
  heroThree: {
    type: 'hero',
    styles: {
      section: CustomTemplateHeroStyles.heroSection,
      left: CustomTemplateHeroStyles.heroContent,
      right: CustomTemplateHeroStyles.heroImageContainer,
      caption: CustomTemplateHeroStyles.caption,
      heroTitle: CustomTemplateHeroStyles.heroTitle,
      heroDescription: CustomTemplateHeroStyles.heroDescription,
      primaryButton: CustomTemplateHeroStyles.primaryButton,
      secondaryButton: CustomTemplateHeroStyles.secondaryButton,
      heroImage: CustomTemplateHeroStyles.heroImage,
    },
    children: [
      {
        type: 'div',
        idSuffix: 'left',
        styles: { key: 'left' },
        children: [
          { type: 'span', content: 'CAPTION', styles: { key: 'caption' }, settings: { isCaption: true } },
          { type: 'heading', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', styles: { key: 'heroTitle' }, settings: { level: 1 } },
          { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit.', styles: { key: 'heroDescription' } },
          { type: 'button', content: 'Primary Action', styles: { key: 'primaryButton' }, settings: { isPrimary: true } },
          { type: 'button', content: 'Secondary Action', styles: { key: 'secondaryButton' }, settings: { isPrimary: false } },
        ]
      },
      {
        type: 'div',
        idSuffix: 'right',
        styles: { key: 'right' },
        children: [
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'heroImage' }, settings: { alt: 'Hero image' } },
        ]
      }
    ],
  },

  // ── Video Hero ──────────────────────────────────────────────────
  videoHero: {
    type: 'hero',
    styles: {
      section: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px',
        padding: '0',
        margin: '0',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      },
      bgVideo: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: '0',
      },
      overlay: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        zIndex: '1',
      },
      content: {
        position: 'relative',
        zIndex: '2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        maxWidth: '700px',
        padding: '80px 40px',
        gap: '1rem',
      },
      heroTitle: {
        fontSize: '3rem',
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: '1.15',
        marginBottom: '16px',
        textAlign: 'center',
      },
      heroDescription: {
        fontSize: '1.25rem',
        lineHeight: '1.7',
        color: '#E5E7EB',
        marginBottom: '24px',
        textAlign: 'center',
        maxWidth: '600px',
      },
      primaryButton: {
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        padding: '14px 32px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '1.125rem',
        transition: 'all 0.2s ease',
      },
    },
    children: [
      {
        type: 'bgVideo',
        content: '',
        styles: { key: 'bgVideo' },
        settings: { autoplay: true, loop: true, muted: true },
      },
      {
        type: 'div',
        idSuffix: 'overlay',
        styles: { key: 'overlay' },
        children: []
      },
      {
        type: 'div',
        idSuffix: 'content',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Immersive Video Experience', styles: { key: 'heroTitle' }, settings: { level: 1 } },
          { type: 'paragraph', content: 'Captivate your audience with a full-screen video background that tells your story.', styles: { key: 'heroDescription' } },
          { type: 'button', content: 'Get Started', styles: { key: 'primaryButton' }, settings: { isPrimary: true } },
        ]
      }
    ],
  },
};
