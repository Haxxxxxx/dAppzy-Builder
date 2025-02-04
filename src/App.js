// src/App.js
import React, { useState, useRef, useContext, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { EditableContext } from './context/EditableContext'; // Import EditableContext
import ContentList from './components/Canva';
import SideBar from './components/SideBar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import Topbar from './components/TopBar';
import LeftBar from './components/LeftBar';
import StructurePanel from './components/LeftbarPanels/StructurePanel';
import MediaPanel from './components/LeftbarPanels/MediaPanel';
import WebsiteSettingsPanel from './components/LeftbarPanels/WebsiteSettingsPanel';

function App() {
  const [openPanel, setOpenPanel] = useState('sidebar'); // Track which panel is open
  const [contentListWidth, setContentListWidth] = useState(1200); // Default width for PC
  const { setSelectedElement, elements, setElements } = useContext(EditableContext); // Access setSelectedElement from context
  const [scale, setScale] = useState(1); // Add scale state
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const contentRef = useRef(null); // Reference to the content-list
  const mainContentRef = useRef(null); // Reference to the main-content
  const [pageSettings, setPageSettings] = useState({
    siteTitle: 'My Website',
    faviconUrl: '',
    description: '',
    author: '',
  });

  const handlePreviewToggle = () => {
    setIsPreviewMode((prevMode) => !prevMode);
  };

  const handleResize = (size) => {
    setContentListWidth(size);
  };

  const handleUpdateSettings = (updatedSettings) => {
    setPageSettings(updatedSettings);
    console.log('Updated page settings:', updatedSettings);
  };

  const handlePanelToggle = (panelName) => {
    console.log(`Toggling panel to: ${panelName}`);
    setOpenPanel((prevPanel) => {
      const newPanel = prevPanel === panelName ? '' : panelName;
      console.log(`New openPanel state: ${newPanel}`);
      return newPanel;
    });
  };

  const handleOpenMediaPanel = () => {
    console.log("passed for opening the media panel");
  
    setOpenPanel((prevPanel) => {
      if (prevPanel === 'media') {
        console.log("Media Panel is already open, not toggling");
        return prevPanel; // Keep the Media Panel open
      }
      console.log("Opening Media Panel");
      return 'media'; // Open the Media Panel
    });
  };
  
  
  const handleMainContentClick = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      setSelectedElement(null); // Set to null to clear selection
    }
  };
  // // Manage panel display based on selected element type
  // useEffect(() => {
  //   if (selectedElement?.type === 'image') {
  //     setOpenPanel('media'); // Show Media Panel for images
  //   } else if (selectedElement && selectedElement.type !== 'image') {
  //     setOpenPanel('sidebar'); // Show Sidebar for non-image elements
  //   }
  //   else{
  //     return;
  //   }
  // }, [selectedElement]);

  useEffect(() => {
    console.log('Current openPanel:', openPanel);
  }, [openPanel]);



  useEffect(() => {
    const fetchProject = async () => {
      const user = auth.currentUser;
      if (!user) return; // no user => no load
      
      const projectRef = doc(db, 'projects', user.uid);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        // Set the elements in your context so the builder sees them
        if (projectData?.elements) {
          setElements(projectData.elements);
        }
        // If needed, you can also parse the `html` or other fields
      }
    };

    fetchProject();
  }, []);



  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layout">
        <LeftBar
          openPanel={openPanel} // Pass openPanel to LeftBar

          onShowSidebar={() => handlePanelToggle('sidebar')}
          onShowStructurePanel={() => handlePanelToggle('structure')}
          onShowMediaPanel={() => handlePanelToggle('media')}
          onShowSettingsPanel={() => handlePanelToggle('settings')}
        />
        <div className="app">
          <Topbar
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
            {openPanel === 'media' ? (
              <div id="media-panel">
                {console.log("Rendering MediaPanel")}
                <MediaPanel />
              </div>
            ) : (
              console.log("MediaPanel not rendered. Current openPanel:", openPanel)
            )}

            {openPanel === 'settings' && (
              <div id="settings-panel">
                <WebsiteSettingsPanel onUpdateSettings={handleUpdateSettings} />
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
                handleOpenMediaPanel={handleOpenMediaPanel}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
