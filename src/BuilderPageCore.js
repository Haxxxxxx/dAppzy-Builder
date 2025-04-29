// BuilderPageCore.js
import React, { useRef, useEffect, useContext, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./BuilderPage.css";
import LeftBar from "./components/LeftBar";
import StructurePanel from "./components/LeftbarPanels/StructurePanel";
import MediaPanel from "./components/LeftbarPanels/MediaPanel";
import WebsiteSettingsPanel from "./components/LeftbarPanels/WebsiteSettingsPanel";
import ContentList from "./components/ContentList";
import { EditableContext } from "./context/EditableContext";
import Topbar from "./components/TopBar";
import SideBar from './components/SideBar'
import AIAgentPanel from "./components/LeftbarPanels/AIAgentPanel";
import AIFloatingButton from "./components/AIFloatingButton";

const BuilderPageCore = ({
  userId,
  projectId,
  setUserId,
  openPanel,
  setOpenPanel,
  contentListWidth,
  setContentListWidth,
  projects,
  activeProjectId,
  setActiveProjectId,
  pageSettings,
  setPageSettings,
  scale,
  setScale,
  isPreviewMode,
  setIsPreviewMode,
  availableCanvasWidth,
  setAvailableCanvasWidth,
  saveUserProject,
}) => {
  const contentRef = useRef(null);
  const mainContentRef = useRef(null);
  const { setSelectedElement } = useContext(EditableContext);
  const [showAIInputBar, setShowAIInputBar] = useState(false);
  const [initialAIMessages, setInitialAIMessages] = useState(null);
  const [aiChatStarted, setAIChatStarted] = useState(false);

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

  const handleAIFloatingButtonClick = () => {
    setShowAIInputBar(true);
  };

  const handleFirstPrompt = (userMessage) => {
    setShowAIInputBar(false);
    setInitialAIMessages([userMessage]);
    setOpenPanel("ai");
    setAIChatStarted(true);
  };

  const handleShowAIPanel = () => {
    setOpenPanel("ai");
  };

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
  }, [setAvailableCanvasWidth]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layout">
        <LeftBar
          openPanel={openPanel}
          onShowSidebar={() => handlePanelToggle("sidebar")}
          onShowStructurePanel={() => handlePanelToggle("structure")}
          onShowMediaPanel={() => handlePanelToggle("media")}
          onShowSettingsPanel={() => handlePanelToggle("settings")}
          aiChatStarted={aiChatStarted}
          onShowAIPanel={handleShowAIPanel}
        />
        <div className="app">
          <Topbar
            onResize={(size) => setContentListWidth(size)}
            scale={scale}
            setScale={setScale}
            isPreviewMode={isPreviewMode}
            onPreviewToggle={() => setIsPreviewMode((prev) => !prev)}
            pageSettings={pageSettings}
            userId={userId}
            projectId={projectId}
          />
          <div className="content-container">
            {openPanel === "sidebar" && (
              <div className="sidebar" id="sidebar">
                <SideBar contentListWidth={contentListWidth} pageSettings={pageSettings} />
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
                  onUpdateSettings={(updatedSettings) => {
                    setPageSettings(updatedSettings);
                    localStorage.setItem("websiteSettings", JSON.stringify(updatedSettings));
                  }}
                  userId={userId}
                />
              </div>
            )}
            <div className="main-content" onClick={handleMainContentClick} ref={mainContentRef}>
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
            {openPanel === "ai" && (
              <div className="right-panel" id="ai-panel">
                <AIAgentPanel initialMessages={initialAIMessages} />
              </div>
            )}
            {showAIInputBar && openPanel !== "ai" && (
              <AIAgentPanel onFirstPrompt={handleFirstPrompt} />
            )}
          </div>
        </div>
        {!(showAIInputBar || openPanel === "ai") && (
          <AIFloatingButton onClick={handleAIFloatingButtonClick} />
        )}
      </div>
    </DndProvider>
  );
};

export default BuilderPageCore;
