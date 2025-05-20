export const defaultNavbarStyles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: '16px',
    backgroundColor: '#ffffff',
    position: 'relative',
    borderBottom: '1px solid transparent',
    borderRadius: '4px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  compactMenuIcon: {
    cursor: 'pointer',
  },
  compactMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
    backgroundColor: '#fff',
    width: '100%',
    position: 'absolute',
    top: '100%',
    left: 0,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '16px',
  },
  standardMenuContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    gap: '16px',
    padding: 0,
    margin: 0,
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backgroundColor: '#f5f5f5',
    color: '#333',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  primaryButton: {
    backgroundColor: '#1976d2',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: '1px solid #1976d2',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
  },
};

export const CustomTemplateNavbarStyles = {
  nav: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    position: 'relative',
    borderBottom: '1px solid transparent',
    borderRadius: '4px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2vh',
  },
  compactMenuIcon: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
    padding: '16px',
    zIndex: '10',
  },
  compactMenu: {
    position: "absolute",
    top: '100%',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center'
  },
  standardMenuContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  buttonContainer: {
    fontFamily: "'Roboto', sans-serif",
    display: 'flex',
    gap: '16px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa',
    color: '#212529',
    '&:hover': {
      backgroundColor: '#e9ecef',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#0b5ed7',
    },
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#0d6efd',
    border: '2px solid #0d6efd',
    '&:hover': {
      backgroundColor: 'rgba(13, 110, 253, 0.04)',
    },
  },
};
