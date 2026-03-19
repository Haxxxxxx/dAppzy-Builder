import { defaultSectionStyles } from '../../Elements/Sections/ContentSections/defaultSectionStyles';
import { PLACEHOLDER_IMAGES } from '../assetUrls';

export const SectionConfiguration = {
  sectionOne: {
    type: 'section',
    label: 'Section One',
    styles: {
      section: {
        backgroundColor: 'transparent',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        margin: 0,
      },
      content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '700px',
        textAlign: 'center',
        boxSizing: 'border-box',
        padding: 0,
        margin: 0,
      },
      buttons: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        margin: 0,
        boxSizing: 'border-box',
      },
      image: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        maxWidth: '700px',
      },
      heading: {
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: '0 0 1rem',
        color: '#1A1A1A',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        boxSizing: 'border-box',
      },
      paragraph: {
        fontSize: '1rem',
        lineHeight: '1.5',
        margin: '0 0 1rem',
        color: '#333',
        textAlign: 'center',
        maxWidth: '600px',
        border: 'none',
        outline: 'none',
        boxSizing: 'border-box',
      }
    },
    children: [
      { type: 'heading', content: 'Bibendum amet at molestie mattis.' },
      { type: 'paragraph', content: 'Rhoncus morbi et augue nec, in id ullamcorper at sit. Condimentum sit nunc in eros scelerisque sed. Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar. Fermentum scelerisque sit consectetur hac mi. Mollis leo eleifend ultricies purus iaculis.' },
      { type: 'button', content: 'Primary Action' },
      { type: 'button', content: 'Secondary Action' },
      { type: 'image', content: PLACEHOLDER_IMAGES.builder }
    ]
  },
  sectionTwo: {
    type: 'section',
    label: 'Section Two',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#F9FAFB',
        padding: '120px 60px',
        textAlign: 'center'
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center'
      },
      buttons: {
        ...defaultSectionStyles.buttonContainer,
        marginTop: '40px',
        justifyContent: 'center'
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '3.5rem',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.375rem',
        lineHeight: '1.8',
        color: '#4B5563',
        maxWidth: '700px',
        margin: '0 auto 40px'
      },
      primaryButton: {
        ...defaultSectionStyles.primaryButton,
        backgroundColor: '#1E40AF',
        padding: '16px 32px',
        fontSize: '1.125rem',
        '&:hover': {
          backgroundColor: '#1E3A8A',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 15px rgba(30, 64, 175, 0.3)'
        }
      },
      secondaryButton: {
        ...defaultSectionStyles.secondaryButton,
        color: '#1E40AF',
        padding: '16px 32px',
        fontSize: '1.125rem',
        '&:hover': {
          backgroundColor: 'rgba(30, 64, 175, 0.1)',
          transform: 'translateY(-2px)'
        }
      },
      cards: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 1rem'
      },
      cardsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        width: '100%',
        padding: '10px'
      },
      card: {
        padding: '1.5rem',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }
      },
      cardHeading: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1F2937'
      },
      cardParagraph: {
        fontSize: '1rem',
        color: '#4B5563',
        lineHeight: '1.5'
      }
    },
    children: [
      { type: 'span', content: 'Features' },
      { type: 'heading', content: 'Powerful Features for Modern Web Development' },
      { type: 'paragraph', content: 'Build beautiful, responsive websites with our comprehensive suite of tools and features. From design to deployment, we\'ve got you covered.' },
      { type: 'button', content: 'Explore Features' },
      { type: 'button', content: 'View Documentation' },
      {
        type: 'gridLayout',
        children: [
          {
            type: 'div',
            children: [
              { type: 'heading', content: 'Feature 1', styles: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' } },
              { type: 'paragraph', content: 'Description for feature 1. Add your content here.', styles: { fontSize: '1rem', color: '#4B5563', lineHeight: '1.5' } }
            ],
            styles: { 
              padding: '1.5rem', 
              backgroundColor: '#F9FAFB', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch'
            }
          },
          {
            type: 'div',
            children: [
              { type: 'heading', content: 'Feature 2', styles: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' } },
              { type: 'paragraph', content: 'Description for feature 2. Add your content here.', styles: { fontSize: '1rem', color: '#4B5563', lineHeight: '1.5' } }
            ],
            styles: { 
              padding: '1.5rem', 
              backgroundColor: '#F9FAFB', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch'
            }
          },
          {
            type: 'div',
            children: [
              { type: 'heading', content: 'Feature 3', styles: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' } },
              { type: 'paragraph', content: 'Description for feature 3. Add your content here.', styles: { fontSize: '1rem', color: '#4B5563', lineHeight: '1.5' } }
            ],
            styles: { 
              padding: '1.5rem', 
              backgroundColor: '#F9FAFB', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch'
            }
          },
          {
            type: 'div',
            children: [
              { type: 'heading', content: 'Feature 4', styles: { fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' } },
              { type: 'paragraph', content: 'Description for feature 4. Add your content here.', styles: { fontSize: '1rem', color: '#4B5563', lineHeight: '1.5' } }
            ],
            styles: { 
              padding: '1.5rem', 
              backgroundColor: '#F9FAFB', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch'
            }
          }
        ],
        styles: { 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          width: '100%',
          padding: '10px'
        }
      }
    ]
  },
  sectionThree: {
    type: 'section',
    label: 'Testimonials',
    styles: {
      section: {
        backgroundColor: '#fff',
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '40px',
        width: '100%',
        boxSizing: 'border-box',
      },
      left: {
        flex: '1 1 0',
        minWidth: '260px',
        maxWidth: '340px',
        textAlign: 'left',
      },
      right: {
        flex: '3 1 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
        alignItems: 'stretch',
      },
      testimonialCard: {
        background: 'none',
        border: 'none',
        textAlign: 'left',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
      testimonialIcon: {
        width: '40px',
        height: '40px',
        marginBottom: '12px',
        opacity: 0.5,
      },
      testimonialName: {
        fontWeight: 'bold',
        fontSize: '1rem',
        marginBottom: '4px',
        color: '#1F2937',
      },
      testimonialText: {
        color: '#6B7280',
        fontSize: '0.95rem',
        marginBottom: '8px',
      },
      testimonialLink: {
        color: '#2563EB',
        fontWeight: 500,
        fontSize: '0.95rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
      }
    },
    children: [
      {
        type: 'div',
        styles: { key: 'left' },
        children: [
          { type: 'heading', content: 'Varius risus pretium velit ut ornare.' },
          { type: 'paragraph', content: 'Commodo in viverra nunc, ullamcorper ut. Non, amet, aliquet scelerisque nullam sagittis, pulvinar.' }
        ]
      },
      {
        type: 'div',
        styles: { key: 'right' },
        children: [
          {
            type: 'div',
            styles: { key: 'testimonialCard' },
            children: [
              { type: 'image', content: '/icons/testimonial1.svg', styles: { key: 'testimonialIcon' } },
              { type: 'heading', content: 'Eu libero', styles: { key: 'testimonialName' } },
              { type: 'paragraph', content: 'Cras consectetur orci donec nec mattis laoreet elit.', styles: { key: 'testimonialText' } },
              { type: 'anchor', content: 'Learn More', href: '#', styles: { key: 'testimonialLink' } }
            ]
          },
          {
            type: 'div',
            styles: { key: 'testimonialCard' },
            children: [
              { type: 'image', content: '/icons/testimonial2.svg', styles: { key: 'testimonialIcon' } },
              { type: 'heading', content: 'Vehicula sed', styles: { key: 'testimonialName' } },
              { type: 'paragraph', content: 'Vel lobortis auctor sit cras felis pellentesque felis.', styles: { key: 'testimonialText' } },
              { type: 'anchor', content: 'Learn More', href: '#', styles: { key: 'testimonialLink' } }
            ]
          },
          {
            type: 'div',
            styles: { key: 'testimonialCard' },
            children: [
              { type: 'image', content: '/icons/testimonial3.svg', styles: { key: 'testimonialIcon' } },
              { type: 'heading', content: 'Eleifend eget', styles: { key: 'testimonialName' } },
              { type: 'paragraph', content: 'Facilisis turpis turpis in ut in nibh eget lacus arcu.', styles: { key: 'testimonialText' } },
              { type: 'anchor', content: 'Learn More', href: '#', styles: { key: 'testimonialLink' } }
            ]
          }
        ]
      }
    ]
  },
  sectionFour: {
    type: 'section',
    label: 'Section Four',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#F3F4F6',
        padding: '100px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1200px',
        width: '100%',
        gap: '60px'
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center',
        textAlign: 'center'
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '3rem',
        marginBottom: '32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1F2937 0%, #4B5563 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.25rem',
        lineHeight: '1.8',
        textAlign: 'center',
        color: '#4B5563',
        maxWidth: '700px',
        margin: '0 auto 40px'
      },
      featuresContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '40px',
        width: '100%',
        marginTop: '60px'
      },
      featureItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '40px 32px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
        }
      },
      featureIcon: {
        width: '80px',
        height: '80px',
        borderRadius: '16px',
        objectFit: 'cover',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      },
      featureTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: '12px'
      },
      featureDescription: {
        fontSize: '1.125rem',
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: '1.6'
      },
      price: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1F2937',
        margin: '16px 0',
        textAlign: 'center'
      },
      pricePeriod: {
        fontSize: '1rem',
        color: '#6B7280',
        marginBottom: '24px'
      },
      featureList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 32px 0',
        width: '100%'
      },
      featureListItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        color: '#4B5563',
        fontSize: '1rem'
      },
      checkIcon: {
        color: '#10B981',
        fontSize: '1.25rem'
      },
      buttonContainer: {
        marginTop: 'auto',
        width: '100%'
      },
      primaryButton: {
        ...defaultSectionStyles.primaryButton,
        width: '100%',
        padding: '16px 32px',
        fontSize: '1.125rem',
        backgroundColor: '#2563EB',
        '&:hover': {
          backgroundColor: '#1D4ED8',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 15px rgba(37, 99, 235, 0.3)'
        }
      },
      bottomButton: {
        ...defaultSectionStyles.primaryButton,
        marginTop: '60px',
        padding: '16px 32px',
        fontSize: '1.125rem',
        backgroundColor: '#2563EB',
        '&:hover': {
          backgroundColor: '#1D4ED8',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 15px rgba(37, 99, 235, 0.3)'
        }
      }
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Simple, Transparent Pricing', styles: { key: 'heading' } },
          { type: 'paragraph', content: 'Choose the perfect plan for your needs. All plans include a 14-day free trial.', styles: { key: 'paragraph' } }
        ]
      },
      {
        type: 'gridLayout',
        styles: { key: 'featuresContainer' },
        children: [
          {
            type: 'div',
            styles: { key: 'featureItem' },
            children: [
              { type: 'heading', content: 'Starter', styles: { key: 'featureTitle' } },
              { type: 'heading', content: '$29', styles: { key: 'price' } },
              { type: 'paragraph', content: 'per month', styles: { key: 'pricePeriod' } },
              { type: 'span', content: '✓ 5 Projects', styles: { key: 'featureListItem' } },
              { type: 'span', content: '✓ 10GB Storage', styles: { key: 'featureListItem' } },
              { type: 'span', content: '✓ Basic Support', styles: { key: 'featureListItem' } },
              { type: 'button', content: 'Get Started', styles: { key: 'primaryButton' } }
            ]
          },
          {
            type: 'div',
            styles: { key: 'featureItem' },
            children: [
              { type: 'heading', content: 'Professional', styles: { key: 'featureTitle' } },
              { type: 'heading', content: '$79', styles: { key: 'price' } },
              { type: 'paragraph', content: 'per month', styles: { key: 'pricePeriod' } },
              { type: 'span', content: '✓ 15 Projects', styles: { key: 'featureListItem' } },
              { type: 'span', content: '✓ 50GB Storage', styles: { key: 'featureListItem' } },
              { type: 'span', content: '✓ Priority Support', styles: { key: 'featureListItem' } },
              { type: 'button', content: 'Get Started', styles: { key: 'primaryButton' } }
            ]
          },
          {
            type: 'div',
            styles: { key: 'featureItem' },
        children: [
              { type: 'heading', content: 'Enterprise', styles: { key: 'featureTitle' } },
              { type: 'heading', content: '$199', styles: { key: 'price' } },
              { type: 'paragraph', content: 'per month', styles: { key: 'pricePeriod' } },
              { type: 'span', content: '✓ Unlimited Projects', styles: { key: 'featureListItem' } },
              { type: 'span', content: '✓ 500GB Storage', styles: { key: 'featureListItem' } },
              { type: 'span', content: '✓ 24/7 Support', styles: { key: 'featureListItem' } },
              { type: 'button', content: 'Get Started', styles: { key: 'primaryButton' } }
            ]
          }
        ]
      },
      {
        type: 'button',
        content: 'View All Plans',
        styles: { key: 'bottomButton' }
      }
    ]
  },
  sectionFive: {
    type: 'section',
    label: 'FAQ Section',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#FFFFFF',
        padding: '80px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '16px',
        textAlign: 'center',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        color: '#6B7280',
        marginBottom: '48px',
        textAlign: 'center',
      },
      faqList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '700px',
      },
      faqItem: {
        padding: '24px',
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      },
      faqQuestion: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#1F2937',
      },
      faqAnswer: {
        fontSize: '1rem',
        color: '#6B7280',
        lineHeight: '1.6',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Frequently Asked Questions', styles: { key: 'heading' } },
          { type: 'paragraph', content: 'Find answers to the most common questions about our platform.', styles: { key: 'paragraph' } },
        ]
      },
      {
        type: 'accordion',
        content: JSON.stringify({
          items: [
            { title: 'How do I get started?', body: 'Sign up for a free account, choose a template, and start customizing. No coding required.' },
            { title: 'Can I use my own domain?', body: 'Yes! You can connect any custom domain or use our free subdomain to publish your site.' },
            { title: 'Is there a free plan?', body: 'We offer a generous free tier with all essential features. Upgrade anytime for advanced capabilities.' },
          ],
          allowMultiple: true,
        }),
        styles: { key: 'faqList' },
      }
    ]
  },
  sectionSix: {
    type: 'section',
    label: 'Team Section',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#F9FAFB',
        padding: '80px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '16px',
        textAlign: 'center',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        color: '#6B7280',
        marginBottom: '48px',
        textAlign: 'center',
      },
      teamGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
        width: '100%',
        maxWidth: '1000px',
      },
      memberCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px 24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      },
      memberImage: {
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        objectFit: 'cover',
      },
      memberName: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
      },
      memberRole: {
        fontSize: '0.95rem',
        color: '#6B7280',
        textAlign: 'center',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Meet Our Team', styles: { key: 'heading' } },
          { type: 'paragraph', content: 'The people behind the product who make it all possible.', styles: { key: 'paragraph' } },
        ]
      },
      {
        type: 'gridLayout',
        styles: { key: 'teamGrid' },
        children: [
          {
            type: 'div',
            styles: { key: 'memberCard' },
            children: [
              { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'memberImage' } },
              { type: 'heading', content: 'Alex Johnson', styles: { key: 'memberName' } },
              { type: 'paragraph', content: 'CEO & Founder', styles: { key: 'memberRole' } },
            ]
          },
          {
            type: 'div',
            styles: { key: 'memberCard' },
            children: [
              { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'memberImage' } },
              { type: 'heading', content: 'Sarah Chen', styles: { key: 'memberName' } },
              { type: 'paragraph', content: 'Head of Design', styles: { key: 'memberRole' } },
            ]
          },
          {
            type: 'div',
            styles: { key: 'memberCard' },
            children: [
              { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'memberImage' } },
              { type: 'heading', content: 'Marcus Rivera', styles: { key: 'memberName' } },
              { type: 'paragraph', content: 'Lead Engineer', styles: { key: 'memberRole' } },
            ]
          },
        ]
      }
    ]
  },
  sectionSeven: {
    type: 'section',
    label: 'Stats Section',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#1F2937',
        padding: '80px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '16px',
        color: '#FFFFFF',
        textAlign: 'center',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        color: '#9CA3AF',
        marginBottom: '48px',
        textAlign: 'center',
      },
      statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '32px',
        width: '100%',
        maxWidth: '1000px',
      },
      statItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '24px',
      },
      statNumber: {
        fontSize: '3rem',
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: '1',
      },
      statLabel: {
        fontSize: '1rem',
        color: '#9CA3AF',
        textAlign: 'center',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Trusted by Thousands', styles: { key: 'heading' } },
          { type: 'paragraph', content: 'Our numbers speak for themselves.', styles: { key: 'paragraph' } },
        ]
      },
      {
        type: 'gridLayout',
        styles: { key: 'statsGrid' },
        children: [
          {
            type: 'div',
            styles: { key: 'statItem' },
            children: [
              { type: 'heading', content: '10K+', styles: { key: 'statNumber' } },
              { type: 'paragraph', content: 'Active Users', styles: { key: 'statLabel' } },
            ]
          },
          {
            type: 'div',
            styles: { key: 'statItem' },
            children: [
              { type: 'heading', content: '50K+', styles: { key: 'statNumber' } },
              { type: 'paragraph', content: 'Sites Built', styles: { key: 'statLabel' } },
            ]
          },
          {
            type: 'div',
            styles: { key: 'statItem' },
            children: [
              { type: 'heading', content: '99.9%', styles: { key: 'statNumber' } },
              { type: 'paragraph', content: 'Uptime', styles: { key: 'statLabel' } },
            ]
          },
          {
            type: 'div',
            styles: { key: 'statItem' },
            children: [
              { type: 'heading', content: '4.9★', styles: { key: 'statNumber' } },
              { type: 'paragraph', content: 'User Rating', styles: { key: 'statLabel' } },
            ]
          },
        ]
      }
    ]
  },
  sectionEight: {
    type: 'section',
    label: 'Contact Section',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#FFFFFF',
        padding: '80px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '600px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '16px',
        textAlign: 'center',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        color: '#6B7280',
        marginBottom: '40px',
        textAlign: 'center',
      },
      formContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '500px',
      },
      inputStyle: {
        padding: '14px 16px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        fontSize: '1rem',
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
      },
      textareaStyle: {
        padding: '14px 16px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        fontSize: '1rem',
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '120px',
        resize: 'vertical',
      },
      submitButton: {
        ...defaultSectionStyles.primaryButton,
        width: '100%',
        padding: '14px 32px',
        fontSize: '1.125rem',
        backgroundColor: '#2563EB',
        marginTop: '8px',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Get in Touch', styles: { key: 'heading' } },
          { type: 'paragraph', content: 'Have a question or want to work together? Drop us a message.', styles: { key: 'paragraph' } },
        ]
      },
      {
        type: 'form',
        styles: { key: 'formContainer' },
        children: [
          { type: 'input', content: '', styles: { key: 'inputStyle' } },
          { type: 'input', content: '', styles: { key: 'inputStyle' } },
          { type: 'textarea', content: '', styles: { key: 'textareaStyle' } },
          { type: 'button', content: 'Send Message', styles: { key: 'submitButton' } },
        ]
      }
    ]
  },

  // ── Newsletter Signup ─────────────────────────────────────────────
  sectionNine: {
    type: 'section',
    label: 'Newsletter Signup',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#F0F4FF',
        padding: '80px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '600px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '16px',
        textAlign: 'center',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        color: '#6B7280',
        marginBottom: '32px',
        textAlign: 'center',
      },
      formRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        width: '100%',
        maxWidth: '480px',
        alignItems: 'center',
        justifyContent: 'center',
      },
      emailInput: {
        flex: '1',
        padding: '14px 16px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        fontSize: '1rem',
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
      },
      submitButton: {
        ...defaultSectionStyles.primaryButton,
        padding: '14px 28px',
        fontSize: '1rem',
        backgroundColor: '#2563EB',
        whiteSpace: 'nowrap',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Stay Updated', styles: { key: 'heading' } },
          { type: 'paragraph', content: 'Subscribe to our newsletter and never miss an update. No spam, unsubscribe at any time.', styles: { key: 'paragraph' } },
        ]
      },
      {
        type: 'div',
        styles: { key: 'formRow' },
        children: [
          { type: 'input', content: '', styles: { key: 'emailInput' } },
          { type: 'button', content: 'Subscribe', styles: { key: 'submitButton' } },
        ]
      }
    ]
  },

  // ── Logo Cloud ────────────────────────────────────────────────────
  sectionTen: {
    type: 'section',
    label: 'Logo Cloud',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#FFFFFF',
        padding: '60px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '1.25rem',
        fontWeight: '500',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '40px',
        textAlign: 'center',
      },
      logoRow: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '48px',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      },
      logoImage: {
        width: '120px',
        height: '40px',
        objectFit: 'contain',
        filter: 'grayscale(100%)',
        opacity: '0.5',
        transition: 'opacity 0.3s ease, filter 0.3s ease',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'Trusted By', styles: { key: 'heading' } },
        ]
      },
      {
        type: 'div',
        styles: { key: 'logoRow' },
        children: [
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'logoImage' } },
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'logoImage' } },
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'logoImage' } },
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'logoImage' } },
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'logoImage' } },
          { type: 'image', content: PLACEHOLDER_IMAGES.builder, styles: { key: 'logoImage' } },
        ]
      }
    ]
  },

  // ── Steps / Process ───────────────────────────────────────────────
  sectionEleven: {
    type: 'section',
    label: 'Steps / Process',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#FFFFFF',
        padding: '80px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '16px',
        textAlign: 'center',
      },
      paragraph: {
        ...defaultSectionStyles.paragraph,
        fontSize: '1.125rem',
        color: '#6B7280',
        marginBottom: '48px',
        textAlign: 'center',
      },
      stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '40px',
        width: '100%',
        maxWidth: '1000px',
      },
      stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px 24px',
      },
      stepNumber: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        fontSize: '1.5rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
      },
      stepTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
      },
      stepDescription: {
        fontSize: '1rem',
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: '1.6',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'How It Works', styles: { key: 'heading' } },
          { type: 'paragraph', content: 'Get started in three simple steps.', styles: { key: 'paragraph' } },
        ]
      },
      {
        type: 'gridLayout',
        styles: { key: 'stepsGrid' },
        children: [
          {
            type: 'div',
            styles: { key: 'stepItem' },
            children: [
              { type: 'span', content: '1', styles: { key: 'stepNumber' } },
              { type: 'heading', content: 'Create Account', styles: { key: 'stepTitle' } },
              { type: 'paragraph', content: 'Sign up in seconds with just your email. No credit card required.', styles: { key: 'stepDescription' } },
            ]
          },
          {
            type: 'div',
            styles: { key: 'stepItem' },
            children: [
              { type: 'span', content: '2', styles: { key: 'stepNumber' } },
              { type: 'heading', content: 'Choose a Template', styles: { key: 'stepTitle' } },
              { type: 'paragraph', content: 'Pick from dozens of professionally designed templates to get started quickly.', styles: { key: 'stepDescription' } },
            ]
          },
          {
            type: 'div',
            styles: { key: 'stepItem' },
            children: [
              { type: 'span', content: '3', styles: { key: 'stepNumber' } },
              { type: 'heading', content: 'Publish & Share', styles: { key: 'stepTitle' } },
              { type: 'paragraph', content: 'Go live with one click and share your site with the world.', styles: { key: 'stepDescription' } },
            ]
          },
        ]
      }
    ]
  },

  // ── Testimonial Slider ────────────────────────────────────────────
  sectionTwelve: {
    type: 'section',
    label: 'Testimonial Slider',
    styles: {
      section: {
        ...defaultSectionStyles.section,
        backgroundColor: '#F9FAFB',
        padding: '80px 40px',
      },
      content: {
        ...defaultSectionStyles.contentWrapper,
        maxWidth: '800px',
        alignItems: 'center',
        textAlign: 'center',
      },
      heading: {
        ...defaultSectionStyles.heading,
        fontSize: '2.5rem',
        marginBottom: '48px',
        textAlign: 'center',
      },
      carouselWrapper: {
        width: '100%',
        maxWidth: '700px',
      },
    },
    children: [
      {
        type: 'div',
        styles: { key: 'content' },
        children: [
          { type: 'heading', content: 'What Our Customers Say', styles: { key: 'heading' } },
        ]
      },
      {
        type: 'carousel',
        content: JSON.stringify({
          slides: [
            { body: '"This platform completely transformed how we build websites. The drag-and-drop interface is incredibly intuitive." — Sarah M., Designer' },
            { body: '"We shipped our landing page in under an hour. The templates are beautiful and easy to customize." — James T., Startup Founder' },
            { body: '"Best builder I\'ve used. The Web3 integration was the cherry on top for our DeFi project." — Alex K., Developer' },
          ],
          autoPlay: true,
          interval: 5000,
        }),
        styles: { key: 'carouselWrapper' },
      }
    ]
  },
};
