// src/components/LeftbarPanels/ExportSection.js
import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { renderElementToHtml } from '../../utils/htmlRender';
import { flattenStyles } from '../../utils/htmlRenderUtils/cssUtils';
// We’re using Pinata’s API for pinning (not ipfs-http-client)
 
// Import your Pinata configuration values from environment variables.
import { pinataJwt, pinataGateway } from '../../utils/configPinata';

const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

const ExportSection = ({ elements, buildHierarchy, userId, websiteSettings }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [shareableUrl, setShareableUrl] = useState('');
  const [showDeployOptions, setShowDeployOptions] = useState(false);

  // Generate the full HTML from your elements and styles.
  const generateFullHtml = () => {
    const collectedStyles = [];
    const nestedElements = buildHierarchy(elements);
    const bodyHtml = nestedElements
      .map((element) => renderElementToHtml(element, collectedStyles))
      .join('');
    const globalStyles = collectedStyles
      .map(({ className, styles }) => `.${className} {\n${flattenStyles(styles)}\n}`)
      .join('\n');
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Website</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    ${globalStyles}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>
    `.trim();
    return fullHtml;
  };

  // Save project details in Firestore.
  // For Web2, we build a shareable URL using the base URL, userId, and projectName.
  // For IPFS, we store the shareable URL (e.g. a Pinata gateway URL) as provided.
  const saveProjectToFirestore = async (finalUserId, fullHtml, deployType, deployUrl) => {
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.3rd-space.io';
    const projectName = websiteSettings.siteTitle || 'MyWebsite';
    let testUrl;
    if (deployType === 'web2') {
      // Use the original shareable URL format:
      testUrl = `${baseUrl}/${finalUserId}/${projectName}`;
    } else {
      // For IPFS, use the provided deployUrl (assumed to be a full URL).
      testUrl = websiteSettings.customDomain
        ? `https://${websiteSettings.customDomain}`
        : `${deployUrl}`;
    }
    const projectRef = doc(db, 'projects', finalUserId);
    await setDoc(projectRef, {
      html: fullHtml,
      elements,
      userId: finalUserId,
      lastUpdated: serverTimestamp(),
      testUrl,
      websiteSettings,
      deployType, // 'web2' or 'ipfs'
    });
    return testUrl;
  };

  // Web2 deployment (existing flow)
  const handleExportWeb2 = async () => {
    setAutoSaveStatus('Publishing to Web2...');
    try {
      const fullHtml = generateFullHtml();
      let finalUserId = userId || (auth.currentUser && auth.currentUser.uid);
      if (!finalUserId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return;
      }
      const testUrl = await saveProjectToFirestore(finalUserId, fullHtml, 'web2');
      setAutoSaveStatus('Project published on Web2!');
      setShareableUrl(testUrl);
      await navigator.clipboard.writeText(testUrl);
      window.open(testUrl, '_blank');
    } catch (error) {
      console.error('Error publishing project to Web2:', error);
      setAutoSaveStatus('Error publishing project: ' + error.message);
    }
  };

  // Helper function to pin a directory to Pinata with metadata.
  // This function wraps an array of files in a directory.
  const pinDirectoryToPinata = async (files, metadata) => {
    const formData = new FormData();
    files.forEach(({ file, fileName }) => {
      // fileName can include a path, e.g. "userId/index.html"
      formData.append('file', file, fileName);
    });
    // Wrap the files in a directory.
    formData.append('pinataOptions', JSON.stringify({ wrapWithDirectory: true }));
    // Append metadata.
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const response = await fetch(PINATA_PIN_FILE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Pinata pinFileToIPFS failed: ${response.statusText}`);
    }
    return response.json();
  };

  // IPFS deployment using Pinata with directory wrapping.
  // The returned CID is used to construct the shareable URL.
  const handleExportToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS via Pinata...');
    try {
      const fullHtml = generateFullHtml();
      let finalUserId = userId || (auth.currentUser && auth.currentUser.uid);
      if (!finalUserId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return;
      }
      
      // Create a Blob for the HTML content.
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      // Set file name with a folder path, e.g. "userId/index.html"
      const files = [{ file: htmlBlob, fileName: `${finalUserId}/index.html` }];
      
      // Define metadata.
      const metadata = {
        name: websiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { userId: finalUserId },
      };

      // Pin the directory of files to Pinata.
      const result = await pinDirectoryToPinata(files, metadata);
      const cid = result.IpfsHash;
      // Construct the shareable URL using a public gateway.
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}/${userId}`;
      
      // Save the project in Firestore.
      const testUrl = await saveProjectToFirestore(finalUserId, fullHtml, 'ipfs', ipfsUrl);
      setAutoSaveStatus('Project published on IPFS!');
      setShareableUrl(testUrl);
      await navigator.clipboard.writeText(testUrl);
      window.open(testUrl, '_blank');
    } catch (error) {
      console.error('Error publishing project to IPFS:', error);
      setAutoSaveStatus('Error publishing project to IPFS: ' + error.message);
    }
  };

  const openDeployOptions = () => setShowDeployOptions(true);
  const closeDeployOptions = () => setShowDeployOptions(false);

  return (
    <div className="export-section">
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>
      {shareableUrl && (
        <div className="shareable-url">
          <p>
            Shareable URL:{' '}
            <a href={shareableUrl} target="_blank" rel="noopener noreferrer">
              {shareableUrl}
            </a>
          </p>
        </div>
      )}
      <button className="button" onClick={openDeployOptions}>
        Publish
      </button>
      {showDeployOptions && (
        <div className="deploy-options-popup">
          <div className="deploy-options-content">
            <h3>Choose Deploy Option</h3>
            <button className="button" onClick={() => { closeDeployOptions(); handleExportWeb2(); }}>
              Deploy to Web2
            </button>
            <button className="button" onClick={() => { closeDeployOptions(); handleExportToIPFS(); }}>
              Deploy to IPFS
            </button>
            <button className="button cancel" onClick={closeDeployOptions}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSection;
