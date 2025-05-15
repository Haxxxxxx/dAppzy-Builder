import { defaultSectionStyles } from '../../Elements/Sections/ContentSections/defaultSectionStyles';

export const SectionConfiguration = {
  sectionOne: {
    type: 'section',
    label: 'Section One',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#FFFFFF',
        padding: '60px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '600px',
      },
      buttons: {
        ...defaultSectionStyles.buttonContainer,
        marginTop: '24px',
      },
      image: {
        ...defaultSectionStyles.imageContainer,
        maxWidth: '500px',
        img: {
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '16px',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        lineHeight: '1.7',
      },
      primaryButton: {
        ...defaultSectionStyles.primaryButton,
        backgroundColor: '#0F62FE',
      },
      secondaryButton: {
        ...defaultSectionStyles.secondaryButton,
        color: '#0F62FE',
      },
    },
    children: [
      { type: 'span', content: 'Label' },
      { type: 'heading', content: 'Section One Title' },
      { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.' },
      { type: 'button', content: 'Learn More' },
      { type: 'button', content: 'Learn More' },
      { 
        type: 'image', 
        content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
        styles: {
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }
      },
    ],
  },
  sectionTwo: {
    type: 'section',
    label: 'Section Two',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#F9FAFB',
        padding: '80px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
      },
      buttons: {
        ...defaultSectionStyles.buttonContainer,
        marginTop: '32px',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '3rem',
        marginBottom: '24px',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.25rem',
        lineHeight: '1.8',
      },
      primaryButton: {
        ...defaultSectionStyles.primaryButton,
        backgroundColor: '#1E40AF',
      },
      secondaryButton: {
        ...defaultSectionStyles.secondaryButton,
        color: '#1E40AF',
      },
    },
    children: [
      { type: 'span', content: 'Label' },
      { type: 'heading', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum amet at molestie mattis.' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
    ],
  },
  sectionThree: {
    type: 'section',
    label: 'Section Three',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#FFFFFF',
        padding: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '3rem',
        marginBottom: '20px',
        textAlign: 'center',
        color: '#1F2937',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.2rem',
        lineHeight: '1.75',
        textAlign: 'center',
        color: '#4B5563',
        maxWidth: '700px',
      },
      image: {
        ...defaultSectionStyles.imageContainer,
        maxWidth: '600px',
        marginTop: '40px',
        img: {
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }
      },
      primaryButton: {
        ...defaultSectionStyles.primaryButton,
        backgroundColor: '#2563EB',
        marginTop: '32px',
      },
    },
    children: [
      { type: 'span', content: 'Our Services' },
      { type: 'heading', content: 'Transform Your Digital Presence' },
      { type: 'paragraph', content: 'We help businesses create stunning, responsive websites that drive engagement and conversions. Our team of experts combines creativity with technical excellence to deliver exceptional results.' },
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
      { type: 'button', content: 'Get Started' },
    ],
  },
  sectionFour: {
    type: 'section',
    label: 'Section Four',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#F3F4F6',
        padding: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '48px',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#1F2937',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        lineHeight: '1.7',
        textAlign: 'center',
        color: '#4B5563',
        maxWidth: '600px',
      },
      featureContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '32px',
        width: '100%',
        marginTop: '40px',
      },
      featureItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      featureIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '12px',
        objectFit: 'cover',
      },
      featureTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
      },
      featureDescription: {
        fontSize: '1rem',
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: '1.5',
      },
      primaryButton: {
        ...defaultSectionStyles.primaryButton,
        backgroundColor: '#2563EB',
        marginTop: '48px',
      },
    },
    children: [
      { type: 'span', content: 'Why Choose Us' },
      { type: 'heading', content: 'Features That Set Us Apart' },
      { type: 'paragraph', content: 'Discover how our innovative solutions can help your business grow and succeed in the digital landscape.' },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'heading', content: 'Responsive Design' },
          { type: 'paragraph', content: 'Create beautiful, mobile-friendly websites that look great on any device.' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'heading', content: 'Fast Performance' },
          { type: 'paragraph', content: 'Optimize your website for speed and performance to keep visitors engaged.' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'heading', content: 'SEO Friendly' },
          { type: 'paragraph', content: 'Improve your search engine rankings with our SEO-optimized solutions.' }
        ],
      },
      {
        type: 'featureItem',
        children: [
          { type: 'icon', src: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' },
          { type: 'heading', content: '24/7 Support' },
          { type: 'paragraph', content: 'Get help whenever you need it with our round-the-clock customer support.' }
        ],
      },
      { type: 'button', content: 'Learn More' },
    ],
  }
};
