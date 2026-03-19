import React, { useState, useRef, useEffect, useContext, lazy, Suspense } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { generatePreviewUrl, deployToIPFS } from '../../utils/export/ipfsUtils';
import { generateProjectHtml, generateCombinedPagesHtml } from '../../utils/export/htmlGenerator';
import { EditableContext } from '../../context/EditableContext';
import { AutoSaveContext } from '../../context/AutoSaveContext';
import { useSubscription } from '../../context/SubscriptionContext';
import SnsDomainSelector from './Deployements/sns/SnsDomainSelector';
import '../css/Topbar.css';
import { authStorage, projectStorage } from '../../utils/storageManager';
import UpgradePopup from '../UpgradePopup';
const ShareProject = lazy(() => import('../ShareProject'));

const ExportSection = ({ elements, websiteSettings, setWebsiteSettings, userId, projectId, onProjectPublished, shareUrl: initialShareUrl, dashboardData }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSnsSelector, setShowSnsSelector] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState(initialShareUrl || '');
  const dropdownRef = useRef(null);
  const statusTimersRef = useRef([]);
  const { findElementById, setElements, pages, setPages } = useContext(EditableContext);
  const jsonImportRef = useRef(null);
  const { saveStatus, lastSaved, hasSaveError, retrySave } = useContext(AutoSaveContext);
  const { isPioneer, isLoading: subscriptionLoading } = useSubscription();

  // Get wallet address from session storage
  const walletAddress = authStorage.getUserAccount();

  // Safe setTimeout that auto-cleans on unmount
  const safeSetTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    statusTimersRef.current.push(id);
    return id;
  };

  // Sync shareUrl when parent prop changes (e.g. loaded from Firestore)
  useEffect(() => {
    if (initialShareUrl) {
      setShareUrl(initialShareUrl);
    }
  }, [initialShareUrl]);

  // Clear all pending timers on unmount
  useEffect(() => {
    return () => {
      statusTimersRef.current.forEach(clearTimeout);
    };
  }, []);

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

  const handlePublishToTestDomain = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setOperationStatus('Publishing to IPFS...');
    try {
      // For multi-page projects, deploy the homepage elements only
      // (IPFS deploys a single HTML file; full multi-page requires Download All Pages)
      const isMultiPage = pages && pages.length > 1;
      const homePage = isMultiPage
        ? pages.find(p => p.slug === '/' || p.slug === '') || pages[0]
        : null;
      const deployElements = isMultiPage ? (homePage.elements || []) : elements;

      const { ipfsUrl, ipfsHash } = await deployToIPFS(userId, projectId, deployElements, websiteSettings, dashboardData);

      // Update Firestore with the deployment info
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      await setDoc(projectRef, {
        ipfsUrl,
        ipfsHash,
        lastDeployed: serverTimestamp(),
        websiteSettings: {
          ...websiteSettings,
          testUrl: ipfsUrl,
          lastUpdated: serverTimestamp()
        },
        lastUpdated: serverTimestamp()
      }, { merge: true });

      setDeployedUrl(ipfsUrl);
      const successMsg = isMultiPage
        ? 'Homepage published! Use "Download All Pages" for the full multi-page site.'
        : 'Published successfully!';
      setOperationStatus(successMsg);
      if (onProjectPublished) {
        onProjectPublished(ipfsUrl);
      }
      safeSetTimeout(() => setOperationStatus(null), isMultiPage ? 5000 : 3000);
    } catch (error) {
      setOperationStatus('Error during deployment: ' + error.message);
      safeSetTimeout(() => setOperationStatus(null), 5000);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSnsDeploy = () => {
    if (!isPioneer) {
      setShowUpgradePopup(true);
      setIsDropdownOpen(false);
      return;
    }

    if (!walletAddress) {
      setOperationStatus('Error: No Solana wallet connected');
      safeSetTimeout(() => setOperationStatus(null), 5000);
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
    const html = generateProjectHtml(elements, websiteSettings, dashboardData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${websiteSettings?.siteTitle || 'website'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const handleExportAllPages = () => {
    // Generate a single combined HTML file with a JS-based page router
    // instead of triggering multiple downloads that browsers block
    const combinedHtml = generateCombinedPagesHtml(pages, websiteSettings, dashboardData);
    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${websiteSettings?.siteTitle || 'website'}-all-pages.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const handleExportJson = () => {
    const backup = { elements, websiteSettings, pages, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${websiteSettings?.siteTitle || 'project'}-backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.elements)) {
          throw new Error('Invalid backup: missing elements array');
        }
        // Validate each element has required fields
        const invalid = data.elements.find(el => !el?.id || !el?.type);
        if (invalid) {
          throw new Error('Invalid backup: elements must have id and type');
        }
        setElements(() => data.elements);
        // Restore multi-page state if present in backup
        if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
          setPages(data.pages);
        } else {
          // Legacy backup without pages — wrap into default Home page
          setPages([{ id: 'page-home', name: 'Home', slug: '/', elements: data.elements }]);
        }
        if (data.websiteSettings && setWebsiteSettings) {
          projectStorage.setWebsiteSettings(data.websiteSettings); // sync cache
          setWebsiteSettings(data.websiteSettings); // triggers AutoSave
        }
        setIsDropdownOpen(false);
      } catch (err) {
        setOperationStatus(`Import failed: ${err.message}`);
        safeSetTimeout(() => setOperationStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper function to format IPFS URL for display
  const formatIpfsUrl = (url) => {
    if (!url) return '';
    try {
      const hash = url.split('/').pop();
      return `ipfs://${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    } catch (error) {
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
      <span className="material-symbols-outlined export-cloud" style={{ color: hasSaveError ? '#f44336' : 'white' }}>
        {hasSaveError ? 'cloud_off' : isOperationInProgress ? 'sync' : currentStatus === 'All changes saved' ? 'cloud_done' : 'cloud_sync'}
      </span>
      <span className="autosave-status">
        {currentStatus}
        {!operationStatus && lastSaved && !hasSaveError && <span className="last-saved-time">{getLastSavedText()}</span>}
      </span>
      {hasSaveError && (
        <button
          className="retry-save-button"
          onClick={retrySave}
          title="Retry saving changes"
        >
          Retry
        </button>
      )}
      <div className="dropdown-container">
        <button
          className="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Publish
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu publish-dropdown">
            {/* ── Section 1: Download ── */}
            <div className="publish-section">
              <p className="publish-section-title">Download</p>
              <button className="publish-action-btn" onClick={handleExport}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                Download HTML
              </button>
              {pages && pages.length > 1 && (
                <button className="publish-action-btn" onClick={handleExportAllPages}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>folder_zip</span>
                  Download All Pages
                </button>
              )}
              <button className="publish-action-btn" onClick={handleExportJson}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>data_object</span>
                Download JSON Backup
              </button>
              <button className="publish-action-btn" onClick={() => jsonImportRef.current?.click()}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                Import Backup
              </button>
              <input
                type="file"
                ref={jsonImportRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportJson}
              />
            </div>

            <hr className="publish-divider" />

            {/* ── Section 2: Publish ── */}
            <div className="publish-section">
              <p className="publish-section-title">Publish</p>

              {/* Deployment status */}
              <div className="publish-status-row">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: deployedUrl ? '#4caf50' : '#808080' }}>
                  {deployedUrl ? 'check_circle' : 'pending'}
                </span>
                {deployedUrl ? (
                  <a
                    className="publish-deployed-url"
                    href={deployedUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(deployedUrl, '_blank');
                    }}
                  >
                    {formatIpfsUrl(deployedUrl)}
                  </a>
                ) : (
                  <span className="publish-status-text">Not published yet</span>
                )}
              </div>

              {/* Publish to Test Domain */}
              <button
                className="publish-primary-btn"
                onClick={handlePublishToTestDomain}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <>
                    <span className="publish-spinner" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
                    Publish to Test Domain
                  </>
                )}
              </button>

              {/* Custom Domain */}
              <div className="publish-custom-domain">
                <div className="publish-custom-domain-header">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>language</span>
                  <span>Custom Domain</span>
                  {!isPioneer && (
                    <span className="publish-pioneer-badge">Pioneer</span>
                  )}
                </div>
                {!isPioneer ? (
                  <button
                    className="publish-upgrade-btn"
                    onClick={() => {
                      setShowUpgradePopup(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>workspace_premium</span>
                    Upgrade to Pioneer
                  </button>
                ) : (
                  <button
                    className="publish-action-btn"
                    onClick={handleSnsDeploy}
                    disabled={!walletAddress}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
                    {walletAddress ? 'Connect SNS Domain' : 'Connect Wallet First'}
                  </button>
                )}
              </div>
            </div>

            <hr className="publish-divider" />

            {/* ── Section 3: Share ── */}
            <div className="publish-section">
              <p className="publish-section-title">Share</p>
              <button
                className="publish-action-btn"
                onClick={() => {
                  setShowShareModal(true);
                  setIsDropdownOpen(false);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
                Share for Feedback
                {shareUrl && (
                  <span className="material-symbols-outlined share-success-icon" style={{ fontSize: 14, color: '#4caf50', marginLeft: 'auto' }}>check_circle</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      {showSnsSelector && (
        <SnsDomainSelector
          userId={userId}
          projectId={projectId}
          walletAddress={walletAddress}
          elements={elements}
          websiteSettings={websiteSettings}
          onDomainSelected={handleSnsDomainSelected}
          onCancel={handleSnsCancel}
          setAutoSaveStatus={setOperationStatus}
          generateFullHtml={() => generateProjectHtml(elements, websiteSettings, dashboardData)}
        />
      )}
      {showUpgradePopup && (
        <UpgradePopup onClose={() => setShowUpgradePopup(false)} />
      )}
      {showShareModal && (
        <Suspense fallback={null}>
          <ShareProject
            elements={elements}
            websiteSettings={websiteSettings}
            userId={userId}
            projectId={projectId}
            pages={pages}
            shareUrl={shareUrl}
            onShareUrlGenerated={(url) => setShareUrl(url)}
            onClose={() => setShowShareModal(false)}
            dashboardData={dashboardData}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExportSection;
