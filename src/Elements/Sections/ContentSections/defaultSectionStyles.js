// defaultSectionStyles.js

export const defaultSectionStyles = {
  sectionContainer: {
    position: 'relative', // enables absolute positioning relative to this container
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#f9f9f9',
    flexDirection: 'column',
  },
  contentWrapper: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0',
    marginTop:'0',
  },
  paragraph: {
    fontSize: '1rem',
    lineHeight: '1.5',
    marginBottom: '24px',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#0F62FE',
    color: '#ffffff',
    padding: '12px 24px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    FontFace: 'Roboto',
    border: '2px solid #0F62FE',

  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#0F62FE',
    padding: '12px 24px',
    border: '2px solid #0F62FE',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    marginTop: '10px',
  },
  // Label style for the top left
  label: {
    color: '#001D6C',
    borderRadius: '4px',
    fontSize: '20px',
    FontFace: 'Roboto',
    fontWeight: '700',
    textTransform: 'uppercase',

  },
  imageContainer: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '600px',
    textAlign: 'center',
    marginTop: '20px',
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
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
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
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
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
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    justifyContent:'center',

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
  // Outer container for the entire section
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
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
