import React, { useState, useRef, useEffect, useContext } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { generatePreviewUrl, deployToIPFS } from '../../utils/export/ipfsUtils';
import { generateProjectHtml } from '../../utils/export/htmlGenerator';
import { EditableContext } from '../../context/EditableContext';
import SnsDomainSelector from './Deployements/SnsDomainSelector';
import '../css/Topbar.css';

const ExportSection = ({ elements, websiteSettings, userId, projectId, onProjectPublished }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSnsSelector, setShowSnsSelector] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isTestDomainEnabled, setIsTestDomainEnabled] = useState(false);
  const dropdownRef = useRef(null);
  const { findElementById } = useContext(EditableContext);

  // Get wallet address from session storage
  const walletAddress = sessionStorage.getItem("userAccount");

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
      setAutoSaveStatus('Generating preview...');
      const url = await generatePreviewUrl(userId, projectId, elements, websiteSettings);
      setPreviewUrl(url);
      setAutoSaveStatus('Preview generated successfully');
    } catch (error) {
      console.error('Error generating preview:', error);
      setAutoSaveStatus('Error generating preview: ' + error.message);
      setPreviewUrl(null);
    }
  };

  const handleDeployToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS...');
    try {
      const { ipfsUrl, ipfsHash } = await deployToIPFS(userId, projectId, elements, websiteSettings);

      // Update Firestore
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
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

  const handleUpdate = async () => {
    if (isTestDomainEnabled) {
      setAutoSaveStatus('Deploying to IPFS...');
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
          setAutoSaveStatus('Deployment complete!');
          if (onProjectPublished) {
            onProjectPublished(ipfsUrl);
          }
        }
      } catch (error) {
        console.error('Error deploying to IPFS:', error);
        setAutoSaveStatus('Error during deployment: ' + error.message);
      }
    }
    setIsDropdownOpen(false);
  };

  const handleSnsDeploy = () => {
    if (!walletAddress) {
      setAutoSaveStatus('Error: No Solana wallet connected');
      return;
    }
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

  return (
    <div className="export-section" ref={dropdownRef}>
      <span className="material-symbols-outlined export-cloud" style={{ color: 'white' }}>
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>
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
                <button
                  onClick={handleSnsDeploy}
                  className="dropdown-menu-item-content-button"
                  disabled={!walletAddress}
                >Add Domain</button>
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
          setAutoSaveStatus={setAutoSaveStatus}
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
    </div>
  );
};

export default ExportSection;