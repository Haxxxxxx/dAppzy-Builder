// src/components/WebsiteInfo.js
import React from 'react';

const WebsiteInfo = ({ projectName, description, faviconUrl, url }) => (
  <div className="project-info">
    <button className="return-button"><span class="material-symbols-outlined">
      arrow_back_ios
    </span></button>
    {faviconUrl && <img src={faviconUrl} alt="Favicon" className="favicon" />}
    <div className="project-details">
      <span className="project-name">{projectName}</span>
      <div className='project-details-url'>
      <span className="project-url">{url}
        
      </span>
      <span class="material-symbols-outlined" style={{fontSize:"12px", textDecoration:'none',}}>
        open_in_new 
      </span>
      </div>
    </div>
  </div>
);

export default WebsiteInfo;
