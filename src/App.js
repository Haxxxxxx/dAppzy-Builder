// src/App.js
import React, { useState } from 'react';
import { EditableProvider } from './context/EditableContext';
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
  const [openPanel, setOpenPanel] = useState(null); // Track which panel is open (null means no panel is open)
  const [contentListWidth, setContentListWidth] = useState(1200); // Default width for PC
  const [pageSettings, setPageSettings] = useState({
    title: 'My Webpage',
    iconUrl: '',
    description: '',
    author: '',
  });

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
    setOpenPanel((prevPanel) => (prevPanel === panelName ? null : panelName));
  };

  console.log('App contentListWidth:', contentListWidth);

  return (
    <EditableProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="layout">
          <LeftBar
            onShowSidebar={() => handlePanelToggle('sidebar')}
            onShowStructurePanel={() => handlePanelToggle('structure')}
            onShowMediaPanel={() => handlePanelToggle('media')}
            onShowSettingsPanel={() => handlePanelToggle('settings')}
          />
          <div className="app">
            <Topbar onExport={handleExport} onResize={handleResize} />
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
              <div className="main-content">
                <ContentList
                  contentListWidth={contentListWidth}
                  isSideBarVisible={openPanel === 'sidebar'}
                  leftBarWidth={40} // Width of the left bar
                />
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </EditableProvider>
  );
}

export default App;
