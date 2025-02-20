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

function BuilderPage({ userId, setUserId }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true); // Start as true until Firestore fetch completes
  const [openPanel, setOpenPanel] = useState("sidebar");
  const [contentListWidth, setContentListWidth] = useState(1200);

  const { setSelectedElement, setElements } = useContext(EditableContext);
  const [scale, setScale] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [availableCanvasWidth, setAvailableCanvasWidth] = useState(0);

  const contentRef = useRef(null);
  const mainContentRef = useRef(null);

  /**
   * Store website settings. These are updated either from DB or from user changes in `WebsiteSettingsPanel`.
   */
  const [pageSettings, setPageSettings] = useState({
    siteTitle: "My Website",
    faviconUrl: "",
    description: "",
    author: "",
  });

  /**
   * (1) Check sessionStorage for login on mount
   */
  useEffect(() => {
    const sessionFlag = sessionStorage.getItem("isLoggedIn") === "true";
    const storedUserId = sessionStorage.getItem("userAccount");
    console.log("Session flag:", sessionFlag);
    console.log("Stored userId:", storedUserId);

    if (sessionFlag && storedUserId) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
    } else {
      // If not logged in, no need to load project
      setLoadingProject(false);
    }
  }, [setUserId]);

  /**
   * (2) If we have a userId, load the Firestore project data
   */
  useEffect(() => {
    if (!userId) return;
    console.log("Loading project for userId:", userId);
    loadUserProject(userId);
  }, [userId]);

  /**
   * (3) Fetch the project document from Firestore
   */
  const loadUserProject = async (uid) => {
    setLoadingProject(true);
    try {
      const projectRef = doc(db, "projects", uid);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        // If we have custom elements, load them into state
        if (projectData?.elements) {
          setElements(projectData.elements);
        }
        // If Firestore has website settings, use those
        if (projectData?.websiteSettings) {
          setPageSettings(projectData.websiteSettings);
          localStorage.setItem(
            "websiteSettings",
            JSON.stringify(projectData.websiteSettings)
          );
        } else {
          // If no DB settings, store default in localStorage
          localStorage.setItem("websiteSettings", JSON.stringify(pageSettings));
        }
      } else {
        // If no doc found, user hasn't created project => open Settings panel
        console.log("No project doc found for user:", uid);
        setOpenPanel("settings");
      }
    } catch (error) {
      console.error("Error loading user project:", error);
    } finally {
      // Done loading, hide spinner
      setLoadingProject(false);
    }
  };

  /**
   * (4) Handle user login from WalletConnection
   */
  const handleUserLogin = (walletKey) => {
    console.log("User logged in with walletKey:", walletKey);
    setIsLoggedIn(true);
    setUserId(walletKey);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userAccount", walletKey);
    console.log("userId set in sessionStorage:", walletKey);
  };

  /**
   * (5) Builder UI handlers
   */
  const handlePreviewToggle = () => {
    setIsPreviewMode((prev) => !prev);
  };

  const handleResize = (size) => {
    setContentListWidth(size);
  };

  const handleUpdateSettings = (updatedSettings) => {
    setPageSettings(updatedSettings);
    // Also store in localStorage so we don't lose it
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

  /**
   * (6) Compute canvas width on resize
   */
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (mainContentRef.current) {
        const { width } = mainContentRef.current.getBoundingClientRect();
        setAvailableCanvasWidth(width);
      }
    };
    updateCanvasWidth();
    window.addEventListener("resize", updateCanvasWidth);
    return () => window.removeEventListener("resize", updateCanvasWidth);
  }, []);

  /**
   * (7) Render / Return
   */
  // If not logged in, show the wallet login
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <WalletConnection onUserLogin={handleUserLogin} />
      </div>
    );
  }

  // If Firestore project is still loading, show spinner
  if (loadingProject) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your project, please wait...</p>
      </div>
    );
  }

  // Otherwise, show the Builder UI
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
          {/* 
            The Topbar gets the "pageSettings" which has siteTitle, 
            so it can display the correct title in the UI 
          */}
          <Topbar
            onResize={handleResize}
            scale={scale}
            setScale={setScale}
            isPreviewMode={isPreviewMode}
            onPreviewToggle={handlePreviewToggle}
            pageSettings={pageSettings} // siteTitle, faviconUrl, etc.
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
                <MediaPanel
                  projectName={pageSettings.siteTitle}
                  isOpen={openPanel}
                  userId={userId}
                />
              </div>
            )}

            {openPanel === "settings" && (
              <div id="settings-panel">
                <WebsiteSettingsPanel
                  onUpdateSettings={handleUpdateSettings}
                  userId={userId}
                />
              </div>
            )}

            <div
              className="main-content"
              onClick={handleMainContentClick}
              ref={mainContentRef}
            >
              <ContentList
                contentListWidth={contentListWidth}
                canvasWidth={availableCanvasWidth}
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
