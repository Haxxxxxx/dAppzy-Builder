import { PLACEHOLDER_IMAGES } from '../assetUrls';
import { ctaOneStyles, ctaTwoStyles } from '../../Elements/Sections/CTAs/defaultCtaStyles';

export const CtaConfigurations = {
  ctaOne: {
    type: 'cta',
    styles: {
      section: ctaOneStyles.cta,
      text: ctaOneStyles.ctaContent,
      buttons: ctaOneStyles.buttonContainer,
      image: ctaOneStyles.ctaImage,
      ctaTitle: ctaOneStyles.ctaTitle,
      ctaDescription: ctaOneStyles.ctaDescription,
      primaryButton: ctaOneStyles.primaryButton,
    },
    children: [
      {
        type: 'div',
        idSuffix: 'text',
        styles: { key: 'text' },
        children: [
          { type: 'heading', content: 'Get Started Today!', styles: { key: 'ctaTitle' } },
          { type: 'paragraph', content: 'Sign up now and take the first step towards a better future.', styles: { key: 'ctaDescription' } },
        ]
      },
      {
        type: 'div',
        idSuffix: 'buttons',
        styles: { key: 'buttons' },
        children: [
          { type: 'button', content: 'Join Now', styles: { key: 'primaryButton' } },
          { type: 'button', content: 'Learn More', styles: { key: 'primaryButton' } },
        ]
      },
      {
        type: 'div',
        idSuffix: 'image',
        styles: { key: 'image' },
        children: [
          { type: 'image', content: PLACEHOLDER_IMAGES.builder },
        ]
      }
    ],
  },

  ctaTwo: {
    type: 'cta',
    styles: {
      section: ctaTwoStyles.cta,
      text: ctaTwoStyles.ctaContent,
      buttons: ctaTwoStyles.buttonContainer,
      ctaTitle: ctaTwoStyles.ctaTitle,
      primaryButton: ctaTwoStyles.primaryButton,
      secondaryButton: ctaTwoStyles.secondaryButton,
    },
    children: [
      {
        type: 'div',
        idSuffix: 'text',
        styles: { key: 'text' },
        children: [
          { type: 'heading', content: 'Take Action Now!', styles: { key: 'ctaTitle' } },
        ]
      },
      {
        type: 'div',
        idSuffix: 'buttons',
        styles: { key: 'buttons' },
        children: [
          { type: 'button', content: 'Primary Action', styles: { key: 'primaryButton' } },
          { type: 'button', content: 'Secondary Action', styles: { key: 'secondaryButton' } },
        ]
      }
    ],
  },

  ctaThree: {
    type: 'cta',
    styles: {
      section: ctaOneStyles.cta,
      text: ctaOneStyles.ctaContent,
      buttons: ctaOneStyles.buttonContainer,
      image: ctaOneStyles.ctaImage,
      ctaTitle: ctaOneStyles.ctaTitle,
      ctaDescription: ctaOneStyles.ctaDescription,
      primaryButton: ctaOneStyles.primaryButton,
      secondaryButton: ctaOneStyles.secondaryButton,
    },
    children: [
      {
        type: 'div',
        idSuffix: 'text',
        styles: { key: 'text' },
        children: [
          { type: 'heading', content: 'Transform Your Business Today', styles: { key: 'ctaTitle' } },
          { type: 'paragraph', content: 'Join thousands of successful businesses that have already made the switch. Our platform provides everything you need to grow and succeed.', styles: { key: 'ctaDescription' } },
        ]
      },
      {
        type: 'div',
        idSuffix: 'buttons',
        styles: { key: 'buttons' },
        children: [
          { type: 'button', content: 'Start Free Trial', styles: { key: 'primaryButton' } },
          { type: 'button', content: 'Schedule Demo', styles: { key: 'secondaryButton' } },
        ]
      },
      {
        type: 'div',
        idSuffix: 'image',
        styles: { key: 'image' },
        children: [
          { type: 'image', content: PLACEHOLDER_IMAGES.builder },
        ]
      }
    ],
  },
};
