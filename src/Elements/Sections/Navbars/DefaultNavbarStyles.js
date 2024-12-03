export const defaultNavbarStyles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    flexWrap: 'wrap',
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
};

export const CustomTemplateNavbarStyles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    flexWrap: 'wrap',
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
    width: '100%',
    marginTop: '16px',
    backgroundColor: '#ffffff',
    padding: '16px',
    position: 'absolute',
    top: '100%',
    left: '0',
    zIndex: '10',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  compactMenu: {
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)', // Deeper shadow for custom compact menu
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
};
