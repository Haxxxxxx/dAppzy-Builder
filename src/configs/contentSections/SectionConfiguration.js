import { defaultSectionStyles } from '../../Elements/Sections/ContentSections/defaultSectionStyles';

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
      { type: 'image', content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7' }
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
  }
};
