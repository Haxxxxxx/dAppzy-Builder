// defaultSectionStyles.js
export const defaultSectionStyles = {
  section: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box',
    padding: '40px',
    backgroundColor: '#ffffff',
    gap: '24px'
  },
  contentWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '800px',
    margin: '0 auto'
  },
  buttonContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    marginTop: '10px',
    boxSizing: 'border-box',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '100%',
    margin: '0 auto'
  },
  labelContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center'
  },
  label: {
    color: '#001D6C',
    borderRadius: '4px',
    fontSize: '20px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '0',
  },
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
  // Top label (span)
  caption: {
    textTransform: 'uppercase',
    color: '#6B7280',
    fontSize: '0.875rem', // ~14px
    fontWeight: 700,
    marginBottom: '8px',
  },
  // Main heading
  heading: {
    color: '#1F2937',
    fontSize: '2rem', // ~32px
    fontWeight: 'bold',
    margin: '0 0 24px 0',
  },
  // Container for the 4 feature items
  featuresContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '24px',
    maxWidth: '1000px',
  },
  // Each feature item (icon + text)
  featureItem: {
    flex: '0 1 calc(25% - 24px)',
    minWidth: '180px',
    maxWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  // Icon/image inside each feature
  featureIcon: {
    width: '40px',
    height: '40px',
    marginBottom: '8px',
  },
  // Optional sub-heading inside each feature
  featureHeading: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: '#1F2937',
  },
  // Text inside each feature
  featureText: {
    fontSize: '0.875rem',
    lineHeight: '1.4',
    color: '#4B5563',
    margin: '0',
  },
  // Single primary button at the bottom
  primaryButton: {
    backgroundColor: '#334155',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};
