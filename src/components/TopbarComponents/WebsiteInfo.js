import React from 'react';
import { useNavigate } from 'react-router-dom';

const WebsiteInfo = ({ projectName, description, faviconUrl, url }) => {
  const navigate = useNavigate();
  
  const handleReturn = () => {
    // Optionally, read your auth cookie to confirm the logged in status
    // For example: const authToken = document.cookie.split(';').find(c => c.trim().startsWith("authToken="));
    // Then navigate to the dashboard URL which, in production, might be "https://dashboard.myurl.com".
    // For local development, if you have set up your hosts file to simulate subdomains, you might do:
    window.location.href = "http://localhost:3000/dashboard"; 
    // or in production:
    // window.location.href = "https://dashboard.dappzy.io";
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
