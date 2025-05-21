import React, { useContext } from 'react';
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
  const { elements } = useContext(EditableContext);

  return (
    <div className="topbar">
      <WebsiteInfo
        projectName={pageSettings.siteTitle || 'My Website'}
        description={pageSettings.description || 'My Website'}
        url={pageSettings.url}
        faviconUrl={pageSettings.faviconUrl}
      />
      <Visibility onPreviewToggle={onPreviewToggle} isPreviewMode={isPreviewMode} />
      <ResizeControls scale={scale} onResize={onResize} onScaleChange={setScale} />
      <ExportSection
        elements={elements}
        websiteSettings={pageSettings}
        userId={userId}
        projectId={projectId}
      />
    </div>
  );
};

export default Topbar;
