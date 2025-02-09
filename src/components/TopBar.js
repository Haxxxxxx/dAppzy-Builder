// src/components/Topbar.js
import React, { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import ResizeControls from './TopbarComponents/ResizeControls';
import ExportSection from './TopbarComponents/ExportSection';
import WebsiteInfo from './TopbarComponents/WebsiteInfo';
import Visibility from './TopbarComponents/Visibility';
import './css/Topbar.css'

const Topbar = ({
  onResize,
  scale,
  onPreviewToggle,
  isPreviewMode,
  pageSettings,
  userId // <--- added
}) => {
  const { elements, buildHierarchy } = useContext(EditableContext);

  const projectName = pageSettings.siteTitle || 'My Website';
  const description = pageSettings.description || 'My Website';
  const faviconUrl = pageSettings.faviconUrl || '';
  const hostingUrl = 'https://jesuisuneurl/';
  
  return (
    <div className="topbar">
      <WebsiteInfo
        projectName={projectName}
        description={description}
        url={hostingUrl}
        faviconUrl={faviconUrl}
      />
      <Visibility onPreviewToggle={onPreviewToggle} isPreviewMode={isPreviewMode} />
      <ResizeControls scale={scale} onResize={onResize} />


      <ExportSection
        elements={elements}
        buildHierarchy={buildHierarchy}
        // Pass userId to ExportSection to store under that doc
        userId={userId}
      />
    </div>
  );
};

export default Topbar;
