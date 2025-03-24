import React from 'react';
import { useLocation } from 'react-router-dom';

const WebsiteInfo = ({ projectName, description, faviconUrl, url }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // Fallback return URL if none is provided
  const returnUrl = searchParams.get('returnUrl') || 
    (window.location.hostname === "localhost" 
      ? "http://localhost:3000/dashboard" 
      : "https://dashboard.dappzy.io");

  const handleReturn = () => {
    window.location.href = returnUrl;
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
        <div className='project-details-url'>
          <span className="project-url">{url}</span>
          <span className="material-symbols-outlined" style={{ fontSize: "12px", textDecoration: 'none' }}>
            open_in_new
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebsiteInfo;
