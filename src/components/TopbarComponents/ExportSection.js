import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { renderElementToHtml } from '../../utils/htmlRender';
import { flattenStyles } from '../../utils/htmlRenderUtils/cssUtils';
import { pinataJwt } from '../../utils/configPinata';
import ScanDomains from './Deployements/ScanDomains';

const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

const ExportSection = ({ elements, buildHierarchy, userId, websiteSettings }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [shareableUrl, setShareableUrl] = useState('');
  const [showDeployOptions, setShowDeployOptions] = useState(false);
  const [showDomainSelectionPopup, setShowDomainSelectionPopup] = useState(false);
  const [showUDDomainLinking, setShowUDDomainLinking] = useState(false); // for UD scan popup
  const [solAddress, setSolAddress] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  
  // Use websiteSettings directly (no custom domain logic)
  const localWebsiteSettings = websiteSettings;

  // Connect to Phantom for Solana
  useEffect(() => {
    const getSolanaAddress = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          let response;
          if (window.solana.isConnected) {
            response = await window.solana.connect({ onlyIfTrusted: true });
          } else {
            response = await window.solana.connect();
          }
          setSolAddress(response.publicKey.toString());
        } catch (error) {
          console.error('Error connecting to Phantom Solana wallet:', error);
        }
      }
    };
    getSolanaAddress();
  }, []);

  // For UD deployment, check Firestore for an Ethereum address
  useEffect(() => {
    const checkOrFetchEthAddress = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.ethAddress) {
            setEthAddress(userData.ethAddress);
            return;
          }
        }
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setEthAddress(accounts[0]);
            await updateDoc(userRef, {
              ethAddress: accounts[0],
              lastUpdated: serverTimestamp(),
            });
          }
        } else {
          console.warn('Ethereum provider not available. UD deployment requires an Ethereum address.');
        }
      } catch (error) {
        console.error('Error checking or fetching Ethereum address:', error);
      }
    };
    checkOrFetchEthAddress();
  }, [userId]);

  const generateFullHtml = () => {
    const collectedStyles = [];
    const nestedElements = buildHierarchy(elements);
    const bodyHtml = nestedElements
      .map((element) => renderElementToHtml(element, collectedStyles))
      .join('');
    const globalStyles = collectedStyles
      .map(({ className, styles }) => `.${className} {\n${flattenStyles(styles)}\n}`)
      .join('\n');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${localWebsiteSettings.siteTitle || 'Exported Website'}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    ${globalStyles}
  </style>
  <script src="https://unpkg.com/@solana/web3.js@1.73.2/lib/index.iife.js"></script>
  <script src="https://unpkg.com/@metaplex-foundation/js/dist/index.umd.js"></script>
</head>
<body>
  ${bodyHtml}
</body>
</html>
    `.trim();
  };

  // Save project to Firestore.
  const saveProjectToFirestore = async (finalUserId, fullHtml, deployType, deployUrl) => {
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.3rd-space.io';
    const projectName = localWebsiteSettings.siteTitle || 'MyWebsite';
    let testUrl;
    if (deployType === 'web2') {
      testUrl = `${baseUrl}/${finalUserId}/${projectName}`;
    } else {
      testUrl = deployUrl;
    }
    const projectRef = doc(db, 'projects', finalUserId);
    await setDoc(projectRef, {
      html: fullHtml,
      elements,
      userId: finalUserId,
      solAddress,
      ethAddress,
      lastUpdated: serverTimestamp(),
      testUrl,
      websiteSettings: localWebsiteSettings,
      deployType,
    });
    return testUrl;
  };

  // Web2 deploy using the provided (default) domain
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

  // IPFS deploy via Pinata
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
        name: localWebsiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { userId: finalUserId },
      };
      const result = await pinDirectoryToPinata(files, metadata);
      const cid = result.IpfsHash;
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}/${userId}`;
      const testUrl = await saveProjectToFirestore(finalUserId, fullHtml, 'ipfs', ipfsUrl);
      setAutoSaveStatus('Project published on IPFS!');
      setShareableUrl(testUrl);
      window.open(testUrl, '_blank');
    } catch (error) {
      console.error('Error publishing project to IPFS:', error);
      setAutoSaveStatus('Error publishing project to IPFS: ' + error.message);
    }
  };

  // Popup open/close handlers
  const openDeployOptions = () => setShowDeployOptions(true);
  const closeDeployOptions = () => setShowDeployOptions(false);

  // Open the domain selection popup (for Web2)
  const openDomainSelectionPopup = () => setShowDomainSelectionPopup(true);
  const closeDomainSelectionPopup = () => setShowDomainSelectionPopup(false);

  return (
    <div className="export-section">
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>
      <button className="button" onClick={openDeployOptions}>
        Publish
      </button>

      {showDeployOptions && (
        <div className="deploy-options-popup">
          <div className="deploy-options-content">
            <h3>Choose Deploy Option</h3>
            <button
              className="button"
              onClick={() => {
                closeDeployOptions();
                openDomainSelectionPopup();
              }}
            >
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

      {/* Domain Selection Popup for Web2 deployment */}
      {showDomainSelectionPopup && (
        <div className="domain-popup">
          <div className="domain-popup-content">
            <h3>Select Deploy Option</h3>
            <button
              className="button"
              onClick={() => {
                closeDomainSelectionPopup();
                handleExportWeb2();
              }}
            >
              Use Provided Domain
            </button>
            <button className="button cancel" onClick={closeDomainSelectionPopup}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* UD domain linking: only show if ethAddress is available */}
      {showUDDomainLinking && ethAddress && (
        <div className="domain-popup">
          <div className="domain-popup-content">
            <ScanDomains
              walletAddress={ethAddress}
              userId={userId}
              websiteSettings={localWebsiteSettings}
              onDomainSelected={(domain) => {
                console.log('UD Domain linked to project:', domain);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSection;
