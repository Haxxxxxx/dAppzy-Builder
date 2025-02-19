// src/components/Topbar.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import ResizeControls from './TopbarComponents/ResizeControls';
import ExportSection from './TopbarComponents/ExportSection';
import WebsiteInfo from './TopbarComponents/WebsiteInfo';
import Visibility from './TopbarComponents/Visibility';
import './css/Topbar.css';

const Topbar = ({
  onResize,
  scale,setScale,
  onPreviewToggle,
  isPreviewMode,
  pageSettings, // Contains website settings, including siteTitle.
  userId,
}) => {
  const { elements, buildHierarchy } = useContext(EditableContext);

  const projectName = pageSettings.siteTitle || 'My Website';
  const description = pageSettings.description || 'My Website';
  const faviconUrl = pageSettings.faviconUrl || '';

  // Determine base URL based on hostname.
  const isLocal = window.location.hostname === 'localhost';
  const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.3rd-space.io';

  // Construct the preview URL in the format:
  // https://{baseUrl}/{userId}/{projectName}
  const previewUrl = `${baseUrl}/${userId}/${projectName}`;

  return (
    <div className="topbar">
      <WebsiteInfo
        projectName={projectName}
        description={description}
        url={previewUrl}
        faviconUrl={faviconUrl}
      />
      <Visibility onPreviewToggle={onPreviewToggle} isPreviewMode={isPreviewMode} />
      <ResizeControls scale={scale} onResize={onResize} onScaleChange={setScale} />
      <ExportSection
        elements={elements}
        buildHierarchy={buildHierarchy}
        userId={userId}
        websiteSettings={pageSettings} // Pass website settings to ExportSection.
      />
    </div>
  );
};

export default Topbar;
