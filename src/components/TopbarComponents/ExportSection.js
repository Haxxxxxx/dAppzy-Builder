import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { pinata, pinataSDK, pinataConfig } from '../../utils/configPinata';
import { renderElementToHtml } from '../../utils/htmlRender'; // Your render method
import { defaultHeroStyles, CustomTemplateHeroStyles, heroTwoStyles } from '../../Elements/Sections/Heros/defaultHeroStyles';
import { ctaOneStyles, ctaTwoStyles } from '../../Elements/Sections/CTAs/defaultCtaStyles';
import { defaultDeFiStyles } from '../../Elements/Sections/Web3Related/DeFiSection';
// Import your hierarchy builder – this should nest elements with a valid parentId.
import { buildHierarchy } from '../../utils/LeftBarUtils/elementUtils';
import { SimplefooterStyles, TemplateFooterStyles } from '../../Elements/Sections/Footers/defaultFooterStyles';
import { structureConfigurations } from '../../configs/structureConfigurations';
import { pinDirectoryToPinata } from '../../utils/ipfs';
import '../css/Topbar.css';
const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Helper: Convert camelCase to kebab-case.
 */
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Helper: Merge default styles into an element.
 * For hero elements, we merge the appropriate default style (including heroTwoStyles)
 * with any user overrides. Extend this function as needed.
 */
function mergeDefaultsIntoElement(element) {
  // Handle hero elements
  if (element.type === 'hero') {
    let baseHeroSection = defaultHeroStyles.heroSection;
    if (element.configuration === 'heroThree' || element.configuration === 'customTemplate') {
      baseHeroSection = CustomTemplateHeroStyles.heroSection;
    } else if (element.configuration === 'heroTwo') {
      baseHeroSection = heroTwoStyles.heroSection;
    }
    element.styles = {
      ...baseHeroSection,
      ...element.styles,
    };
  }
  
  // Handle CTA elements
  if (element.type === 'cta') {
    const ctaStyles = element.configuration === 'ctaTwo' ? ctaTwoStyles : ctaOneStyles;
    element.styles = {
      ...ctaStyles.ctaSection,
      ...element.styles,
    };
  }

  // Handle DeFi elements
  if (element.type === 'defi') {
    element.styles = {
      ...defaultDeFiStyles.section,
      ...element.styles,
    };
  }

  // Handle form elements
  if (element.type === 'input' || element.type === 'textarea' || element.type === 'button') {
    const defaultFormStyles = {
      input: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
      },
      textarea: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        minHeight: '100px',
      },
      button: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      }
    };
    element.styles = {
      ...defaultFormStyles[element.type],
      ...element.styles,
    };
  }

  // Handle text elements
  if (element.type === 'paragraph' || element.type === 'heading') {
    const defaultTextStyles = {
      paragraph: {
        fontSize: '16px',
        lineHeight: '1.5',
        margin: '0 0 16px 0',
      },
      heading: {
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }
    };
    element.styles = {
      ...defaultTextStyles[element.type],
      ...element.styles,
    };
  }

  return element;
}

/**
 * Helper: Process styles for export
 * This ensures styles are properly formatted and includes any necessary vendor prefixes
 */
function processStylesForExport(styles) {
  const processedStyles = { ...styles };
  
  // Handle vendor prefixes
  if (styles.transform) {
    processedStyles.WebkitTransform = styles.transform;
    processedStyles.MozTransform = styles.transform;
    processedStyles.msTransform = styles.transform;
  }
  
  if (styles.transition) {
    processedStyles.WebkitTransition = styles.transition;
    processedStyles.MozTransition = styles.transition;
    processedStyles.msTransition = styles.transition;
  }
  
  // Handle special cases
  if (styles.backgroundImage) {
    processedStyles.backgroundImage = styles.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, (match, url) => {
      return `url('${url}')`;
    });
  }
  
  return processedStyles;
}

function processElementStyles(element) {
  // Special handling for footer elements
  if (element.type === 'footer') {
    let defaultStyles = {};
    if (element.configuration === 'customTemplateFooter') {
      defaultStyles = SimplefooterStyles.footer;
    } else if (element.configuration === 'templateFooter') {
      defaultStyles = TemplateFooterStyles.footer;
    }
    
    // Merge default styles with custom styles
    return {
      ...defaultStyles,
      ...element.styles,
      ...element.inlineStyles
    };
  }
  
  // For non-footer elements, return original styles
  return {
    ...element.styles,
    ...element.inlineStyles
  };
}

function cleanEmptyDivs(html) {
  // Remove empty divs with only style attributes
  return html.replace(/<div style="[^"]*"><\/div>/g, '');
}

function fixClassName(html) {
  // Replace classname with class
  return html.replace(/classname=/g, 'class=');
}

/**
 * exportProject
 * • Builds a hierarchy from the flat element tree.
 * • Merges default styles into each element (recursively).
 * • Renders the HTML using your renderElementToHtml function.
 * • Injects global styles and wraps the content in a main container.
 */
function exportProject(elements, websiteSettings) {
  let bodyHtml = '';
  const processedElements = new Set();
  const collectedStyles = [];
  const userScripts = new Set();

  // Helper to convert camelCase to kebab-case
  function camelToKebab(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Helper to validate and format color values
  function formatColorValue(value) {
    if (!value || typeof value !== 'string') return '';
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) return value;
    if (/^[a-zA-Z]+$/.test(value)) return value;
    if (/^(rgb|rgba|hsl|hsla)/.test(value)) return value;
    if (/^[A-Fa-f0-9]{6}$/.test(value)) return `#${value}`;
    return value;
  }

  // Helper to process element styles
  function processElementStyles(element) {
    // Get base styles from configuration
    const structureConfig = element.configuration ? 
      structureConfigurations[element.configuration] : null;
    
    // Merge styles in order: configuration defaults -> element styles -> inline styles
    const mergedStyles = {
      ...(structureConfig?.styles || {}),
      ...(element.styles || {}),
      ...(element.inlineStyles || {})
    };

    // Remove editor-specific styles
    const { outline, boxShadow, ...productionStyles } = mergedStyles;

    // Process color values
    Object.entries(productionStyles).forEach(([key, value]) => {
      if (key.includes('color') || key.includes('background')) {
        productionStyles[key] = formatColorValue(value);
      }
    });

    return productionStyles;
  }

  // Helper to generate style string
  function getStyleString(element) {
    const processedStyles = processElementStyles(element);
    return Object.entries(processedStyles)
      .filter(([k, v]) => k != null && v != null)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }

  // Helper to sanitize class names
  function sanitizeClassName(className) {
    if (!className) return '';
    return className.replace(/class=/g, 'className=');
  }

  // Helper to clean up empty divs
  function cleanEmptyDivs(html) {
    return html.replace(/<div[^>]*>\s*<\/div>/g, '');
  }

  // Helper to fix class names
  function fixClassName(html) {
    return html.replace(/className=/g, 'class=');
  }

  // Helper to build element hierarchy
  function buildElementHierarchy(elements) {
    const elementMap = new Map();
    const rootElements = [];

    // First pass: create element map
    elements.forEach(element => {
      elementMap.set(element.id, { ...element, children: [] });
    });

    // Second pass: build hierarchy
    elements.forEach(element => {
      const mappedElement = elementMap.get(element.id);
      if (element.parentId) {
        const parent = elementMap.get(element.parentId);
        if (parent) {
          parent.children.push(mappedElement);
        }
      } else {
        rootElements.push(mappedElement);
      }
    });

    return rootElements;
  }

  // Process elements and build HTML
  const hierarchicalElements = buildElementHierarchy(elements);
  
  // Render each root element and its children recursively
  hierarchicalElements.forEach(element => {
    if (!processedElements.has(element.id)) {
      const renderedContent = renderElementToHtml({
        ...element,
        style: getStyleString(element),
        className: element.className ? `${sanitizeClassName(element.className)} ${element.id}` : element.id,
        ...(element.attributes || {}),
        ...(element.dataAttributes || {}),
        ...(element.events || {})
      }, collectedStyles);

      if (renderedContent) {
        let cleanedContent = cleanEmptyDivs(renderedContent);
        cleanedContent = fixClassName(cleanedContent);
        bodyHtml += cleanedContent;
        processedElements.add(element.id);
      }
    }
  });

  // Generate styles HTML
  const stylesHtml = `
    <style>
      /* Reset and base styles */
      * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.5;
        color: #333;
      }

      .main-content {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      /* Element-specific styles */
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background-color: #1a1a1a;
        color: #ffffff;
        border-bottom: 1px solid #333;
      }

      .navbar .image {
        margin-right: 12px;
      }

      .navbar .text {
        font-size: 1.1rem;
        font-weight: 500;
      }

      .defi-section {
        flex: 1;
        padding: 40px;
        background-color: #1a1a1a;
        color: #ffffff;
      }

      .footer {
        width: 100%;
        background-color: #1a1a1a;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 24px;
        border-top: 1px solid #333;
        box-sizing: border-box;
      }

      .footer .image {
        margin-right: 12px;
      }

      .footer .link {
        margin-left: 24px;
      }

      .footer .link:first-of-type {
        margin-left: 0;
      }

      .module {
        border-radius: 8px;
        background-color: #2a2a2a;
        padding: 20px;
        margin-bottom: 16px;
        color: #ffffff;
      }

      .title {
        margin-bottom: 16px;
        font-size: 2rem;
        color: #fff;
      }

      .description {
        color: #bbb;
        margin-bottom: 32px;
        font-size: 1.1rem;
      }

      .image {
        border-radius: 8px;
        width: 32px;
        height: 32px;
        object-fit: cover;
      }

      .link {
        font-size: 14px;
        text-decoration: none;
        color: #ffffff;
        font-weight: 500;
        transition: color 0.2s ease;
      }

      .link:hover {
        color: #5C4EFA;
      }

      .connect-wallet-button {
        font-weight: 500;
        border-radius: 6px;
        padding: 8px 16px;
        background-color: #5C4EFA;
        transition: all 0.2s ease;
        font-size: 14px;
        cursor: pointer;
        border: none;
        color: #ffffff;
        margin-left: auto;
      }

      .connect-wallet-button:hover {
        background-color: #4a3ed9;
      }

      .text {
        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
      }

      /* Footer link container */
      .footer-links {
        display: flex;
        align-items: center;
        gap: 24px;
      }

      /* Footer left section */
      .footer-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* Footer right section */
      .footer-right {
        display: flex;
        align-items: center;
        gap: 24px;
      }

      ${collectedStyles.map(style => `
        .${style.className} {
          ${Object.entries(style.styles)
            .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
            .join(';\n          ')}
        }
      `).join('\n')}
    </style>
  `;

  // Generate the final HTML
  const title = websiteSettings.siteTitle || 'Exported Website';
  const favicon = websiteSettings.faviconUrl || '/favicon.ico';

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" href="${favicon}">
      <title>${title}</title>
      ${stylesHtml}
    </head>
    <body>
      <div class="main-content">
          ${bodyHtml}
      </div>
    </body>
    </html>
  `.trim();

  return fullHtml;
}

const ExportSection = ({ elements, websiteSettings, userId, projectId, onProjectPublished }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanElementData = (element) => {
    if (!element) {
      console.warn('Received null or undefined element');
      return null;
    }

    try {
      // Log the element being processed
      console.log('Processing element:', element);

      // Create a new object with only valid properties
      const cleanedElement = {
        id: element.id || '',
        type: element.type || '',
        content: element.content || '',
        parentId: element.parentId || null,
        children: Array.isArray(element.children) ? element.children : [],
        configuration: element.configuration || '',
        className: element.className || '',
        attributes: element.attributes || {},
        dataAttributes: element.dataAttributes || {},
        events: element.events || {},
      };

      // Special handling for button elements
      if (element.type === 'button' || element.type === 'connectWalletButton') {
        // Ensure content is set
        cleanedElement.content = element.content || 'Button';
        
        // Ensure type is set correctly
        cleanedElement.type = element.type;
        
        // Create a complete styles object with all required properties
        const defaultStyles = {
          backgroundColor: '#5C4EFA',
          color: '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          display: 'inline-block',
          textAlign: 'center',
          textDecoration: 'none',
          outline: 'none',
          boxShadow: 'none',
          margin: '0',
          width: 'auto',
          height: 'auto',
          lineHeight: '1.5',
          fontFamily: 'inherit'
        };

        // Merge existing styles with defaults, ensuring no undefined values
        cleanedElement.styles = {
          ...defaultStyles,
          ...(element.styles || {}),
        };

        // Remove any undefined or null values from styles
        Object.keys(cleanedElement.styles).forEach(key => {
          if (cleanedElement.styles[key] === undefined || cleanedElement.styles[key] === null) {
            cleanedElement.styles[key] = defaultStyles[key];
          }
        });

        // Ensure hover state is properly set
        if (!cleanedElement.styles['&:hover']) {
          cleanedElement.styles['&:hover'] = {
            backgroundColor: '#4a3ed9'
          };
        }
      } else {
        // Clean styles object for non-button elements
        cleanedElement.styles = {};
        if (element.styles) {
          Object.entries(element.styles).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              cleanedElement.styles[key] = value;
            }
          });
        }
      }

      // Clean inlineStyles object
      cleanedElement.inlineStyles = {};
      if (element.inlineStyles) {
        Object.entries(element.inlineStyles).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            cleanedElement.inlineStyles[key] = value;
          }
        });
      }

      // Remove any undefined values from the entire element
      Object.keys(cleanedElement).forEach(key => {
        if (cleanedElement[key] === undefined) {
          delete cleanedElement[key];
        }
      });

      // Additional validation for required properties
      if (!cleanedElement.id || !cleanedElement.type) {
        console.warn('Element missing required properties:', cleanedElement);
        return null;
      }

      // Log the cleaned element
      console.log('Cleaned element:', cleanedElement);
      return cleanedElement;
    } catch (error) {
      console.error('Error cleaning element:', error, element);
      return null;
    }
  };

  const handleDeployToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS...');
    try {
      if (!userId || !projectId) {
        const errorMsg = !userId ? 'No valid user ID found!' : 'No valid project ID found!';
        setAutoSaveStatus(`Error: ${errorMsg}`);
        return null;
      }

      const sanitizedUserId = userId.toString().trim();
      const sanitizedProjectId = projectId.toString().trim();

      if (!sanitizedUserId || !sanitizedProjectId) {
        setAutoSaveStatus('Error: Invalid user ID or project ID format');
        return null;
      }

      const projectRef = doc(db, 'projects', sanitizedUserId, 'ProjectRef', sanitizedProjectId);
      
      if (!Array.isArray(elements)) {
        setAutoSaveStatus('Error: Invalid elements data');
        return null;
      }

      // Log the original elements
      console.log('Original elements:', elements);

      // Clean and validate elements data
      const cleanedElements = elements
        .map(cleanElementData)
        .filter(Boolean)
        .map(element => {
          // Additional validation for each element
          if (!element.id || !element.type) {
            console.warn('Invalid element found:', element);
            return null;
          }
          return element;
        })
        .filter(Boolean);

      // Log the cleaned elements
      console.log('Cleaned elements:', cleanedElements);

      // Clean and validate website settings
      const cleanedWebsiteSettings = {
        siteTitle: websiteSettings?.siteTitle || 'My Website',
        faviconUrl: websiteSettings?.faviconUrl || '',
        metaDescription: websiteSettings?.metaDescription || '',
        metaKeywords: websiteSettings?.metaKeywords || '',
        customStyles: websiteSettings?.customStyles || '',
        customScripts: websiteSettings?.customScripts || '',
      };

      // Log the data being sent to Firestore
      console.log('Data being sent to Firestore:', {
        elements: cleanedElements,
        websiteSettings: cleanedWebsiteSettings,
        userId: sanitizedUserId
      });

      await setDoc(projectRef, {
        elements: cleanedElements,
        websiteSettings: cleanedWebsiteSettings,
        lastUpdated: serverTimestamp(),
        userId: sanitizedUserId,
      }, { merge: true });

      const fullHtml = exportProject(cleanedElements, cleanedWebsiteSettings);
      
      const htmlBlob = new Blob([fullHtml], { 
        type: 'text/html;charset=utf-8'
      });
      
      const files = [{ 
        file: htmlBlob, 
        fileName: 'index.html',
        type: 'text/html'
      }];
      
      const metadata = {
        name: cleanedWebsiteSettings.siteTitle,
        keyvalues: { 
          userId: sanitizedUserId,
          timestamp: new Date().toISOString(),
          size: htmlBlob.size
        },
      };
      
      const ipfsHash = await pinDirectoryToPinata(files, metadata);
      
      if (!ipfsHash) {
        throw new Error('No IPFS hash returned from Pinata');
      }
      
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      
      await setDoc(projectRef, {
        ipfsUrl,
        ipfsHash,
        lastDeployed: serverTimestamp(),
      }, { merge: true });

      setAutoSaveStatus('IPFS deploy complete!');
      return ipfsUrl;
    } catch (error) {
      console.error('Deployment error:', error);
      setAutoSaveStatus('Error during deployment: ' + error.message);
      return null;
    }
  };

  const handlePublish = async () => {
    const ipfsUrl = await handleDeployToIPFS();
    
    if (ipfsUrl) {
      if (onProjectPublished) {
        onProjectPublished(ipfsUrl);
      }
      window.open(ipfsUrl, '_blank');
    }
    setIsDropdownOpen(false);
  };

  const handleExport = () => {
    const html = exportProject(elements, websiteSettings);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  return (
    <div className="export-section" ref={dropdownRef}>
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>
      <div className="dropdown-container">
        <button 
          className="button" 
          onMouseEnter={() => setIsDropdownOpen(true)}
        >
          Publish
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handlePublish} className="dropdown-item">
              Publish to IPFS
            </button>
            <button onClick={handleExport} className="dropdown-item">
              Export Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportSection;