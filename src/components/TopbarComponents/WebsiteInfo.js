// src/components/WebsiteInfo.js
import React from 'react';

const WebsiteInfo = ({ projectName, description, faviconUrl }) => (
  <div className="project-info">
    <button className="return-button">⬅️</button>
    {faviconUrl && <img src={faviconUrl} alt="Favicon" className="favicon" />}
    <div className="project-details">
      <span className="project-name">{projectName}</span>
      <span className="project-description">{description}</span>
    </div>
  </div>
);

export default WebsiteInfo;
