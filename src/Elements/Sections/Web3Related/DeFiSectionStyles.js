export const defiSectionStyles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    padding: '2rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    color: '#fff',
    minHeight: '500px',
    width: '100%',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#16213e',
    borderRadius: '12px',
    marginBottom: '1rem',
  },

  logo: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },

  description: {
    fontSize: '1rem',
    color: '#a0aec0',
    marginBottom: '2rem',
  },

  modulesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  },

  module: {
    backgroundColor: '#242442',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'transform 0.2s ease-in-out',
    cursor: 'pointer',
    border: '1px solid #2a2a4a',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    },
  },

  moduleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },

  moduleIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#2a2a4a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moduleTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },

  moduleContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  stats: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
  },

  statLabel: {
    color: '#a0aec0',
    fontSize: '0.875rem',
  },

  statValue: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
  },

  actionButton: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4facfe',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#00f2fe',
    },
    '&:disabled': {
      backgroundColor: '#2a2a4a',
      cursor: 'not-allowed',
    },
  },

  // Module-specific styles
  swapModule: {
    backgroundColor: '#242442',
    backgroundImage: 'linear-gradient(135deg, rgba(79,172,254,0.1) 0%, rgba(0,242,254,0.1) 100%)',
  },

  stakeModule: {
    backgroundColor: '#242442',
    backgroundImage: 'linear-gradient(135deg, rgba(130,87,229,0.1) 0%, rgba(214,75,254,0.1) 100%)',
  },

  lendModule: {
    backgroundColor: '#242442',
    backgroundImage: 'linear-gradient(135deg, rgba(67,233,123,0.1) 0%, rgba(56,249,215,0.1) 100%)',
  },

  walletInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#2a2a4a',
    borderRadius: '8px',
    marginBottom: '1rem',
  },

  walletAddress: {
    fontSize: '0.875rem',
    color: '#a0aec0',
  },

  walletBalance: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },

  error: {
    color: '#ff4d4d',
    fontSize: '0.875rem',
    padding: '0.5rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,77,77,0.1)',
    marginTop: '1rem',
  },
}; 