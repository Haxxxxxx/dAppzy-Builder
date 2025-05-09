import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const WebsiteInfo = ({ projectName, description, faviconUrl, url, onProjectPublished }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [projectUrl, setProjectUrl] = useState(url || 'Not deployed yet');
  const [isDeployed, setIsDeployed] = useState(!!url);
  const [showUrl, setShowUrl] = useState(false);

  // Fallback return URL if none is provided
  const returnUrl = searchParams.get('returnUrl') ||
    (window.location.hostname === "localhost"
      ? "http://localhost:3000/dashboard"
      : "https://dashboard.dappzy.io");

  useEffect(() => {
    // Update URL when it changes from parent
    if (url) {
      setProjectUrl(url);
      setIsDeployed(true);
      // Only show URL if it's a proper IPFS URL
      setShowUrl(url.includes('ipfs.io'));
    } else {
      setShowUrl(false);
    }
  }, [url]);

  const handleReturn = () => {
    window.location.href = returnUrl;
  };

  const handleUrlClick = () => {
    if (isDeployed && projectUrl !== 'Not deployed yet') {
      window.open(projectUrl, '_blank');
    }
  };

  // Helper function to format and shorten the URL
  const formatUrl = (url) => {
    if (!url || url === 'Not deployed yet') {
      return 'Not deployed yet';
    }

    try {
      // Handle IPFS URLs
      if (url.includes('ipfs.io')) {
        const ipfsHash = url.split('/').pop();
        return `ipfs://${ipfsHash}`;
      }

      // Handle other URLs
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const path = urlObj.pathname;

      if (hostname.length > 20) {
        const start = hostname.substring(0, 8);
        const end = hostname.substring(hostname.length - 8);
        return `${start}...${end}${path}`;
      }

      return `${hostname}${path}`;
    } catch (error) {
      console.error('Error formatting URL:', error);
      return url;
    }
  };

  return (
    <div className="project-info">
      <button className="return-button" onClick={handleReturn}>
        <span className="material-symbols-outlined">
          arrow_back_ios
        </span>
      </button>
      {faviconUrl && <img src={faviconUrl} alt="Favicon" className="favicon" />}
      <div className="project-details">
        <span className="project-name">{projectName}</span>
        {showUrl && (
          <div 
            className="project-details-url clickable"
            onClick={handleUrlClick}
            style={{ cursor: 'pointer' }}
          >
            <span className="project-url">My Website URL</span>
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
