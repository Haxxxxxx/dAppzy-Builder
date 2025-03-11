// src/components/LeftbarPanels/ExportSection.jsx
import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { renderElementToHtml } from '../../utils/htmlRender';
import { flattenStyles } from '../../utils/htmlRenderUtils/cssUtils';
import { pinataJwt } from '../../utils/configPinata';

const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

const ExportSection = ({ elements, buildHierarchy, userId, websiteSettings }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [shareableUrl, setShareableUrl] = useState('');
  const [showDeployOptions, setShowDeployOptions] = useState(false);

  const generateFullHtml = () => {
    const collectedStyles = [];
    const nestedElements = buildHierarchy(elements);
    const bodyHtml = nestedElements
      .map(element => renderElementToHtml(element, collectedStyles))
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
  <title>${websiteSettings.siteTitle || 'Exported Website'}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    ${globalStyles}
  </style>
  <!-- Include Solana web3 and Metaplex from CDN for production minting -->
  <script src="https://unpkg.com/@solana/web3.js@1.73.2/lib/index.iife.js"></script>
  <script src="https://unpkg.com/@metaplex-foundation/js/dist/index.umd.js"></script>
</head>
<body>
  ${bodyHtml}
</body>
</html>
    `.trim();
    return fullHtml;
  };

  const saveProjectToFirestore = async (finalUserId, fullHtml, deployType, deployUrl) => {
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.3rd-space.io';
    const projectName = websiteSettings.siteTitle || 'MyWebsite';
    let testUrl;
    if (deployType === 'web2') {
      testUrl = `${baseUrl}/${finalUserId}/${projectName}`;
    } else {
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
      deployType,
    });
    return testUrl;
  };

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

  const pinDirectoryToPinata = async (files, metadata) => {
    const formData = new FormData();
    files.forEach(({ file, fileName }) => {
      formData.append('file', file, fileName);
    });
    formData.append('pinataOptions', JSON.stringify({ wrapWithDirectory: true }));
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

  const handleExportToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS via Pinata...');
    try {
      const fullHtml = generateFullHtml();
      let finalUserId = userId || (auth.currentUser && auth.currentUser.uid);
      if (!finalUserId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return;
      }
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const files = [{ file: htmlBlob, fileName: `${finalUserId}/index.html` }];
      const metadata = {
        name: websiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { userId: finalUserId },
      };
      const result = await pinDirectoryToPinata(files, metadata);
      const cid = result.IpfsHash;
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}/${userId}`;
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
      {/* {shareableUrl && (
        <div className="shareable-url">
          <p>
            Shareable URL:{' '}
            <a href={shareableUrl} target="_blank" rel="noopener noreferrer">
              {shareableUrl}
            </a>
          </p>
        </div>
      )} */}
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
