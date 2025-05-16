export const defaultDeFiStyles = {
  defiSection: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px',
    margin: '0',
    backgroundColor: 'rgba(42, 42, 60, 0.5)',
    outline: '2px solid var(--purple, #5C4EFA)',
    borderInline: '0.5px solid var(--purple, #5C4EFA)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  },
  defiContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '20px'
  },
  defiModule: {
    position: 'relative',
    boxSizing: 'border-box',
    padding: '10px',
    margin: '10px 0',
    backgroundColor: 'rgba(42, 42, 60, 0.5)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease'
  },
  defiModuleContent: {
    padding: '20px'
  },
  defiModuleTitle: {
    margin: '0 0 10px 0',
    fontSize: '1.5rem',
    color: '#fff',
    fontWeight: 'bold'
  },
  defiModuleDescription: {
    margin: '0 0 20px 0',
    color: '#ccc',
    fontSize: '1rem',
    lineHeight: '1.5'
  },
  defiModuleStats: {
    display: 'grid',
    gap: '15px',
    marginBottom: '20px'
  },
  defiModuleStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px'
  },
  defiModuleStatLabel: {
    color: '#ccc',
    fontSize: '0.9rem'
  },
  defiModuleStatValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  defiModuleButton: {
    backgroundColor: '#2A2A3C',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#3A3A4C'
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed'
    }
  },
  defiTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#ffffff',
    textAlign: 'center'
  },
  defiDescription: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
    color: '#e0e0e0',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 2rem'
  },
  defiButton: {
    backgroundColor: '#5C4EFA',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    '&:hover': {
      backgroundColor: '#4338CA'
    }
  }
}; 