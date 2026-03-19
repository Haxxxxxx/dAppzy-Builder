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
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  },
  defiContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '20px'
  },
  defiModule: {
    position: 'relative',
    boxSizing: 'border-box',
    padding: '10px',
    margin: '0',
    backgroundColor: 'rgba(42, 42, 60, 0.6)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  defiModuleStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px'
  },
  defiModuleStatLabel: {
    color: '#999',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  defiModuleStatValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  defiModuleButton: {
    background: 'linear-gradient(135deg, #5C4EFA, #7B6CFF)',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
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
  }
}; 