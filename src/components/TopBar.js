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
  pageSettings,
  userId,
  projectId
}) => {
  const { elements, buildHierarchy } = useContext(EditableContext);

  const projectName = pageSettings.siteTitle || 'My Website';
  const description = pageSettings.description || 'My Website';
  const faviconUrl = pageSettings.faviconUrl || '';

  // Determine base URL based on hostname
  const isLocal = window.location.hostname === 'localhost';
  const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.dappzy.io';

  // Set initial project URL
  const [projectUrl, setProjectUrl] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update the URL based on available options
  useEffect(() => {
    const updateProjectUrl = () => {
      // Priority order: SNS domain > IPFS URL > Test URL > Default URL
      if (pageSettings.snsDomain) {
        setProjectUrl(`https://${pageSettings.snsDomain}`);
      } else if (pageSettings.ipfsUrl) {
        setProjectUrl(pageSettings.ipfsUrl);
      } else if (pageSettings.testUrl) {
        setProjectUrl(pageSettings.testUrl);
      } else {
        setProjectUrl(`${baseUrl}/${userId}/${projectName}`);
      }
    };

    updateProjectUrl();
  }, [pageSettings, baseUrl, userId, projectName]);

  // Function to handle dropdown state changes
  const handleDropdownToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
    // If dropdown is being opened, update the URL
    if (isOpen) {
      // Priority order: SNS domain > IPFS URL > Test URL > Default URL
      if (pageSettings.snsDomain) {
        setProjectUrl(`https://${pageSettings.snsDomain}`);
      } else if (pageSettings.ipfsUrl) {
        setProjectUrl(pageSettings.ipfsUrl);
      } else if (pageSettings.testUrl) {
        setProjectUrl(pageSettings.testUrl);
      } else {
        setProjectUrl(`${baseUrl}/${userId}/${projectName}`);
      }
    }
  };

  // Function to handle project updates
  const handleProjectUpdate = (newSettings) => {
    if (newSettings.snsDomain) {
      setProjectUrl(`https://${newSettings.snsDomain}`);
    } else if (newSettings.ipfsUrl) {
      setProjectUrl(newSettings.ipfsUrl);
    } else if (newSettings.testUrl) {
      setProjectUrl(newSettings.testUrl);
    }
  };

  // Determine if the project is deployed
  const isDeployed = !!(pageSettings.snsDomain || pageSettings.ipfsUrl || pageSettings.testUrl);

  return (
    <div className="topbar">
      <WebsiteInfo
        projectName={projectName}
        description={description}
        url={projectUrl}
        faviconUrl={faviconUrl}
        onDropdownToggle={handleDropdownToggle}
        isDeployed={isDeployed}
        snsDomain={pageSettings.snsDomain}
      />
      <Visibility onPreviewToggle={onPreviewToggle} isPreviewMode={isPreviewMode} />
      <ResizeControls scale={scale} onResize={onResize} onScaleChange={setScale} />
      <ExportSection
        elements={elements}
        buildHierarchy={buildHierarchy}
        userId={userId}
        websiteSettings={pageSettings}
        projectId={projectId}
        onProjectPublished={handleProjectUpdate}
      />
    </div>
  );
};

export default Topbar;
