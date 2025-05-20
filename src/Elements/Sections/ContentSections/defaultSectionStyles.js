// defaultSectionStyles.js
export const defaultSectionStyles = {
  section: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: '0',
    backgroundColor: 'transparent',
    gap: '0',
    transition: 'none',
  },
  contentWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    boxSizing: 'border-box',
    maxWidth: 'none',
    margin: '0',
    padding: '0',
  },
  buttonContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    marginTop: '0',
    boxSizing: 'border-box',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    maxWidth: 'none',
    margin: '0',
    overflow: 'visible',
    borderRadius: '0',
    boxShadow: 'none',
  },
  image: {
    width: 'auto',
    height: 'auto',
    objectFit: 'cover',
    maxWidth: '100%',
    maxHeight: '100%',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)'
    }
  },
  labelContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    boxSizing: 'border-box',
    textAlign: 'center'
  },
  label: {
    color: '#0F62FE',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    padding: '4px 12px',
    backgroundColor: 'rgba(15, 98, 254, 0.1)',
    display: 'inline-block'
  },
  heading: {
    color: '#1F2937',
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '24px',
    letterSpacing: '-0.02em'
  },
  paragraph: {
    color: '#4B5563',
    fontSize: '1.125rem',
    lineHeight: '1.7',
    marginBottom: '32px',
    maxWidth: '600px'
  },
  primaryButton: {
    backgroundColor: '#0F62FE',
    color: '#FFFFFF',
    padding: '14px 28px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#0043CE',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(15, 98, 254, 0.2)'
    }
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#0F62FE',
    padding: '14px 28px',
    fontWeight: '600',
    border: '2px solid #0F62FE',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(15, 98, 254, 0.1)',
      transform: 'translateY(-1px)'
    }
  }
};

// sectionThreeStyles.js
export const sectionThreeStyles = {
  section: {
    ...defaultSectionStyles.section,
    backgroundColor: '#ffffff',
    padding: '60px 40px'
  },
  contentWrapper: {
    ...defaultSectionStyles.contentWrapper,
    textAlign: 'center'
  },
  buttonContainer: {
    ...defaultSectionStyles.buttonContainer,
    justifyContent: 'center'
  },
  imageContainer: {
    ...defaultSectionStyles.imageContainer,
    maxWidth: '600px'
  },
  labelContainer: {
    ...defaultSectionStyles.labelContainer,
    textAlign: 'center'
  },
  // "Caption" style
  caption: {
    textTransform: 'uppercase',
    color: '#6B7280',
    fontSize: '0.875rem',   // ~14px
    fontWeight: 700,
    marginBottom: '8px',
  },
  heading: {
    color: '#1F2937',
    fontSize: '2rem',       // ~32px
    fontWeight: 'bold',
    margin: '0 0 16px 0',
  },
  paragraph: {
    color: '#4B5563',
    fontSize: '1rem',       // ~16px
    lineHeight: '1.5',
    margin: '0 0 24px 0',
  },
};

// sectionTwoStyles.js
export const sectionTwoStyles = {
  section: {
    ...defaultSectionStyles.section,
    backgroundColor: '#f9f9f9',
    padding: '60px 40px'
  },
  contentWrapper: {
    ...defaultSectionStyles.contentWrapper,
    textAlign: 'center'
  },
  buttonContainer: {
    ...defaultSectionStyles.buttonContainer,
    justifyContent: 'center'
  },
  imageContainer: {
    ...defaultSectionStyles.imageContainer,
    maxWidth: '600px'
  },
  labelContainer: {
    ...defaultSectionStyles.labelContainer,
    textAlign: 'center'
  },
  // "Caption" style
  caption: {
    textTransform: 'uppercase',
    color: '#6B7280',
    fontSize: '0.875rem',   // ~14px
    fontWeight: 700,
    marginBottom: '8px',
  },
  heading: {
    color: '#1F2937',
    fontSize: '2rem',       // ~32px
    fontWeight: 'bold',
    margin: '0 0 16px 0',
  },
  paragraph: {
    color: '#4B5563',
    fontSize: '1rem',       // ~16px
    lineHeight: '1.5',
    margin: '0 0 24px 0',
    maxWidth: '600px',
  },
  primaryButton: {
    backgroundColor: '#334155',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#334155',
    padding: '12px 24px',
    border: '2px solid #334155',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};

// sectionFourStyles.js
export const sectionFourStyles = {
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
  }
};
