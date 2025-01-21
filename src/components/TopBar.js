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
}) => {
  const { elements, buildHierarchy } = useContext(EditableContext);

  const projectName = pageSettings.siteTitle || 'My Website';
  const description = pageSettings.description || 'My Website';
  const faviconUrl = pageSettings.faviconUrl || '';

  return (
    <div className="topbar">
      <WebsiteInfo
        projectName={projectName}
        description={description}
        faviconUrl={faviconUrl}
      />
      <Visibility
        onPreviewToggle={onPreviewToggle}
        isPreviewMode={isPreviewMode}
      />
      <ResizeControls scale={scale} onResize={onResize} />
      <ExportSection elements={elements} buildHierarchy={buildHierarchy} />
    </div>
  );
};

export default Topbar;
