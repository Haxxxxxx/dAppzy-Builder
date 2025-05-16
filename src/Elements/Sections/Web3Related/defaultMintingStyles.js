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
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
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
  mintingButton: {
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