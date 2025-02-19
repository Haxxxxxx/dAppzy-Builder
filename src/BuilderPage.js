// src/BuilderPage.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { EditableContext } from "./context/EditableContext";
import ContentList from "./components/Canva";
import SideBar from "./components/SideBar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./BuilderPage.css";
import LeftBar from "./components/LeftBar";
import StructurePanel from "./components/LeftbarPanels/StructurePanel";
import MediaPanel from "./components/LeftbarPanels/MediaPanel";
import WebsiteSettingsPanel from "./components/LeftbarPanels/WebsiteSettingsPanel";
import WalletConnection from "./NewLogin/WalletConnection";
import Topbar from "./components/TopBar";

function BuilderPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [openPanel, setOpenPanel] = useState("sidebar");
  const [contentListWidth, setContentListWidth] = useState(1200);
  const { setSelectedElement, setElements } = useContext(EditableContext);
  const [scale, setScale] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [availableCanvasWidth, setAvailableCanvasWidth] = useState(0);

  const contentRef = useRef(null);
  const mainContentRef = useRef(null);

  // Page settings for the website (project info)
  const [pageSettings, setPageSettings] = useState({
    siteTitle: "My Website",
    faviconUrl: "",
    description: "",
    author: "",
    // Optionally include customUrl if desired.
  });

  // On first load, check sessionStorage for login info.
  useEffect(() => {
    const sessionFlag = sessionStorage.getItem("isLoggedIn") === "true";
    const storedUserId = sessionStorage.getItem("userAccount");
    if (sessionFlag && storedUserId) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
    }
  }, []);

  // Whenever userId changes, load the user’s project.
  useEffect(() => {
    if (!userId) return;
    loadUserProject(userId);
  }, [userId]);

  // Load user’s project from Firestore (including website settings)
  const loadUserProject = async (uid) => {
    setLoadingProject(true); // start spinner
    try {
      const projectRef = doc(db, "projects", uid);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        if (projectData?.elements) {
          setElements(projectData.elements);
        }
        if (projectData?.websiteSettings) {
          setPageSettings(projectData.websiteSettings);
          // Save website settings to localStorage for other panels.
          localStorage.setItem("websiteSettings", JSON.stringify(projectData.websiteSettings));
        } else {
          // If no websiteSettings exist, store the default.
          localStorage.setItem("websiteSettings", JSON.stringify(pageSettings));
        }
      } else {
        console.log("No project doc found for user:", uid);
      }
    } catch (error) {
      console.error("Error loading user project:", error);
    } finally {
      setLoadingProject(false); // stop spinner
    }
  };

  // Called after successful wallet connection.
  const handleUserLogin = (walletKey) => {
    setIsLoggedIn(true);
    setUserId(walletKey);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userAccount", walletKey);
  };

  const handlePreviewToggle = () => {
    setIsPreviewMode((prev) => !prev);
  };

  const handleResize = (size) => {
    setContentListWidth(size);
  };

  const handleUpdateSettings = (updatedSettings) => {
    setPageSettings(updatedSettings);
    // Store updated settings in localStorage for persistence.
    localStorage.setItem("websiteSettings", JSON.stringify(updatedSettings));
  };

  const handlePanelToggle = (panelName) => {
    setOpenPanel((prevPanel) => (prevPanel === panelName ? "" : panelName));
  };

  const handleOpenMediaPanel = () => {
    setOpenPanel((prevPanel) => (prevPanel === "media" ? prevPanel : "media"));
  };

  const handleMainContentClick = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      setSelectedElement(null);
    }
  };
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (mainContentRef.current) {
        const { width } = mainContentRef.current.getBoundingClientRect();
        setAvailableCanvasWidth(width);
      }
    };

    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, []);
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <WalletConnection onUserLogin={handleUserLogin} />
      </div>
    );
  }

  if (loadingProject) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your project, please wait...</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layout">
        <LeftBar
          openPanel={openPanel}
          onShowSidebar={() => handlePanelToggle("sidebar")}
          onShowStructurePanel={() => handlePanelToggle("structure")}
          onShowMediaPanel={() => handlePanelToggle("media")}
          onShowSettingsPanel={() => handlePanelToggle("settings")}
        />
        <div className="app">
          <Topbar
            onResize={handleResize}
            scale={scale}
            setScale={setScale}
            isPreviewMode={isPreviewMode}
            onPreviewToggle={handlePreviewToggle}
            pageSettings={pageSettings}
            userId={userId}
          />
          <div className="content-container">
            {openPanel === "sidebar" && (
              <div className="sidebar" id="sidebar">
                <SideBar contentListWidth={contentListWidth} />
              </div>
            )}
            {openPanel === "structure" && (
              <div id="structure-panel">
                <StructurePanel />
              </div>
            )}
            {openPanel === "media" && (
              <div id="media-panel">
                <MediaPanel />
              </div>
            )}
            {openPanel === "settings" && (
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
                canvasWidth={availableCanvasWidth} // Pass the available width here

                isSideBarVisible={openPanel === "sidebar"}
                leftBarWidth={40}
                handlePanelToggle={handlePanelToggle}
                ref={contentRef}
                scale={scale}
                setScale={setScale}
                isPreviewMode={isPreviewMode}
                handleOpenMediaPanel={handleOpenMediaPanel}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default BuilderPage;
