import React, { useState, useRef, useEffect, useContext } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { generatePreviewUrl, deployToIPFS } from '../../utils/export/ipfsUtils';
import { generateProjectHtml } from '../../utils/export/htmlGenerator';
import { EditableContext } from '../../context/EditableContext';
import { AutoSaveContext } from '../../context/AutoSaveContext';
import { useSubscription } from '../../context/SubscriptionContext';
import SnsDomainSelector from './Deployements/sns/SnsDomainSelector';
import '../css/Topbar.css';
import UpgradePopup from '../UpgradePopup';

const ExportSection = ({ elements, websiteSettings, userId, projectId, onProjectPublished }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSnsSelector, setShowSnsSelector] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isTestDomainEnabled, setIsTestDomainEnabled] = useState(false);
  const [operationStatus, setOperationStatus] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const dropdownRef = useRef(null);
  const { findElementById } = useContext(EditableContext);
  const { saveStatus, lastSaved } = useContext(AutoSaveContext);
  const { isPioneer, isLoading: subscriptionLoading } = useSubscription();

  // Get wallet address from session storage
  const walletAddress = sessionStorage.getItem("userAccount");

  // Debug log for subscription status
  useEffect(() => {
    console.log('ExportSection - Subscription Status:', {
      isPioneer,
      subscriptionLoading,
      walletAddress,
      localStorage: {
        status: localStorage.getItem('subscriptionStatus'),
        endDate: localStorage.getItem('subscriptionEndDate')
      }
    });
  }, [isPioneer, subscriptionLoading, walletAddress]);

  // Format the last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = now - lastSaved;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  // Get the current status to display (prioritize operation status over auto-save status)
  const getCurrentStatus = () => {
    return operationStatus || saveStatus;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Generate preview URL when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      handleGeneratePreview();
    }
  }, [isDropdownOpen, elements, websiteSettings]);

  const handleGeneratePreview = async () => {
    try {
      setOperationStatus('Generating preview...');
      const url = await generatePreviewUrl(userId, projectId, elements, websiteSettings);
      setPreviewUrl(url);
      setOperationStatus('Preview generated successfully');
      // Clear operation status after 3 seconds
      setTimeout(() => setOperationStatus(null), 3000);
    } catch (error) {
      console.error('Error generating preview:', error);
      setOperationStatus('Error generating preview: ' + error.message);
      setPreviewUrl(null);
      // Clear error status after 5 seconds
      setTimeout(() => setOperationStatus(null), 5000);
    }
  };

  const handleDeployToIPFS = async () => {
    setOperationStatus('Publishing to IPFS...');
    try {
      const { ipfsUrl, ipfsHash } = await deployToIPFS(userId, projectId, elements, websiteSettings);

      // Update Firestore
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      await setDoc(projectRef, {
        ipfsUrl,
        ipfsHash,
        lastDeployed: serverTimestamp(),
      }, { merge: true });

      setOperationStatus('IPFS deploy complete!');
      // Clear operation status after 3 seconds
      setTimeout(() => setOperationStatus(null), 3000);
      return ipfsUrl;
    } catch (error) {
      console.error('Deployment error:', error);
      setOperationStatus('Error during deployment: ' + error.message);
      // Clear error status after 5 seconds
      setTimeout(() => setOperationStatus(null), 5000);
      return null;
    }
  };

  const handleUpdate = async () => {
    if (isTestDomainEnabled) {
      setOperationStatus('Deploying to IPFS...');
      try {
        const ipfsUrl = await handleDeployToIPFS();
        if (ipfsUrl) {
          // Update the project in Firestore with the new IPFS URL
          const projectRef = doc(db, 'projects', userId);
          await setDoc(projectRef, {
            websiteSettings: {
              ...websiteSettings,
              testUrl: ipfsUrl,
              lastUpdated: serverTimestamp()
            },
            lastUpdated: serverTimestamp()
          }, { merge: true });

          setPreviewUrl(ipfsUrl);
          setOperationStatus('Deployment complete!');
          if (onProjectPublished) {
            onProjectPublished(ipfsUrl);
          }
          // Clear operation status after 3 seconds
          setTimeout(() => setOperationStatus(null), 3000);
        }
      } catch (error) {
        console.error('Error deploying to IPFS:', error);
        setOperationStatus('Error during deployment: ' + error.message);
        // Clear error status after 5 seconds
        setTimeout(() => setOperationStatus(null), 5000);
      }
    }
    setIsDropdownOpen(false);
  };

  const handleSnsDeploy = () => {
    console.log('handleSnsDeploy called:', { isPioneer, walletAddress }); // Debug log

    if (!isPioneer) {
      console.log('Not a pioneer user, showing upgrade popup'); // Debug log
      setShowUpgradePopup(true);
      setIsDropdownOpen(false);
      return;
    }
    
    if (!walletAddress) {
      console.log('No wallet address found'); // Debug log
      setOperationStatus('Error: No Solana wallet connected');
      setTimeout(() => setOperationStatus(null), 5000);
      return;
    }

    console.log('Opening SNS selector'); // Debug log
    setShowSnsSelector(true);
    setIsDropdownOpen(false);
  };

  const handleSnsDomainSelected = (domain) => {
    setShowSnsSelector(false);
    if (onProjectPublished) {
      onProjectPublished(`https://${domain}.sol`);
    }
  };

  const handleSnsCancel = () => {
    setShowSnsSelector(false);
  };

  const handleExport = () => {
    const html = generateProjectHtml(elements, websiteSettings);
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

  // Helper function to format IPFS URL for display
  const formatIpfsUrl = (url) => {
    if (!url) return '';
    try {
      const hash = url.split('/').pop();
      return `ipfs://${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    } catch (error) {
      console.error('Error formatting IPFS URL:', error);
      return url;
    }
  };

  const currentStatus = getCurrentStatus();
  const isOperationInProgress = currentStatus && (
    currentStatus.includes('Generating') ||
    currentStatus.includes('Publishing') ||
    currentStatus.includes('Deploying')
  );

  return (
    <div className="export-section" ref={dropdownRef}>
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        {isOperationInProgress ? 'sync' : currentStatus === 'All changes saved' ? 'cloud_done' : 'cloud_sync'}
      </span>
      <span className="autosave-status">
        {currentStatus}
        {!operationStatus && lastSaved && <span className="last-saved-time">{getLastSavedText()}</span>}
      </span>
      <div className="dropdown-container">
        <button
          className="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Publish
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className='dropdown-menu-item'>
              <p className='dropdown-menu-item-title'>Test Domain</p>
              <div className='dropdown-menu-item-content'>
                <div className='dropdown-menu-item-content-left'>
                  <span className="material-symbols-outlined">
                    experiment
                  </span>
                  {previewUrl ? (
                    <div className="preview-url-container">
                      <a 
                        className='dropdown-menu-item-content-left-text' 
                        href={previewUrl} 
                        target='_blank'
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(previewUrl, '_blank');
                        }}
                      >
                        {formatIpfsUrl(previewUrl)}
                      </a>
                    </div>
                  ) : (
                    <span className='dropdown-menu-item-content-left-text'>
                      Generating preview...
                    </span>
                  )}
                </div>
                <div className='dropdown-menu-item-content-toggle-box'>
                  <label className="dropdown-menu-item-content-switch">
                    <input 
                      type="checkbox" 
                      checked={isTestDomainEnabled}
                      onChange={(e) => setIsTestDomainEnabled(e.target.checked)}
                    />
                    <span className="dropdown-menu-item-content-slider dropdown-menu-item-content-round"></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='dropdown-menu-item'>
              <p className='dropdown-menu-item-title'>Custom Domain</p>
              <div className='dropdown-menu-item-content'>
                {!isPioneer && (
                  <div className="upgrade-message" onClick={() => setShowUpgradePopup(true)}>
                    <span className="material-symbols-outlined">workspace_premium</span>
                    <p>Upgrade to Pioneer to use custom domains</p>
                  </div>
                )}
                <button
                  onClick={handleSnsDeploy}
                  className={`dropdown-menu-item-content-button ${!isPioneer || !walletAddress ? 'disabled' : ''}`}
                  disabled={!walletAddress || !isPioneer}
                >
                  Add Domain
                </button>
              </div>
            </div>
            <button 
              className='dropdown-menu-button'
              onClick={handleUpdate}
              disabled={!isTestDomainEnabled}
            >
              Update
            </button>
          </div>
        )}
      </div>
      {showSnsSelector && (
        <SnsDomainSelector
          userId={userId}
          walletAddress={walletAddress}
          elements={elements}
          websiteSettings={websiteSettings}
          onDomainSelected={handleSnsDomainSelected}
          onCancel={handleSnsCancel}
          setAutoSaveStatus={setOperationStatus}
          generateFullHtml={() => generateProjectHtml(elements, websiteSettings)}
          saveProjectToFirestore={async (userId, html, type, domain) => {
            const projectRef = doc(db, 'projects', userId);
            await setDoc(projectRef, {
              elements,
              websiteSettings: {
                ...websiteSettings,
                snsDomain: domain,
                walletAddress: walletAddress,
              },
              lastUpdated: serverTimestamp(),
              userId,
            }, { merge: true });
          }}
        />
      )}
      {showUpgradePopup && (
        <UpgradePopup onClose={() => setShowUpgradePopup(false)} />
      )}
    </div>
  );
};

export default ExportSection;