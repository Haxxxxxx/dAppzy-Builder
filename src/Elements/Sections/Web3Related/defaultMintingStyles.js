export const defaultMintingStyles = {
  mintingSection: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: '40px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  mintingContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '20px'
  },
  mintingTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#ffffff'
  },
  mintingDescription: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
    color: '#e0e0e0'
  },
  mintingModule: {
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(42, 42, 60, 0.6)',
    borderRadius: '12px',
    padding: '24px',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  mintingButton: {
    background: 'linear-gradient(135deg, #5C4EFA, #7B6CFF)',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    width: '100%',
  }
}; 