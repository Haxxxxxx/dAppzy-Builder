import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AutoSaveContext } from '../../context/AutoSaveContext';
import { auth } from '../../firebase';

const WebsiteInfo = ({ projectName, description, faviconUrl, url, onDropdownToggle, isDeployed, snsDomain, onBackToProjects, onProjectNameChange }) => {
  const { saveStatus } = useContext(AutoSaveContext);
  const hasUnsavedChanges = saveStatus && saveStatus !== 'All changes saved';
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [projectUrl, setProjectUrl] = useState(url || 'Not deployed yet');
  const [showUrl, setShowUrl] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const nameRef = useRef(null);

  const handleNameBlur = useCallback(() => {
    if (!nameRef.current || !onProjectNameChange) return;
    const newName = nameRef.current.innerText.trim();
    if (newName && newName !== projectName) {
      onProjectNameChange(newName);
    } else if (!newName) {
      // Revert to current name if blank
      nameRef.current.innerText = projectName;
    }
  }, [projectName, onProjectNameChange]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nameRef.current?.blur();
    }
    if (e.key === 'Escape') {
      nameRef.current.innerText = projectName;
      nameRef.current?.blur();
    }
  }, [projectName]);

  // Validate returnUrl to prevent open redirect attacks
  const ALLOWED_RETURN_HOSTS = ['dashboard.dappzy.io', 'dappzy.io', 'www.dappzy.io', 'localhost'];
  const defaultReturnUrl = window.location.hostname === "localhost"
    ? "http://localhost:3000/dashboard"
    : "https://dashboard.dappzy.io";

  const rawReturnUrl = searchParams.get('returnUrl');
  let returnUrl = defaultReturnUrl;
  if (rawReturnUrl) {
    // Allow relative paths
    if (rawReturnUrl.startsWith('/')) {
      returnUrl = rawReturnUrl;
    } else {
      try {
        const parsed = new URL(rawReturnUrl);
        if (ALLOWED_RETURN_HOSTS.includes(parsed.hostname)) {
          returnUrl = rawReturnUrl;
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('[WebsiteInfo] Invalid returnUrl:', err);
      }
    }
  }

  useEffect(() => {
    // Update URL when it changes from parent
    if (url) {
      setProjectUrl(url);
      // Show URL if it's a personal domain, IPFS URL, or if dropdown is open
      setShowUrl(snsDomain || url.includes('ipfs.io') || isDropdownOpen);
    } else {
      setShowUrl(false);
    }
  }, [url, isDropdownOpen, snsDomain]);

  const handleReturn = async () => {
    // Append Firebase ID token for cross-origin auth handoff (builder → dashboard)
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
        const url = new URL(returnUrl, window.location.origin);
        url.hash = `token=${idToken}`;
        window.location.href = url.toString();
        return;
      }
    } catch {
      // Fall through to plain redirect if token retrieval fails
    }
    window.location.href = returnUrl;
  };

  const handleUrlClick = () => {
    if (isDeployed && projectUrl !== 'Not deployed yet') {
      window.open(projectUrl, '_blank');
    }
  };

  const handleDropdownClick = () => {
    const newDropdownState = !isDropdownOpen;
    setIsDropdownOpen(newDropdownState);
    if (onDropdownToggle) {
      onDropdownToggle(newDropdownState);
    }
  };

  // Helper function to format SNS domain URL
  const formatSnsUrl = (url) => {
    if (!url || url === 'Not deployed yet') return 'Not deployed yet';
    try {
      // Check if it's a .sol domain
      if (url.includes('.sol')) {
        return url;
      }
      return url;
    } catch (error) {
      return url;
    }
  };

  // Helper function to format IPFS URL for display
  const formatIpfsUrl = (url) => {
    if (!url || url === 'Not deployed yet') return 'Not deployed yet';
    try {
      // Extract the hash from the URL
      const hash = url.split('/').pop();
      // Return a shorter, more readable format
      return `ipfs://${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    } catch (error) {
      return url;
    }
  };

  // Helper function to format regular URL
  const formatRegularUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const path = urlObj.pathname;

      // If the hostname is too long, truncate it
      if (hostname.length > 20) {
        const start = hostname.substring(0, 8);
        const end = hostname.substring(hostname.length - 8);
        return `${start}...${end}${path}`;
      }

      return `${hostname}${path}`;
    } catch (error) {
      return url;
    }
  };

  // Main URL formatting function
  const formatUrl = (url) => {
    if (!url || url === 'Not deployed yet') {
      return 'Not deployed yet';
    }

    // Check for .sol domain first
    if (url.includes('.sol')) {
      return formatSnsUrl(url);
    }

    // Then check for IPFS URL
    if (url.includes('ipfs.io')) {
      return formatIpfsUrl(url);
    }

    // Finally, format as regular URL
    return formatRegularUrl(url);
  };

  // Determine if we should show the URL
  const shouldShowUrl = () => {
    if (!projectUrl || projectUrl === 'Not deployed yet') return false;
    return snsDomain || projectUrl.includes('ipfs.io') || showUrl;
  };

  return (
    <div className="project-info">
      <button
        className="return-button"
        onClick={onBackToProjects || handleReturn}
        title={onBackToProjects ? 'Back to Projects' : 'Back to Dashboard'}
      >
        <span className="material-symbols-outlined">arrow_back_ios</span>
        {onBackToProjects && (
          <span style={{
            fontSize: '13px',
            fontFamily: 'var(--font-primary)',
            fontWeight: 500,
            color: 'inherit',
          }}>Projects</span>
        )}
      </button>
      {faviconUrl && <img src={faviconUrl} alt="Favicon" className="favicon" />}
      <div className="project-details" onClick={handleDropdownClick}>
        <span className="project-name">
          <span
            ref={nameRef}
            className="project-name-editable"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            onClick={(e) => e.stopPropagation()}
          >
            {projectName}
          </span>
          {hasUnsavedChanges && (
            <span
              className="unsaved-dot"
              title={saveStatus}
              aria-label="Unsaved changes"
            />
          )}
        </span>
        {shouldShowUrl() && (
          <div 
            className="project-details-url clickable"
            onClick={(e) => {
              e.stopPropagation();
              handleUrlClick();
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="project-url" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              {formatUrl(projectUrl)}
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: "12px", textDecoration: 'none' }}>
              open_in_new
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteInfo;
