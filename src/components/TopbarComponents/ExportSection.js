import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { pinata, pinataSDK, pinataConfig } from '../../utils/configPinata';
import { renderElementToHtml } from '../../utils/htmlRender'; // Your render method
import { defaultHeroStyles, CustomTemplateHeroStyles, heroTwoStyles } from '../../Elements/Sections/Heros/defaultHeroStyles';
import { ctaOneStyles, ctaTwoStyles } from '../../Elements/Sections/CTAs/defaultCtaStyles';
import { defaultDeFiStyles } from '../../Elements/Sections/Web3Related/DeFiSection';
// Import your hierarchy builder – this should nest elements with a valid parentId.
import { buildHierarchy } from '../../utils/LeftBarUtils/elementUtils';

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

/**
 * exportProject
 * • Builds a hierarchy from the flat element tree.
 * • Merges default styles into each element (recursively).
 * • Renders the HTML using your renderElementToHtml function.
 * • Injects global styles and wraps the content in a main container.
 */
export function exportProject(elements, websiteSettings) {
  let bodyHtml = '';
  const processedElements = new Set();
  const collectedStyles = []; // <-- Always define this array for style collection

  // Helper to convert camelCase to kebab-case
  function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Helper to generate style string from inlineStyles
  function getStyleString(styles) {
    if (!styles) return '';
    return Object.entries(styles)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ');
  }

  // 1. Build hierarchy and process styles
  const hierarchicalElements = buildHierarchy(elements).map(element => {
    // Preserve all user modifications exactly
    const processedElement = {
      ...element,
      styles: element.styles || {},
      inlineStyles: element.inlineStyles || {},
      content: element.content || '',
      children: element.children || [],
      attributes: element.attributes || {},
      className: element.className || '',
      dataAttributes: element.dataAttributes || {},
      events: element.events || {},
      customScript: element.customScript || '',
      configuration: element.configuration || {},
      properties: element.properties || {}
    };
    return processedElement;
  });

  // 2. Render all elements using renderElementToHtml
  hierarchicalElements.forEach(element => {
    if (!processedElements.has(element.id)) {
      // Always use inlineStyles as the style attribute
      const styleString = getStyleString(element.inlineStyles);
      const renderedContent = renderElementToHtml({
        ...element,
        style: styleString,
        className: element.className ? `${element.className} ${element.id}` : element.id,
        ...(element.attributes || {}),
        ...(element.dataAttributes || {}),
        ...(element.events || {})
      }, collectedStyles); // <-- Always pass collectedStyles
      if (renderedContent) {
        bodyHtml += renderedContent;
        processedElements.add(element.id);
      }
    }
  });

  // 3. Only minimal global CSS for layout/box-sizing
  const globalBlock = `
    html, body { 
      margin: 0;
      padding: 0;
      overflow-x: hidden; 
      width: 100%;
      max-width: 100%;
      font-family: sans-serif;
      box-sizing: border-box;
    }
    *, *::before, *::after {
      box-sizing: inherit;
    }
  `;
  
  const stylesHtml = `<style>\n${globalBlock}\n</style>`;

  // 4. Collect user scripts
  const userScripts = new Set();
  hierarchicalElements.forEach(element => {
    if (element?.customScript) {
      userScripts.add(element.customScript);
    }
  });

  // 5. Add user scripts
  const walletConnectScript = `
    <script>
    window.addEventListener('DOMContentLoaded', function() {
      const button = document.getElementById('connect-wallet-button');
      const addressDiv = document.getElementById('wallet-address');
      const overlay = document.getElementById('defi-not-connected-overlay');
      const dashboard = document.getElementById('defi-dashboard-grid');
      let walletAddress = '';
      let isConnected = false;
      let isSigned = false;

      function updateUI() {
        if (button) button.textContent = isConnected && isSigned ? 'Disconnect' : 'Connect Wallet';
        if (addressDiv) {
          addressDiv.textContent = isConnected && walletAddress
            ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
            : '';
          addressDiv.style.display = isConnected ? 'block' : 'none';
        }
        if (overlay && dashboard) {
          overlay.style.display = isConnected && isSigned ? 'none' : 'block';
          dashboard.style.opacity = isConnected && isSigned ? '1' : '0.3';
          dashboard.style.pointerEvents = isConnected && isSigned ? 'auto' : 'none';
        }
        // Show/hide connected message in DeFi modules
        document.querySelectorAll('.defi-connected-message').forEach(function(el) {
          if (isConnected && isSigned && walletAddress) {
            el.style.display = 'block';
            el.textContent = 'Connected: ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
          } else {
            el.style.display = 'none';
            el.textContent = '';
          }
        });
        // Show/hide error message in DeFi modules
        document.querySelectorAll('.defi-error-message').forEach(function(el) {
          el.style.display = (isConnected && isSigned && walletAddress) ? 'none' : 'block';
        });
      }

      async function requestSignature(address, type) {
        if (type === 'ethereum' && window.ethereum) {
          try {
            const message = 'Please sign this message to unlock the DeFi dashboard.';
            await window.ethereum.request({
              method: 'personal_sign',
              params: [message, address]
            });
            isSigned = true;
            updateUI();
            return true;
          } catch (e) {
            alert('Signature rejected.');
            return false;
          }
        }
        if (type === 'solana' && window.solana) {
          try {
            const message = new TextEncoder().encode('Please sign this message to unlock the DeFi dashboard.');
            await window.solana.signMessage(message, 'utf8');
            isSigned = true;
            updateUI();
            return true;
          } catch (e) {
            alert('Signature rejected.');
            return false;
          }
        }
        return false;
      }

      async function connectMetaMask() {
        if (!window.ethereum) {
          alert('MetaMask is not installed');
          return false;
        }
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0];
            isConnected = true;
            // Request signature after connection
            const signed = await requestSignature(walletAddress, 'ethereum');
            if (!signed) {
              isConnected = false;
              walletAddress = '';
            }
            updateUI();
            return signed;
          }
        } catch (e) {
          alert('MetaMask connection failed');
        }
        return false;
      }

      async function connectPhantom() {
        if (!window.solana) {
          alert('Phantom wallet is not installed');
          return false;
        }
        try {
          const { publicKey } = await window.solana.connect();
          if (publicKey) {
            walletAddress = publicKey.toString();
            isConnected = true;
            // Request signature after connection
            const signed = await requestSignature(walletAddress, 'solana');
            if (!signed) {
              isConnected = false;
              walletAddress = '';
            }
            updateUI();
            return signed;
          }
        } catch (e) {
          alert('Phantom connection failed');
        }
        return false;
      }

      if (button) {
        button.addEventListener('click', async function() {
          if (isConnected && isSigned) {
            walletAddress = '';
            isConnected = false;
            isSigned = false;
            updateUI();
          } else {
            const mm = await connectMetaMask();
            if (!mm) await connectPhantom();
          }
        });
      }
      updateUI();
    });
    </script>
  `;

  const scriptsHtml = `
    <script>
      // Execute user scripts
      ${Array.from(userScripts).join('\n')}
    </script>
    ${walletConnectScript}
  `;

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
        <div class="content-list">
          ${bodyHtml}
        </div>
      </div>
      ${scriptsHtml}
    </body>
    </html>
  `.trim();

  return fullHtml;
}

/**
 * Uses the Pinata API to pin the exported HTML file to IPFS.
 */
async function pinDirectoryToPinata(files, metadata) {
  try {
    console.log('Starting Pinata upload...');
    
    const formData = new FormData();
    
    // Append the file (use Blob directly)
    formData.append('file', files[0].file, files[0].fileName);
    
    // Add metadata if provided
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify(metadata));
    }

    console.log('Uploading to Pinata:', {
      fileName: files[0].fileName,
      fileSize: files[0].file.size,
      metadata: metadata
    });

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataConfig.pinata_jwt}`
      },
      body: formData
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      console.error('Pinata error:', errorData);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Pinata upload response:', data);

    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
} 

const ExportSection = ({ elements, websiteSettings, userId, projectId, onProjectPublished }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [shareableUrl, setShareableUrl] = useState('');

  const handleDeployToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS...');
    try {
      if (!userId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return null;
      }

      // First, save the current project state to Firestore
      const projectRef = doc(db, "projects", userId, "ProjectRef", projectId);
      await setDoc(projectRef, {
        elements,
        websiteSettings,
        lastUpdated: serverTimestamp(),
        userId,
      }, { merge: true });

      // Generate HTML
      const fullHtml = exportProject(elements, websiteSettings);
      console.log('Generated HTML length:', fullHtml.length);
      
      // Create Blob with explicit type
      const htmlBlob = new Blob([fullHtml], { 
        type: 'text/html;charset=utf-8'
      });
      console.log('Blob size:', htmlBlob.size);
      
      // Prepare file for upload
      const files = [{ 
        file: htmlBlob, 
        fileName: 'index.html',
        type: 'text/html'
      }];
      
      // Prepare metadata
      const metadata = {
        name: websiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { 
          userId,
          timestamp: new Date().toISOString(),
          size: htmlBlob.size
        },
      };
      
      console.log('Starting IPFS upload process...');
      
      // Upload to Pinata
      const ipfsHash = await pinDirectoryToPinata(files, metadata);
      
      if (!ipfsHash) {
        throw new Error('No IPFS hash returned from Pinata');
      }
      
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      console.log('Generated IPFS URL:', ipfsUrl);
      
      // Update Firestore with IPFS URL
      await setDoc(projectRef, {
        ipfsUrl,
        ipfsHash,
        lastDeployed: serverTimestamp(),
      }, { merge: true });

      setAutoSaveStatus('IPFS deploy complete!');
      return ipfsUrl;
    } catch (error) {
      console.error('Error during deployment:', error);
      setAutoSaveStatus('Error during deployment: ' + error.message);
      return null;
    }
  };

  const handlePublish = async () => {
    const ipfsUrl = await handleDeployToIPFS();
    if (ipfsUrl) {
      setShareableUrl(ipfsUrl);
      if (onProjectPublished) onProjectPublished(ipfsUrl);
      window.open(ipfsUrl, '_blank');
    }
  };

  return (
    <div className="export-section">
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>
      <button className="button" onClick={handlePublish}>
        Publish
      </button>
    </div>
  );
};

export default ExportSection;