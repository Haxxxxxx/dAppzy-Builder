// src/App.js
import React, { useState, useRef, useContext } from 'react';
import { EditableContext } from './context/EditableContext'; // Import EditableContext
import ContentList from './components/Canva';
import SideBar from './components/SideBar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import Topbar from './components/TopBar';
import { exportFiles } from './utils/ExportContent';
import LeftBar from './components/LeftBar';
import StructurePanel from './components/LeftbarPanels/StructurePanel';
import MediaPanel from './components/LeftbarPanels/MediaPanel';
import SettingsPanel from './components/LeftbarPanels/SettingsPanel';

function App() {
  const [openPanel, setOpenPanel] = useState(''); // Track which panel is open
  const [contentListWidth, setContentListWidth] = useState(1200); // Default width for PC
  const { setSelectedElement } = useContext(EditableContext); // Access setSelectedElement from context
  const [scale, setScale] = useState(1); // Add scale state
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const contentRef = useRef(null); // Reference to the content-list
  const mainContentRef = useRef(null); // Reference to the main-content
  const [pageSettings, setPageSettings] = useState({
    siteTitle: 'My Webpage',
    faviconUrl: '',
    description: '',
    author: '',
  });

  const handlePreviewToggle = () => {
    setIsPreviewMode((prevMode) => !prevMode);
  };

  const handleExport = (elements) => {
    console.log('Export function called with elements:', elements);
    exportFiles(elements);
  };

  const handleResize = (size) => {
    setContentListWidth(size);
  };

  const handleUpdateSettings = (updatedSettings) => {
    setPageSettings(updatedSettings);
    console.log('Updated page settings:', updatedSettings);
  };

  const handlePanelToggle = (panelName) => {
    setOpenPanel((prevPanel) => (prevPanel === panelName ? '' : panelName));
  };

  const handleMainContentClick = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      setSelectedElement(null); // Set to null to clear selection
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layout">
        <LeftBar
          onShowSidebar={() => handlePanelToggle('sidebar')}
          onShowStructurePanel={() => handlePanelToggle('structure')}
          onShowMediaPanel={() => handlePanelToggle('media')}
          onShowSettingsPanel={() => handlePanelToggle('settings')}
        />
        <div className="app">
          <Topbar
            onExport={handleExport}
            onResize={handleResize}
            scale={scale}
            isPreviewMode={isPreviewMode}
            onPreviewToggle={handlePreviewToggle}
            pageSettings={pageSettings} // Pass pageSettings to Topbar
          />
          <div className="content-container">
            {openPanel === 'sidebar' && (
              <div className="sidebar" id="sidebar">
                <SideBar contentListWidth={contentListWidth} />
              </div>
            )}
            {openPanel === 'structure' && (
              <div id="structure-panel">
                <StructurePanel />
              </div>
            )}
            {openPanel === 'media' && (
              <div id="media-panel">
                <MediaPanel />
              </div>
            )}
            {openPanel === 'settings' && (
              <div id="settings-panel">
                <SettingsPanel onUpdateSettings={handleUpdateSettings} />
              </div>
            )}
            <div
              className="main-content"
              onClick={handleMainContentClick}
              ref={mainContentRef}
            >
              <ContentList
                contentListWidth={contentListWidth}
                isSideBarVisible={openPanel === 'sidebar'}
                leftBarWidth={40}
                handlePanelToggle={handlePanelToggle}
                ref={contentRef} // Pass ref to ContentList
                scale={scale}
                setScale={setScale} // Pass setScale to ContentList
                isPreviewMode={isPreviewMode} // Pass isPreviewMode here
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
