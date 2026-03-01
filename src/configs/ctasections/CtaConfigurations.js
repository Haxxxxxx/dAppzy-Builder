import { PLACEHOLDER_IMAGES } from '../assetUrls';

export const CtaConfigurations = {  
    ctaOne: {
    children: [
      { type: "heading", content: "Get Started Today!"},
      { type: "paragraph", content: "Sign up now and take the first step towards a better future."},
      { type: "button", content: "Join Now"},
      { type: "button", content: "Learn More"},
      { type: "image", content: PLACEHOLDER_IMAGES.builder },
    ],
  },
  
  ctaTwo: {
    children: [
      { type: 'heading', content: 'Take Action Now!' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
    ],
  },

  ctaThree: {
    children: [
      { type: 'heading', content: 'Transform Your Business Today' },
      { type: 'paragraph', content: 'Join thousands of successful businesses that have already made the switch. Our platform provides everything you need to grow and succeed.' },
      { type: 'button', content: 'Start Free Trial' },
      { type: 'button', content: 'Schedule Demo' },
      { type: 'image', content: PLACEHOLDER_IMAGES.builder },
    ],
  },
}