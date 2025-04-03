import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { pinataJwt } from '../../utils/configPinata';
import { renderElementToHtml } from '../../utils/htmlRender'; // Your render method
import { defaultHeroStyles, CustomTemplateHeroStyles, heroTwoStyles } from '../../Elements/Sections/Heros/defaultHeroStyles';
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
  return element;
}

/**
 * exportProject
 * • Builds a hierarchy from the flat element tree.
 * • Merges default styles into each element (recursively).
 * • Renders the HTML using your renderElementToHtml function.
 * • Injects global styles and wraps the content in a main container.
 */
export function exportProject(elements, websiteSettings) {
  const collectedStyles = [];
  let bodyHtml = '';

  // 1. Build a hierarchy so that container elements nest their children.
  const hierarchicalElements = buildHierarchy(elements);

  // 2. Merge defaults recursively.
  function mergeRecursively(element) {
    const merged = mergeDefaultsIntoElement(element);
    if (merged.children && merged.children.length) {
      merged.children = merged.children.map(mergeRecursively);
    }
    return merged;
  }
  const mergedElements = hierarchicalElements.map(mergeRecursively);

  // 3. Render each top-level element.
  mergedElements.forEach((element) => {
    bodyHtml += renderElementToHtml(element, collectedStyles);
  });

  // Global styles (for example, the body and main container)
  const globalStyles = {
    body: {
      margin: '0',
      padding: '0',
      fontFamily: "'Roboto', sans-serif",
      backgroundColor: '#f5f5f5',
    },   
  };

  // Build CSS block.
  let stylesHtml = '<style>';
  for (let selector in globalStyles) {
    stylesHtml += `${selector} {`;
    for (let key in globalStyles[selector]) {
      stylesHtml += `${toKebabCase(key)}: ${globalStyles[selector][key]};`;
    }
    stylesHtml += '}';
  }
  collectedStyles.forEach(({ className, styles }) => {
    let cssString = '';
    let baseStyles = {};
    let nestedStyles = {};
  
    // Separate base styles from nested selectors.
    for (let key in styles) {
      if (typeof styles[key] === 'object') {
        nestedStyles[key] = styles[key];
      } else {
        baseStyles[key] = styles[key];
      }
    }
  
    // Generate CSS for the base styles of the element.
    cssString += `.${className} {`;
    for (let key in baseStyles) {
      cssString += `${toKebabCase(key)}: ${baseStyles[key]};`;
    }
    cssString += '}';
  
    // Generate CSS for each nested selector (e.g., .primaryButton, .secondaryButton).
    for (let nestedSelector in nestedStyles) {
      // The nested selector is assumed to be something like ".primaryButton"
      cssString += `.${className} ${nestedSelector} {`;
      for (let key in nestedStyles[nestedSelector]) {
        cssString += `${toKebabCase(key)}: ${nestedStyles[nestedSelector][key]};`;
      }
      cssString += '}';
    }
  
    stylesHtml += cssString;
  });
  
  stylesHtml += '</style>';

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
      <div class="main-container">
        ${bodyHtml}
      </div>
    </body>
    </html>
  `.trim();

  return fullHtml;
}

/**
 * Uses the Pinata API to pin the exported HTML file to IPFS.
 */
async function pinDirectoryToPinata(files, metadata) {
  const formData = new FormData();
  files.forEach(({ file, fileName }) => {
    formData.append('file', file, fileName);
  });
  formData.append('pinataOptions', JSON.stringify({ wrapWithDirectory: true }));
  formData.append('pinataMetadata', JSON.stringify(metadata));

  const response = await fetch(PINATA_PIN_FILE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pinataJwt}` },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Pinata pinFileToIPFS failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Saves a record of the exported project to Firestore.
 */
async function saveProjectToFirestore(
  userId,
  fullHtml,
  deployType,
  deployUrl,
  websiteSettings,
  elements,
  projectId
) {
  const isLocal = window.location.hostname === 'localhost';
  const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.dappzy.io';
  const projectName = websiteSettings.siteTitle || 'MyWebsite';
  const localProjectId = projectId || (isLocal ? `local-test-${new Date().getTime()}` : null);
  if (!localProjectId) throw new Error("No valid projectId provided.");
  const testUrl =
    deployType === 'web2'
      ? `${baseUrl}/${userId}/ProjectRef/${localProjectId}/${projectName}`
      : deployUrl;
  const projectRef = doc(db, 'projects', userId, 'ProjectRef', localProjectId);
  await setDoc(
    projectRef,
    {
      html: fullHtml,
      elements,
      userId,
      lastUpdated: serverTimestamp(),
      testUrl,
      websiteSettings,
      deployType,
    },
    { merge: true }
  );
  return testUrl;
}

/**
 * ExportSection Component
 * Renders a Publish button that exports your element tree to HTML, deploys it to IPFS,
 * and optionally saves a record to Firestore.
 */
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
      const fullHtml = exportProject(elements, websiteSettings);
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const files = [{ file: htmlBlob, fileName: `${userId}/index.html` }];
      const metadata = {
        name: websiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { userId },
      };
      const result = await pinDirectoryToPinata(files, metadata);
      const cid = result.IpfsHash;
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}/${userId}`;
      await saveProjectToFirestore(userId, fullHtml, 'ipfs', ipfsUrl, websiteSettings, elements, projectId);
      setAutoSaveStatus('IPFS deploy complete!');
      return ipfsUrl;
    } catch (error) {
      setAutoSaveStatus(`Error publishing to IPFS: ${error.message}`);
      console.error('IPFS error:', error);
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
