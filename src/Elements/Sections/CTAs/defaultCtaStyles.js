

export const ctaOneStyles = {
  cta: {
    display: "flex",
    flexDirection: "row", // ✅ Two-column layout
    alignItems: "center",
    justifyContent: "space-between",
    padding: "40px",
    backgroundColor: "#f8f8f8",
    textAlign: "left",
    gap: "3rem",
    flexWrap: "wrap",
  },
  ctaContent: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "500px",
  },
  ctaTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
  },
  ctaDescription: {
    fontSize: "1.2rem",
    marginBottom: "24px",
    color: "#666",
  },
  buttonContainer: {
    display: "flex",
    gap: "16px",
    marginTop: "24px",
  },
  primaryButton: {
    padding: "12px 24px",
    backgroundColor: "#1a1aff",
    color: "#ffffff",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  secondaryButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#1a1aff",
    border: "2px solid #1a1aff",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  ctaImage: {
    maxWidth: "300px",
    height: "auto",
    objectFit: "cover",
    borderRadius: "8px",
  },
};

export const ctaTwoStyles = {
  cta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#1a1aff',
    color: '#ffffff',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#1a1aff',
    border: '2px solid #1a1aff',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};
 
export const defaultCtaStyles = {
  
}