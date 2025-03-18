import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { renderElementToHtml } from '../../utils/htmlRender';
import { flattenStyles } from '../../utils/htmlRenderUtils/cssUtils';
import ScanDomains from './Deployements/ScanDomains';

const ExportSection = ({ elements, buildHierarchy, userId, websiteSettings, projectId }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [shareableUrl, setShareableUrl] = useState('');
  const [showDeployOptions, setShowDeployOptions] = useState(false);
  const [showDomainSelectionPopup, setShowDomainSelectionPopup] = useState(false);
  const [showUDDomainLinking, setShowUDDomainLinking] = useState(false);
  const [ethAddress, setEthAddress] = useState(null);

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

  // We won't do IPFS or domain logic here; it will happen in ScanDomains.
  // We'll only do Web2 deployment and pass the necessary helper functions to the child.

  // ------------------------------------------------------------------
  // Generate full HTML (used for Web2 deployment)
  // ------------------------------------------------------------------
  const generateFullHtml = () => {
    const collectedStyles = [];
    const nestedElements = buildHierarchy(elements);
    const bodyHtml = nestedElements
      .map((element) => renderElementToHtml(element, collectedStyles))
      .join('');
    const globalStyles = collectedStyles
      .map(({ className, styles }) => `.${className} {\n${flattenStyles(styles)}\n}`)
      .join('\n');
    console.log(websiteSettings);
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${websiteSettings.siteTitle || 'Exported Website'}</title>
        ${
          websiteSettings.faviconUrl
            ? `<link rel="icon" href="${websiteSettings.faviconUrl}" type="image/x-icon">`
            : ''
        }
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
  };
  
  // ------------------------------------------------------------------
  // Save project to Firestore
  // ------------------------------------------------------------------
  const saveProjectToFirestore = async (finalUserId, fullHtml, deployType, deployUrl) => {
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.dappzy.io';
    const projectName = websiteSettings.siteTitle || 'MyWebsite';
  
    // If projectId is not defined, use the placeholder.
    if (!projectId) {
      projectId = "R2WJQxozoXx2mGAMlmPU";
    }
  
    let testUrl;
    if (deployType === 'web2') {
      testUrl = `${baseUrl}/${userId}/ProjectRef/${projectId}/${projectName}`;
    } else {
      testUrl = deployUrl; // IPFS or custom domain
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
  // Web2 Deploy
  // ------------------------------------------------------------------
  const handleExportWeb2 = async () => {
    setAutoSaveStatus('Publishing to Web2...');
    try {
      const finalUserId = userId || (auth.currentUser && auth.currentUser.uid);
      if (!finalUserId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return;
      }
      const fullHtml = generateFullHtml();
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

  // ------------------------------------------------------------------
  // Popups: Deploy Options & Domain Selection
  // ------------------------------------------------------------------
  const openDeployOptions = () => setShowDeployOptions(true);
  const closeDeployOptions = () => setShowDeployOptions(false);

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

      {/* Deploy Options Popup */}
      {showDeployOptions && (
        <div className="deploy-options-popup">
          <div className="deploy-options-content">
            <h3>Choose Deploy Option</h3>

            {/* Web2 */}
            <button
              className="button"
              onClick={() => {
                closeDeployOptions();
                openDomainSelectionPopup();
              }}
            >
              Deploy to Web2
            </button>

            {/* Web3 => open ScanDomains popup. Actual IPFS logic is inside that component. */}
            <button
              className="button"
              onClick={() => {
                closeDeployOptions();
                setShowUDDomainLinking(true);
              }}
            >
              Deploy to Web3
            </button>

            <button className="button cancel" onClick={closeDeployOptions}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Domain Selection Popup for Web2 */}
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

      {/* Web3 Domain Linking Popup */}
      {showUDDomainLinking && (
        <div className="domain-popup">
          <div className="domain-popup-content">
            <ScanDomains
              userId={userId}
              elements={elements}
              walletAddress={ethAddress}  // from your parent
              buildHierarchy={buildHierarchy}
              websiteSettings={websiteSettings}
              setAutoSaveStatus={setAutoSaveStatus}
              generateFullHtml={generateFullHtml}
              saveProjectToFirestore={saveProjectToFirestore}
              onDomainSelected={() => {
                // domain chosen => close popup or do other logic
                setShowUDDomainLinking(false);
              }}
              onCancel={() => setShowUDDomainLinking(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSection;
