// BuilderPageCore.js
import React, { useRef, useEffect, useContext, useState, Suspense } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./BuilderPage.css";
import LeftBar from "./components/LeftBar";
const StructurePanel = React.lazy(() => import("./components/LeftbarPanels/StructurePanel"));
const MediaPanel = React.lazy(() => import("./components/LeftbarPanels/MediaPanel"));
const WebsiteSettingsPanel = React.lazy(() => import("./components/LeftbarPanels/WebsiteSettingsPanel"));
import ContentList from "./components/ContentList";
import { EditableContext } from "./context/EditableContext";
import { useSubscription } from "./context/SubscriptionContext";
import Topbar from "./components/TopBar";
const SideBar = React.lazy(() => import('./components/SideBar'));
const AIAgentPanel = React.lazy(() => import("./components/Rightbar/AIAgentPanel"));
import AIFloatingButton from "./components/AIFloatingButton";
import { useWalletContext } from "./context/WalletContext";
// Project data persisted via Firestore (AutoSaveContext)
import ErrorBoundary from "./components/ErrorBoundary";
import { sendChatMessage, resetChatSession } from "./services/aiBuilderService";
import { TEMPLATES } from "./configs/templates";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
const KeyboardShortcutsHelp = React.lazy(() => import("./components/KeyboardShortcutsHelp"));
const OnboardingOverlay = React.lazy(() => import("./components/OnboardingOverlay"));
const VersionHistory = React.lazy(() => import("./components/VersionHistory"));
import CanvasBreadcrumb from "./components/CanvasBreadcrumb";
import PageTabBar from "./components/PageTabBar";

const BuilderPageCore = ({
  userId,
  projectId,
  setUserId,
  openPanel,
  setOpenPanel,
  contentListWidth,
  setContentListWidth,
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
  onBackToProjects,
  shareUrl,
  dashboardData,
}) => {
  const contentRef = useRef(null);
  const mainContentRef = useRef(null);
  const { setSelectedElement, handleAICommand, elements, selectedElement, recordElementsUpdate, pages, activePageIndex, addPage, switchPage, renamePage, removePage } = useContext(EditableContext);
  const { isPioneer, isLoading: subscriptionLoading } = useSubscription();
  const { isConnected, walletAddress, isDevnet } = useWalletContext();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('dappzy_onboarding_done'); } catch { return false; }
  });
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  useKeyboardShortcuts({ onToggleHelp: () => setShowShortcutsHelp((v) => !v) });
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Conversation 1', messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState(1);

  // Check URL parameters on mount — only use if authenticated
  useEffect(() => {
    if (!isConnected || !walletAddress) return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('userId');
    const urlProjectId = urlParams.get('projectId');

    // Only accept URL userId if it matches the authenticated wallet
    if (urlUserId && urlUserId === walletAddress && !userId) {
      setUserId(urlUserId);
    }
    if (urlProjectId && !activeProjectId) {
      setActiveProjectId(urlProjectId);
    }
  }, [userId, activeProjectId, setUserId, setActiveProjectId, isConnected, walletAddress]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

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

  const handleOpenAIPanel = () => {
    if (!isPioneer) return;
    setOpenPanel("ai");
  };

  // Execute a single AI command — handles both element-level and page-level actions
  const executeAICommand = async (cmd) => {
    switch (cmd.action) {
      case 'updateWebsiteSettings': {
        if (cmd.settings && typeof cmd.settings === 'object') {
          const updated = { ...pageSettings, ...cmd.settings };
          setPageSettings(updated);
          // Settings saved to Firestore via AutoSaveContext
        }
        return;
      }

      case 'loadTemplate': {
        const template = TEMPLATES.find(
          t => t.name.toLowerCase() === (cmd.template || '').toLowerCase()
        );
        if (!template) return;

        const newElements = template.elements;
        if (newElements && newElements.length > 0) {
          recordElementsUpdate(() => newElements);
        }
        if (template.websiteSettings) {
          const updated = { ...pageSettings, ...template.websiteSettings };
          setPageSettings(updated);
          // Settings saved to Firestore via AutoSaveContext
        }
        return;
      }

      case 'createPage': {
        const pageId = addPage(cmd.name || 'New Page', cmd.slug || '/new-page');
        return pageId;
      }

      case 'switchPage': {
        if (cmd.pageIndex !== undefined) {
          switchPage(cmd.pageIndex);
        }
        return;
      }

      case 'renamePage': {
        if (cmd.pageId) {
          renamePage(cmd.pageId, cmd.name, cmd.slug);
        }
        return;
      }

      case 'removePage': {
        if (cmd.pageId) {
          removePage(cmd.pageId);
        }
        return;
      }

      default:
        // Element-level commands go to EditableContext
        return handleAICommand(cmd);
    }
  };

  // Single AI prompt handler — sends to Gemini, executes returned commands
  // onCommandStatus callback reports each command as it executes (for live preview)
  const handleAIPrompt = async (userMessage, onCommandStatus) => {
    setOpenPanel("ai");

    try {
      onCommandStatus?.({ phase: 'thinking' });

      const result = await sendChatMessage(
        userMessage.content,
        elements,
        selectedElement,
        pageSettings,
        pages,
        activePageIndex
      );

      const executedCommands = [];

      // Execute all commands and report each one live
      for (let i = 0; i < result.commands.length; i++) {
        const cmd = result.commands[i];
        onCommandStatus?.({
          phase: 'executing',
          current: i + 1,
          total: result.commands.length,
          command: cmd,
        });

        try {
          const result = await executeAICommand(cmd);
          executedCommands.push({ ...cmd, status: 'done', result });
        } catch (cmdErr) {
          executedCommands.push({ ...cmd, status: 'failed', error: cmdErr?.message || 'Unknown error' });
          if (import.meta.env.DEV) console.error('[AI] Command failed:', cmd, cmdErr);
        }

        // Small delay between commands to let state settle
        if (result.commands.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }

      onCommandStatus?.({ phase: 'done' });

      return {
        role: 'assistant',
        content: result.message,
        commands: executedCommands,
      };
    } catch (err) {
      const errorMsg = err?.message || 'Unknown error';
      if (import.meta.env.DEV) console.error('[AI] Prompt failed:', err);
      onCommandStatus?.({ phase: 'done' });
      return {
        role: 'assistant',
        content: `Sorry, I couldn't process that request. ${errorMsg.includes('quota') || errorMsg.includes('429') ? 'Rate limit reached — try again in a few minutes.' : 'Please try again.'}`,
      };
    }
  };

  const handleCloseAIPanel = () => {
    setOpenPanel("");
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    const selectedConv = conversations.find(c => c.id === id);
    if (selectedConv && selectedConv.messages) {
      setMessages([...selectedConv.messages]);
    }
  };

  const handleSetMessages = (msgs) => {
    if (!msgs) return;

    const newMessages = [...msgs];

    setConversations(prev => {
      const updatedConversations = prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: newMessages }
          : c
      );
      return updatedConversations;
    });

    setMessages(newMessages);
  };

  const handleNewChat = () => {
    resetChatSession();
    const newId = Date.now();
    const newConv = {
      id: newId,
      name: `Conversation ${conversations.length + 1}`,
      messages: []
    };

    setConversations(prev => {
      const updatedPrev = prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [...messages] }
          : c
      );
      return [...updatedPrev, newConv];
    });

    setActiveConversationId(newId);
    setMessages([]);
  };

  // Auto-open sidebar when an element is selected
  useEffect(() => {
    if (selectedElement && openPanel !== 'sidebar') {
      setOpenPanel('sidebar');
    }
  }, [selectedElement?.id]);

  // Effects
  useEffect(() => {
    if (openPanel === "ai") {
      const currentConv = conversations.find(c => c.id === activeConversationId);
      if (currentConv && currentConv.messages) {
        setMessages([...currentConv.messages]);
      }
    }
  }, [openPanel, activeConversationId, conversations]);

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
          onShowMediaPanel={() => handlePanelToggle("media")}
          onShowStructurePanel={() => handlePanelToggle("structure")}
          onShowSettingsPanel={() => handlePanelToggle("settings")}
          onShowAIPanel={handleOpenAIPanel}
        />
        <div className="app">
          <ErrorBoundary name="Topbar">
            <Topbar
              onResize={(size) => setContentListWidth(size)}
              scale={scale}
              setScale={setScale}
              isPreviewMode={isPreviewMode}
              onPreviewToggle={() => setIsPreviewMode((prev) => !prev)}
              pageSettings={pageSettings}
              setPageSettings={setPageSettings}
              userId={userId}
              projectId={projectId}
              onBackToProjects={onBackToProjects}
              onOpenVersionHistory={() => setShowVersionHistory(true)}
              shareUrl={shareUrl}
              dashboardData={dashboardData}
            />
          </ErrorBoundary>
          <PageTabBar />
          {isDevnet && (
            <div className="devnet-banner">
              You're on Solana devnet — set VITE_SOLANA_RPC_URL for mainnet
            </div>
          )}
          <div className="content-container">
            <div className="sidebar" id="sidebar" style={{ display: openPanel === 'sidebar' ? 'flex' : 'none' }}>
              <ErrorBoundary name="Sidebar">
                <Suspense fallback={null}>
                  <SideBar pageSettings={pageSettings} />
                </Suspense>
              </ErrorBoundary>
            </div>
            {openPanel === "structure" && (
              <div id="structure-panel">
                <ErrorBoundary name="Structure Panel">
                  <Suspense fallback={null}>
                    <StructurePanel isPioneer={isPioneer} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
            {openPanel === "media" && (
              <div id="media-panel">
                <ErrorBoundary name="Media Panel">
                  <Suspense fallback={null}>
                    <MediaPanel
                      projectName={pageSettings.siteTitle}
                      isOpen={openPanel}
                      userId={userId}
                      isPioneer={isPioneer}
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
            {openPanel === "settings" && (
              <div id="settings-panel">
                <ErrorBoundary name="Settings Panel">
                  <Suspense fallback={null}>
                    <WebsiteSettingsPanel
                      onUpdateSettings={(updatedSettings) => {
                        setPageSettings(updatedSettings);
                      }}
                      userId={userId}
                      isPioneer={isPioneer}
                      onOpenMediaPanel={handleOpenMediaPanel}
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
            <div
              className="main-content"
              ref={mainContentRef}
              onClick={handleMainContentClick}
              style={{
                '--primary-color': pageSettings.primaryColor || '#5C4EFA',
                fontFamily: pageSettings.bodyFont || 'inherit',
                backgroundColor: pageSettings.bodyBackgroundColor || undefined,
                backgroundImage: pageSettings.bodyBackgroundImage ? `url('${pageSettings.bodyBackgroundImage}')` : undefined,
                backgroundSize: pageSettings.bodyBackgroundImage ? 'cover' : undefined,
                backgroundPosition: pageSettings.bodyBackgroundImage ? 'center' : undefined,
                backgroundAttachment: pageSettings.bodyBackgroundImage ? 'fixed' : undefined,
              }}
            >
              <ErrorBoundary name="Canvas">
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
                  websiteSettings={pageSettings}
                  isPioneer={isPioneer}
                />
              </ErrorBoundary>
              {!isPreviewMode && <CanvasBreadcrumb />}
            </div>
            {openPanel === "ai" && isPioneer && (
              <div className="right-panel" id="ai-panel">
                <ErrorBoundary name="Editor Panel">
                  <Suspense fallback={<div>Loading...</div>}>
                    <AIAgentPanel
                      messages={activeConversation.messages}
                      conversations={conversations}
                      activeConversationId={activeConversationId}
                      onSelectConversation={handleSelectConversation}
                      onNewChat={handleNewChat}
                      setMessages={handleSetMessages}
                      onClosePanel={handleCloseAIPanel}
                      onPrompt={handleAIPrompt}
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
        {openPanel !== "ai" && isPioneer && (
          <AIFloatingButton onClick={handleOpenAIPanel} />
        )}
        {showShortcutsHelp && (
          <Suspense fallback={null}>
            <KeyboardShortcutsHelp onClose={() => setShowShortcutsHelp(false)} />
          </Suspense>
        )}
        {showOnboarding && (
          <Suspense fallback={null}>
            <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />
          </Suspense>
        )}
        {showVersionHistory && (
          <Suspense fallback={null}>
            <VersionHistory
              userId={userId}
              projectId={projectId}
              pageSettings={pageSettings}
              setPageSettings={setPageSettings}
              onClose={() => setShowVersionHistory(false)}
            />
          </Suspense>
        )}
      </div>
    </DndProvider>
  );
};

export default BuilderPageCore;
