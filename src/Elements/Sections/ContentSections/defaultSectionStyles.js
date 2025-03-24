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
    padding: '20px',
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



export const customTemplateSectionStyles = {
  sectionContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '40px',
    backgroundColor: '#ffffff',
    gap: '10vw',
  },
  contentWrapper: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '20px',
  },
  caption: {
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: '8px',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  paragraph: {
    fontSize: '1rem',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  primaryButton: {
    backgroundColor: '#334155',
    color: '#ffffff',
    padding: '12px 24px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#334155',
    padding: '12px 24px',
    border: '2px solid #334155',
    fontWeight: 'bold',
    cursor: 'pointer',
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
    borderRadius: '8px',
  },
};

export const sectionTwoStyles = {
  sectionContainer: {
    backgroundColor: '#6B7280',
    color: '#fff',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: '8px',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  paragraph: {
    fontSize: '1rem',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  primaryButton: {
    border: 'none',
    backgroundColor: '#334155',
    color: '#fff',
    cursor: 'pointer',
    padding: '10px 20px',
    borderRadius: '4px',
  },
};
