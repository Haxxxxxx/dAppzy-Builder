import React, { useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { pinataJwt } from '../../utils/configPinata';

// Pinata configuration
const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

const ExportSection = ({
  elements,
  buildHierarchy,
  userId,
  websiteSettings,
  projectId,
  onProjectPublished  // <-- new prop
}) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [shareableUrl, setShareableUrl] = useState('');

  // ------------------------------------------------------------------
  // Generate full HTML (used for deployment)
  // ------------------------------------------------------------------
  const generateFullHtml = () => {
    const title = websiteSettings.siteTitle || 'Exported Website';
    const favicon = websiteSettings.faviconUrl || '/favicon.ico';
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="${favicon}">
        <title>${title}</title>
        <style>
          /* Your global styles */
        </style>
      </head>
      <body>
        <!-- Your content here -->
      </body>
      </html>
    `.trim();
  };

  // ------------------------------------------------------------------
  // Helper function: Pin directory to Pinata
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Save project to Firestore (for record keeping)
  // ------------------------------------------------------------------
  const saveProjectToFirestore = async (finalUserId, fullHtml, deployType, deployUrl) => {
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.dappzy.io';
    const projectName = websiteSettings.siteTitle || 'MyWebsite';

    if (!projectId) {
      throw new Error("No valid projectId provided.");
    }

    let testUrl;
    if (deployType === 'web2') {
      testUrl = `${baseUrl}/${userId}/ProjectRef/${projectId}/${projectName}`;
    } else {
      testUrl = deployUrl;
    }

    const projectRef = doc(db, 'projects', userId, "ProjectRef", projectId);
    await setDoc(
      projectRef,
      {
        html: fullHtml,
        elements,
        userId: finalUserId,
        lastUpdated: serverTimestamp(),
        testUrl,
        websiteSettings,
        deployType,
      },
      { merge: true }
    );

    return testUrl;
  };

  // ------------------------------------------------------------------
  // Deploy to IPFS: Create HTML blob, pin it, and update Firestore.
  // ------------------------------------------------------------------
  const handleDeployToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS...');
    try {
      if (!userId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return null;
      }
      const fullHtml = generateFullHtml();
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const files = [{ file: htmlBlob, fileName: `${userId}/index.html` }];
      const metadata = {
        name: websiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { userId },
      };

      const result = await pinDirectoryToPinata(files, metadata);
      const cid = result.IpfsHash;
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}/${userId}`;

      // Save the deployed project to Firestore
      await saveProjectToFirestore(userId, fullHtml, 'ipfs', ipfsUrl);
      setAutoSaveStatus('IPFS deploy complete!');
      return ipfsUrl;
    } catch (error) {
      setAutoSaveStatus(`Error publishing to IPFS: ${error.message}`);
      console.error('IPFS error:', error);
      return null;
    }
  };

  // ------------------------------------------------------------------
  // Publish: Deploy to IPFS directly and open the project URL in a new tab.
  // ------------------------------------------------------------------
  const handlePublish = async () => {
    const ipfsUrl = await handleDeployToIPFS();
    if (ipfsUrl) {
      setShareableUrl(ipfsUrl);
      if (onProjectPublished) {
        onProjectPublished(ipfsUrl);  // Pass IPFS URL to parent (Topbar)
      }
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
