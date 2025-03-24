import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../context/EditableContext';
import ResizeControls from './TopbarComponents/ResizeControls';
import ExportSection from './TopbarComponents/ExportSection';
import WebsiteInfo from './TopbarComponents/WebsiteInfo';
import Visibility from './TopbarComponents/Visibility';
import './css/Topbar.css';

const Topbar = ({
  onResize,
  scale,
  setScale,
  onPreviewToggle,
  isPreviewMode,
  pageSettings, // Contains website settings, including siteTitle.
  userId,
  projectId
}) => {
  const { elements, buildHierarchy } = useContext(EditableContext);

  const projectName = pageSettings.siteTitle || 'My Website';
  const description = pageSettings.description || 'My Website';
  const faviconUrl = pageSettings.faviconUrl || '';

  // Determine base URL based on hostname.
  const isLocal = window.location.hostname === 'localhost';
  const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.dappzy.io';

  // Set initial project URL (Web2 preview) 
  const [projectUrl, setProjectUrl] = useState(`${baseUrl}/${userId}/${projectName}`);

  // Update the URL if pageSettings change and there's no IPFS URL yet.
  useEffect(() => {
    if (!pageSettings.testUrl) {
      setProjectUrl(`${baseUrl}/${userId}/${projectName}`);
    }
  }, [pageSettings, baseUrl, userId, projectName]);

  return (
    <div className="topbar">
      <WebsiteInfo
        projectName={projectName}
        description={description}
        url={projectUrl}
        faviconUrl={faviconUrl}
      />
      <Visibility onPreviewToggle={onPreviewToggle} isPreviewMode={isPreviewMode} />
      <ResizeControls scale={scale} onResize={onResize} onScaleChange={setScale} />
      <ExportSection
        elements={elements}
        buildHierarchy={buildHierarchy}
        userId={userId}
        websiteSettings={pageSettings}
        projectId={projectId}
        onProjectPublished={(ipfsUrl) => setProjectUrl(ipfsUrl)}
      />
    </div>
  );
};

export default Topbar;
