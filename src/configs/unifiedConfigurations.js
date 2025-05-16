import { defaultSectionStyles } from '../Elements/Sections/ContentSections/defaultSectionStyles';

// Unified configuration structure for all components
export const unifiedConfigurations = {
  // Navbar configurations
  navbar: {
    customTemplate: {
      type: 'navbar',
      label: 'Custom Navbar',
      previewImage: './img/previsu-custom-navbar.png',
      styles: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      },
      children: [
        {
          type: 'image',
          content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
          styles: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            objectFit: 'cover'
          }
        },
        {
          type: 'span',
          content: 'Website Name',
          styles: {
            fontSize: '1.1rem',
            fontWeight: '500'
          }
        },
        {
          type: 'button',
          content: 'Connect Wallet',
          styles: {
            backgroundColor: '#5C4EFA',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px'
          }
        }
      ]
    },
    twoColumn: {
      type: 'navbar',
      label: 'Two Columns',
      previewImage: './img/previsu-two-columns-navbar.png',
      styles: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          },
          children: [
            {
              type: 'image',
              content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
              styles: {
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover'
              }
            },
            {
              type: 'span',
              content: 'Website Name',
              styles: {
                fontSize: '1.1rem',
                fontWeight: '500'
              }
            }
          ]
        },
        {
          type: 'div',
          styles: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          },
          children: [
            {
              type: 'button',
              content: 'Sign In',
              styles: {
                backgroundColor: 'transparent',
                color: '#1a1a1a',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }
            },
            {
              type: 'button',
              content: 'Connect Wallet',
              styles: {
                backgroundColor: '#5C4EFA',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px'
              }
            }
          ]
        }
      ]
    },
    defiNavbar: {
      type: 'navbar',
      label: 'DeFi Navbar',
      previewImage: './img/previsu-defi-navbar.png',
      styles: {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        borderBottom: '1px solid #333',
        padding: '16px 24px'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          },
          children: [
            {
              type: 'image',
              content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
              styles: {
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover'
              }
            },
            {
              type: 'span',
              content: 'DeFi Dashboard',
              styles: {
                fontSize: '1.1rem',
                fontWeight: '500',
                color: '#ffffff'
              }
            }
          ]
        },
        {
          type: 'div',
          styles: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          },
          children: [
            {
              type: 'button',
              content: 'Connect Wallet',
              styles: {
                backgroundColor: '#5C4EFA',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px'
              }
            }
          ]
        }
      ]
    }
  },

  // Hero configurations
  hero: {
    heroOne: {
      type: 'hero',
      label: 'Basic Hero',
      previewImage: './img/previsu-basic-hero.png',
      styles: {
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        backgroundColor: '#f5f5f5'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '800px',
            textAlign: 'center'
          },
          children: [
            {
              type: 'heading',
              content: 'Welcome to Our Platform',
              styles: {
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#1a1a1a'
              }
            },
            {
              type: 'paragraph',
              content: 'Discover the future of web development with our powerful tools and features.',
              styles: {
                fontSize: '1.25rem',
                color: '#4a5568',
                lineHeight: '1.6'
              }
            },
            {
              type: 'button',
              content: 'Get Started',
              styles: {
                backgroundColor: '#5C4EFA',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                alignSelf: 'center'
              }
            }
          ]
        }
      ]
    },
    heroTwo: {
      type: 'hero',
      label: 'Small Hero',
      previewImage: './img/previsu-small-hero.png',
      styles: {
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#ffffff'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '600px',
            textAlign: 'center'
          },
          children: [
            {
              type: 'heading',
              content: 'Quick Start',
              styles: {
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1a1a1a'
              }
            },
            {
              type: 'paragraph',
              content: 'Start building your website in minutes with our intuitive tools.',
              styles: {
                fontSize: '1.1rem',
                color: '#4a5568'
              }
            },
            {
              type: 'button',
              content: 'Learn More',
              styles: {
                backgroundColor: '#5C4EFA',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                alignSelf: 'center'
              }
            }
          ]
        }
      ]
    },
    heroThree: {
      type: 'hero',
      label: 'Advanced Hero',
      previewImage: './img/previsu-advanced-hero.png',
      styles: {
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 40px',
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            maxWidth: '600px'
          },
          children: [
            {
              type: 'heading',
              content: 'Build Something Amazing',
              styles: {
                fontSize: '3.5rem',
                fontWeight: 'bold',
                color: '#ffffff'
              }
            },
            {
              type: 'paragraph',
              content: 'Create stunning websites with our advanced features and customizable components.',
              styles: {
                fontSize: '1.25rem',
                color: '#a0aec0',
                lineHeight: '1.8'
              }
            },
            {
              type: 'div',
              styles: {
                display: 'flex',
                gap: '16px'
              },
              children: [
                {
                  type: 'button',
                  content: 'Get Started',
                  styles: {
                    backgroundColor: '#5C4EFA',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1.1rem'
                  }
                },
                {
                  type: 'button',
                  content: 'View Demo',
                  styles: {
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    border: '1px solid #ffffff'
                  }
                }
              ]
            }
          ]
        },
        {
          type: 'div',
          styles: {
            maxWidth: '500px'
          },
          children: [
            {
              type: 'image',
              content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
              styles: {
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }
            }
          ]
        }
      ]
    }
  },

  // CTA configurations
  cta: {
    ctaOne: {
      type: 'cta',
      label: 'Advanced CTA',
      previewImage: './img/previsu-advanced-cta.png',
      styles: {
        padding: '60px 20px',
        backgroundColor: '#f5f5f5'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          },
          children: [
            {
              type: 'heading',
              content: 'Get Started Today!',
              styles: {
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#1a1a1a'
              }
            },
            {
              type: 'paragraph',
              content: 'Sign up now and take the first step towards a better future.',
              styles: {
                fontSize: '1.25rem',
                color: '#4a5568',
                lineHeight: '1.6'
              }
            },
            {
              type: 'div',
              styles: {
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
              },
              children: [
                {
                  type: 'button',
                  content: 'Join Now',
                  styles: {
                    backgroundColor: '#5C4EFA',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1.1rem'
                  }
                },
                {
                  type: 'button',
                  content: 'Learn More',
                  styles: {
                    backgroundColor: 'transparent',
                    color: '#1a1a1a',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    border: '1px solid #e5e7eb'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    ctaTwo: {
      type: 'cta',
      label: 'Quick CTA',
      previewImage: './img/previsu-quick-cta.png',
      styles: {
        padding: '40px 20px',
        backgroundColor: '#ffffff'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
          },
          children: [
            {
              type: 'heading',
              content: 'Take Action Now!',
              styles: {
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1a1a1a'
              }
            },
            {
              type: 'div',
              styles: {
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              },
              children: [
                {
                  type: 'button',
                  content: 'Primary Action',
                  styles: {
                    backgroundColor: '#5C4EFA',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px'
                  }
                },
                {
                  type: 'button',
                  content: 'Secondary Action',
                  styles: {
                    backgroundColor: 'transparent',
                    color: '#1a1a1a',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // Section configurations
  section: {
    sectionOne: {
      type: 'section',
      label: 'Section One',
      previewImage: './img/previsu-section-one.png',
      styles: {
        ...defaultSectionStyles.section,
        backgroundColor: '#FFFFFF',
        padding: '60px'
      },
      children: [
        {
          type: 'div',
          styles: {
            ...defaultSectionStyles.contentWrapper,
            maxWidth: '600px'
          },
          children: [
            {
              type: 'heading',
              content: 'Welcome to Our Platform',
              styles: {
                ...defaultSectionStyles.heading,
                fontSize: '2.5rem',
                marginBottom: '16px'
              }
            },
            {
              type: 'paragraph',
              content: 'Discover the future of web development with our powerful tools and features.',
              styles: {
                ...defaultSectionStyles.paragraph,
                fontSize: '1.125rem',
                lineHeight: '1.7'
              }
            }
          ]
        },
        {
          type: 'div',
          styles: {
            ...defaultSectionStyles.imageContainer,
            maxWidth: '500px'
          },
          children: [
            {
              type: 'image',
              content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
              styles: {
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }
            }
          ]
        }
      ]
    },
    sectionTwo: {
      type: 'section',
      label: 'Section Two',
      previewImage: './img/previsu-section-two.png',
      styles: {
        ...defaultSectionStyles.section,
        backgroundColor: '#f5f5f5',
        padding: '60px'
      },
      children: [
        {
          type: 'div',
          styles: {
            ...defaultSectionStyles.contentWrapper,
            maxWidth: '800px',
            margin: '0 auto'
          },
          children: [
            {
              type: 'heading',
              content: 'Our Features',
              styles: {
                ...defaultSectionStyles.heading,
                fontSize: '2.5rem',
                marginBottom: '32px',
                textAlign: 'center'
              }
            },
            {
              type: 'div',
              styles: {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              },
              children: [
                {
                  type: 'div',
                  styles: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  },
                  children: [
                    {
                      type: 'heading',
                      content: 'Feature 1',
                      styles: {
                        fontSize: '1.5rem',
                        fontWeight: '600'
                      }
                    },
                    {
                      type: 'paragraph',
                      content: 'Description of feature 1 and its benefits.',
                      styles: {
                        color: '#4a5568'
                      }
                    }
                  ]
                },
                {
                  type: 'div',
                  styles: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  },
                  children: [
                    {
                      type: 'heading',
                      content: 'Feature 2',
                      styles: {
                        fontSize: '1.5rem',
                        fontWeight: '600'
                      }
                    },
                    {
                      type: 'paragraph',
                      content: 'Description of feature 2 and its benefits.',
                      styles: {
                        color: '#4a5568'
                      }
                    }
                  ]
                },
                {
                  type: 'div',
                  styles: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  },
                  children: [
                    {
                      type: 'heading',
                      content: 'Feature 3',
                      styles: {
                        fontSize: '1.5rem',
                        fontWeight: '600'
                      }
                    },
                    {
                      type: 'paragraph',
                      content: 'Description of feature 3 and its benefits.',
                      styles: {
                        color: '#4a5568'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // Web3 configurations
  web3: {
    defiSection: {
      type: 'defiSection',
      label: 'DeFi Dashboard',
      previewImage: './img/previsu-defi-dashboard.png',
      styles: {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '40px'
      },
      children: [
        {
          type: 'div',
          styles: {
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto'
          },
          children: [
            {
              type: 'heading',
              content: 'DeFi Dashboard',
              styles: {
                fontSize: '2rem',
                color: '#ffffff',
                marginBottom: '16px'
              }
            },
            {
              type: 'paragraph',
              content: 'Monitor your assets and track performance',
              styles: {
                color: '#a0aec0',
                fontSize: '1.1rem',
                marginBottom: '32px'
              }
            },
            {
              type: 'div',
              styles: {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              },
              children: [
                {
                  type: 'div',
                  styles: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '20px'
                  },
                  children: [
                    {
                      type: 'heading',
                      content: 'Total Value',
                      styles: {
                        color: '#ffffff',
                        fontSize: '1.5rem'
                      }
                    },
                    {
                      type: 'span',
                      content: '$0.00',
                      styles: {
                        color: '#5C4EFA',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }
                    }
                  ]
                },
                {
                  type: 'div',
                  styles: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '20px'
                  },
                  children: [
                    {
                      type: 'heading',
                      content: 'Asset Distribution',
                      styles: {
                        color: '#ffffff',
                        fontSize: '1.5rem'
                      }
                    },
                    {
                      type: 'div',
                      content: 'Pie Chart Placeholder',
                      styles: {
                        height: '200px'
                      }
                    }
                  ]
                },
                {
                  type: 'div',
                  styles: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '20px'
                  },
                  children: [
                    {
                      type: 'heading',
                      content: 'Recent Transactions',
                      styles: {
                        color: '#ffffff',
                        fontSize: '1.5rem'
                      }
                    },
                    {
                      type: 'div',
                      content: 'Transaction Table Placeholder',
                      styles: {
                        width: '100%'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },

  // Footer configurations
  footer: {
    customTemplate: {
      type: 'footer',
      label: 'Simple Footer',
      previewImage: './img/previsu-simple-footer.png',
      styles: {
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        borderTop: '1px solid #e5e5e5',
        padding: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      },
      children: [
        {
          type: 'image',
          content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
          styles: {
            width: '32px',
            height: '32px',
            objectFit: 'cover',
            borderRadius: '8px'
          }
        },
        {
          type: 'span',
          content: '© 2024 Your Company',
          styles: {
            color: '#1a1a1a',
            fontSize: '14px',
            fontWeight: '400'
          }
        }
      ]
    },
    defiFooter: {
      type: 'footer',
      label: 'DeFi Footer',
      previewImage: './img/previsu-defi-footer.png',
      styles: {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        borderTop: '1px solid #333',
        padding: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      },
      children: [
        {
          type: 'image',
          content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
          styles: {
            width: '32px',
            height: '32px',
            objectFit: 'cover',
            borderRadius: '8px'
          }
        },
        {
          type: 'span',
          content: '© 2024 DeFi Project',
          styles: {
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '400'
          }
        },
        {
          type: 'div',
          styles: {
            display: 'flex',
            gap: '16px'
          },
          children: [
            {
              type: 'link',
              content: 'Whitepaper',
              styles: {
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }
            },
            {
              type: 'link',
              content: 'Audit',
              styles: {
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }
            },
            {
              type: 'link',
              content: 'Governance',
              styles: {
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }
            },
            {
              type: 'link',
              content: 'Docs',
              styles: {
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }
            }
          ]
        }
      ]
    }
  }
}; 