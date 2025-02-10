// src/BuilderPage.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { EditableContext } from "./context/EditableContext";
import ContentList from "./components/Canva";
import SideBar from "./components/SideBar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./BuilderPage.css";
import Topbar from "./components/TopBar";
import LeftBar from "./components/LeftBar";
import StructurePanel from "./components/LeftbarPanels/StructurePanel";
import MediaPanel from "./components/LeftbarPanels/MediaPanel";
import WebsiteSettingsPanel from "./components/LeftbarPanels/WebsiteSettingsPanel";
import WalletConnection from "./NewLogin/WalletConnection";

function BuilderPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // <--- track the logged-in user’s ID
  const [openPanel, setOpenPanel] = useState("sidebar");
  const [contentListWidth, setContentListWidth] = useState(1200);
  const { setSelectedElement, elements, setElements } = useContext(EditableContext);
  const [scale, setScale] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const contentRef = useRef(null);
  const mainContentRef = useRef(null);
  const [pageSettings, setPageSettings] = useState({
    siteTitle: "My Website",
    faviconUrl: "",
    description: "",
    author: "",
  });

  useEffect(() => {
    const sessionFlag = sessionStorage.getItem("isLoggedIn") === "true";
    if (sessionFlag) {
      setIsLoggedIn(true);
      // Also retrieve the userAccount from sessionStorage if needed
      const storedUserId = sessionStorage.getItem("userAccount");
      if (storedUserId) setUserId(storedUserId);
    }
  }, []);

  // Called after successful wallet connection
  const handleUserLogin = (walletKey) => {
    setIsLoggedIn(true);
    setUserId(walletKey); // <--- store the wallet public key (user ID)
    loadUserProject(walletKey);
  };

  const loadUserProject = async (walletKey) => {
    const projectRef = doc(db, "projects", walletKey);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
      const projectData = projectSnap.data();
      if (projectData?.elements) {
        setElements(projectData.elements);
      }
      // ...
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      const user = auth.currentUser;
      if (!user) return;
      // If you'd rather store under user.uid, you could do that.
      // But if your Phantom "userId" is the doc ID, you can use userId here.
      // Adjust according to your logic.
      const projectRef = doc(db, "projects", user.uid);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        if (projectData?.elements) {
          setElements(projectData.elements);
        }
      }
    };

    fetchProject();
  }, []);

  const handlePreviewToggle = () => {
    setIsPreviewMode((prev) => !prev);
  };

  const handleResize = (size) => {
    setContentListWidth(size);
  };

  const handleUpdateSettings = (updatedSettings) => {
    setPageSettings(updatedSettings);
    console.log("Updated page settings:", updatedSettings);
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

  // If user is not logged in, show the wallet connection screen
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h2>Please connect your wallet to continue</h2>
        <WalletConnection onUserLogin={handleUserLogin} />
      </div>
    );
  }

  // Otherwise, show the builder
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
          {/* Pass userId to Topbar so we can display it or pass to Export */}
          <Topbar
            onResize={handleResize}
            scale={scale}
            isPreviewMode={isPreviewMode}
            onPreviewToggle={handlePreviewToggle}
            pageSettings={pageSettings}
            userId={userId} // <--- pass userId to Topbar
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
