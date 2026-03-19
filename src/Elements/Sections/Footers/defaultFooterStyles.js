// ── Shared footer style objects (identical across all variants) ──
const sharedFooterContent = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 1rem',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2rem',
  backgroundColor: 'transparent'
};

const sharedFooterText = {
  fontSize: '0.875rem',
  color: '#ffffff',
  textAlign: 'center',
  margin: '0',
  padding: '0',
  lineHeight: '1.5',
  cursor: 'text',
  border: 'none',
  outline: 'none',
  display: 'inline-block'
};

const sharedFooterButton = {
  backgroundColor: 'var(--purple, #5C4EFA)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  fontWeight: '500',
  outline: 'none',
  '&:hover': {
    backgroundColor: '#3D60FF'
  }
};

// ── Variant exports ──

export const SimplefooterStyles = {
  footerSection: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: '1rem',
    marginTop: 'auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderTop: '1px solid #333',
    gap: '2rem'
  },
  footerTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '1rem',
    textAlign: 'center',
    lineHeight: '1.5',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    cursor: 'text',
  },
  footerContent: sharedFooterContent,
  footerText: sharedFooterText,
  footerButton: sharedFooterButton
};

export const DetailedFooterStyles = {
  footerSection: {
    width: '100%',
    backgroundColor: '#1F2937',
    color: '#ffffff',
    padding: '1rem',
    marginTop: 'auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderTop: '1px solid #374151',
    gap: '2rem'
  },
  footerTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '1rem',
    textAlign: 'center',
    lineHeight: '1.5',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    cursor: 'text',
    border: 'none',
    outline: 'none'
  },
  footerDescription: {
    fontSize: '1rem',
    color: '#a0a0a0',
    lineHeight: '1.5',
    marginBottom: '1rem',
    textAlign: 'center',
    maxWidth: '600px',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    cursor: 'text',
    border: 'none',
    outline: 'none'
  },
  footerContent: sharedFooterContent,
  footerText: sharedFooterText,
  footerButton: sharedFooterButton
};

export const TemplateFooterStyles = {
  footerSection: {
    width: '100%',
    backgroundColor: '#2D3748',
    color: '#ffffff',
    padding: '1rem',
    marginTop: 'auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderTop: '1px solid #4A5568',
    gap: '2rem'
  },
  footerTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '1rem',
    textAlign: 'center',
    lineHeight: '1.5',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    cursor: 'text',
    border: 'none',
    outline: 'none'
  },
  footerDescription: {
    fontSize: '1rem',
    color: '#a0a0a0',
    lineHeight: '1.5',
    marginBottom: '1rem',
    textAlign: 'center',
    maxWidth: '600px',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    cursor: 'text',
    border: 'none',
    outline: 'none'
  },
  footerContent: sharedFooterContent,
  footerText: sharedFooterText,
  footerButton: sharedFooterButton
};

export const DeFiFooterStyles = {
  footerSection: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    color: '#ffffff',
    padding: '1rem',
    marginTop: 'auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderTop: '1px solid #333',
    gap: '2rem'
  },
  footerLogo: {
    width: '150px',
    height: 'auto',
    marginBottom: '1rem'
  },
  footerTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '1rem',
    textAlign: 'center',
    lineHeight: '1.5',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    cursor: 'text',
    border: 'none',
    outline: 'none'
  },
  footerDescription: {
    fontSize: '1rem',
    color: '#a0a0a0',
    lineHeight: '1.5',
    marginBottom: '1rem',
    textAlign: 'center',
    maxWidth: '600px',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    cursor: 'text',
    border: 'none',
    outline: 'none'
  },
  footerLink: {
    color: 'var(--purple, #5C4EFA)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#3D60FF'
    }
  },
  footerContent: sharedFooterContent,
  footerText: sharedFooterText,
  footerButton: sharedFooterButton
};
