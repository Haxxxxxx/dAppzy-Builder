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
import { Web3Configs } from "./configs/Web3/Web3Configs";

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
  const { setSelectedElement, handleAICommand, elements, selectedElement } = useContext(EditableContext);
  const [showAIInputBar, setShowAIInputBar] = useState(false);
  const [initialAIMessages, setInitialAIMessages] = useState(null);
  const [aiChatStarted, setAIChatStarted] = useState(false);
  const [lastNavbarId, setLastNavbarId] = useState(null);
  const [lastDefiId, setLastDefiId] = useState(null);
  const [lastFooterId, setLastFooterId] = useState(null);
  const [lastNavbarSpanId, setLastNavbarSpanId] = useState(null);
  const [lastFooterSpanId, setLastFooterSpanId] = useState(null);
  const [messages, setMessages] = useState([]);

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
    if (!showAIInputBar && openPanel !== "ai") {
      setShowAIInputBar(true);
      setOpenPanel(""); // Close any open panels
    }
  };

  const handleFirstPrompt = async (userMessage) => {
    try {
      console.log('[handleFirstPrompt] started', userMessage);
      // Create Navbar
      console.log('[handleFirstPrompt] before navbarCommand');
      const navbarCommand = {
        action: 'add',
        elementType: 'navbar',
        properties: {
          configuration: "defiNavbar",
          styles: {
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px'
          }
        }
      };
      const navbarId = await handleAICommand(navbarCommand);
      console.log('[handleFirstPrompt] after navbarCommand', navbarId);

      // Wait for the elements to be updated in the context
      await new Promise(resolve => setTimeout(resolve, 100));

      // Store the navbar span ID
      const navbar = elements.find(el => el.id === navbarId);
      if (navbar && navbar.children) {
        // Find all elements that are children of the navbar
        const navbarChildren = elements.filter(el => navbar.children.includes(el.id));
        // Find the span among the children
        const spanElement = navbarChildren.find(el => el.type === 'span');
        if (spanElement) {
          setLastNavbarSpanId(spanElement.id);
          console.log('Found and stored navbar span ID:', spanElement.id);
        }
      }

      // Create DeFi dashboard section
      const defiCommand = {
        action: 'add',
        elementType: 'defiSection',
        properties: {
          configuration: 'defiSection',
          styles: {
            backgroundColor: '#1a1a1a',
            color: '#fff',
            padding: '40px',
          },
          children: [
            { 
              type: 'title', 
              content: 'DeFi Dashboard', 
              styles: { 
                fontSize: '2rem', 
                color: '#fff',
                marginBottom: '16px'
              } 
            },
            { 
              type: 'description', 
              content: 'Monitor your assets and track performance', 
              styles: { 
                color: '#bbb',
                fontSize: '1.1rem',
                marginBottom: '32px'
              } 
            },
            { 
              type: 'module', 
              content: 'Portfolio Overview', 
              styles: { 
                backgroundColor: '#2a2a2a', 
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              },
              children: [
                { type: 'heading', content: 'Total Value', styles: { color: '#fff', fontSize: '1.5rem' } },
                { type: 'value', content: '$0.00', styles: { color: '#4A90E2', fontSize: '2rem', fontWeight: 'bold' } }
              ]
            },
            { 
              type: 'module', 
              content: 'Asset Allocation', 
              styles: { 
                backgroundColor: '#2a2a2a', 
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              },
              children: [
                { type: 'heading', content: 'Asset Distribution', styles: { color: '#fff', fontSize: '1.5rem' } },
                { type: 'chart', content: 'Pie Chart Placeholder', styles: { height: '200px' } }
              ]
            },
            { 
              type: 'module', 
              content: 'Transaction History', 
              styles: { 
                backgroundColor: '#2a2a2a', 
                borderRadius: '8px',
                padding: '20px'
              },
              children: [
                { type: 'heading', content: 'Recent Transactions', styles: { color: '#fff', fontSize: '1.5rem' } },
                { type: 'table', content: 'Transaction Table Placeholder', styles: { width: '100%' } }
              ]
            }
          ]
        },
        position: { index: 1 }
      };

      // Create footer
      const footerCommand = {
        action: 'add',
        elementType: 'footer',
        properties: {
          configuration: 'defiFooter',
          styles: {
            backgroundColor: '#ffffff',
            color: '#000000',
            borderTop: '1px solid #e5e7eb',
            padding: '0',
            padding: '12px',
          },
          children: [
            {
              type: 'image',
              content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
              styles: {
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover'
              }
            },
            {
              type: 'span',
              content: 'DeFi Dashboard',
              styles: {
                color: '#1a1a1a',
                fontSize: '1rem',
                fontWeight: '500'
              }
            },
            // Social logos as images with correct Simple Icons CDN URLs
            {
              type: 'image',
              content: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg',
              styles: { width: '24px', height: '24px', margin: '0 8px', cursor: 'pointer' },
              link: 'https://x.com/yourprofile'
            },
            {
              type: 'image',
              content: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg',
              styles: { width: '24px', height: '24px', margin: '0 8px', cursor: 'pointer' },
              link: 'https://discord.gg/yourinvite'
            },
            {
              type: 'image',
              content: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg',
              styles: { width: '24px', height: '24px', margin: '0 8px', cursor: 'pointer' },
              link: 'https://github.com/yourrepo'
            }
          ]
        },
        position: { index: 2 }
      };

      const defiId = await handleAICommand(defiCommand);
      const footerId = await handleAICommand(footerCommand);

      // Wait for the elements to be updated in the context
      await new Promise(resolve => setTimeout(resolve, 100));

      // Store the footer span ID
      const footer = elements.find(el => el.id === footerId);
      if (footer && footer.children) {
        // Find all elements that are children of the footer
        const footerChildren = elements.filter(el => footer.children.includes(el.id));
        // Find the span among the children
        const spanElement = footerChildren.find(el => el.type === 'span');
        if (spanElement) {
          setLastFooterSpanId(spanElement.id);
          console.log('Found and stored footer span ID:', spanElement.id);
        }
      }

      setLastNavbarId(navbarId);
      setLastDefiId(defiId);
      setLastFooterId(footerId);

      const aiAnswer = {
        role: 'assistant',
        content: 'Creating a complete DeFi dashboard with a web3-styled navbar, comprehensive dashboard section, and footer...'
      };

      setShowAIInputBar(false);
      console.log('[handleFirstPrompt] setShowAIInputBar(false)');
      setMessages([userMessage, aiAnswer]);
      console.log('[handleFirstPrompt] setMessages', [userMessage, aiAnswer]);
      setOpenPanel("ai");
      console.log('[handleFirstPrompt] setOpenPanel("ai")');
      setAIChatStarted(true);
      console.log('[handleFirstPrompt] setAIChatStarted(true)');
    } catch (err) {
      console.error('[handleFirstPrompt] error:', err);
    }
  };

  const handleSecondPrompt = async (userMessage) => {
    console.log('Updating navbar span with ID:', lastNavbarSpanId);
    console.log('Updating footer span with ID:', lastFooterSpanId);

    // Edit Navbar
    await handleAICommand({
      action: 'edit',
      targetId: lastNavbarId,
      properties: {
        styles: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderBottom: '1px solid #333',
          padding: '16px 24px'
        },
        children: [
          {
            type: 'image',
            content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
            styles: { width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }
          },
          {
            type: 'span',
            content: 'DeFi Dashboard',
            styles: { color: '#ffffff', fontSize: '1.1rem', fontWeight: '500' }
          },
          {
            type: 'button',
            content: 'Connect Wallet',
            styles: { 
              backgroundColor: '#5C4EFA',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }
          }
        ]
      }
    });

    // Edit DeFi Section
    await handleAICommand({
      action: 'edit',
      targetId: lastDefiId,
      properties: {
        styles: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          padding: '40px',
        }
      }
    });

    // Edit Footer
    await handleAICommand({
      action: 'edit',
      targetId: lastFooterId,
      properties: {
        styles: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderTop: '1px solid #333',
          padding: '12px',          
        },
        children: [
          {
            type: 'image',
            content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
            styles: { width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }
          },
          {
            type: 'span',
            content: 'DeFi Dashboard',
            styles: { color: '#ffffff', fontSize: '1rem', fontWeight: '500' }
          },
          {
            type: 'link',
            content: 'Privacy Policy',
            styles: { 
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.9rem',
              hover: { color: '#ffffff' }
            }
          },
          {
            type: 'link',
            content: 'Terms of Service',
            styles: { 
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.9rem',
              hover: { color: '#ffffff' }
            }
          },
          {
            type: 'icon',
            content: 'Twitter',
            styles: { 
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '1.2rem',
              hover: { color: '#ffffff' }
            }
          },
          {
            type: 'icon',
            content: 'Discord',
            styles: { 
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '1.2rem',
              hover: { color: '#ffffff' }
            }
          },
          {
            type: 'icon',
            content: 'GitHub',
            styles: { 
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '1.2rem',
              hover: { color: '#ffffff' }
            }
          }
        ]
      }
    });

    const aiAnswer = {
      role: 'assistant',
      content: 'I\'ve updated the theme to dark mode with the following changes:\n\n' +
              '1. Navbar:\n' +
              '   - Changed background to dark (#1a1a1a)\n' +
              '   - Updated text color to white\n' +
              '   - Added dark border\n\n' +
              '2. DeFi Section:\n' +
              '   - Set dark background (#1a1a1a)\n' +
              '   - Updated text color to white\n' +
              '   - Maintained rounded corners and padding\n\n' +
              '3. Footer:\n' +
              '   - Matched dark theme (#1a1a1a)\n' +
              '   - Updated all text and links to white\n' +
              '   - Added dark border\n\n' +
              'All text content is now white for better contrast against the dark background.'
    };

    // Only update the messages array with both the user's message and AI's response
    setMessages(prevMessages => [...prevMessages, userMessage, aiAnswer]);
    // Do not update setInitialAIMessages with the AI answer to avoid duplicate rendering
    // setInitialAIMessages(prevMessages => [...prevMessages, userMessage, aiAnswer]);
    setOpenPanel("ai");
    setAIChatStarted(true);
    return aiAnswer;
  };

  const handleCloseAIPanel = () => {
    setOpenPanel("");
    setShowAIInputBar(false);
  };

  const handleElementSelect = (element) => {
    setSelectedElement(element);
    setOpenPanel("settings");
  };

  const handleShowAIPanel = () => {
    setOpenPanel("ai");
    setShowAIInputBar(false);
  };

  const handleSelectedElementEdit = async (userMessage) => {
    if (!selectedElement) {
      return {
        role: 'assistant',
        content: 'No element is currently selected. Please select an element to edit.'
      };
    }

    // Create edit command for the selected element
    const editCommand = {
      action: 'edit',
      targetId: selectedElement.id,
      properties: {
        styles: {
          ...selectedElement.styles,
          // Add any style changes based on user message
          // This is a placeholder - we'll need to parse the user message
          // to determine what changes to make
        }
      }
    };

    try {
      await handleAICommand(editCommand);
      
      return {
        role: 'assistant',
        content: `I've updated the ${selectedElement.type} element as requested.`
      };
    } catch (error) {
      console.error('Error editing element:', error);
      return {
        role: 'assistant',
        content: 'Sorry, there was an error updating the element. Please try again.'
      };
    }
  };

  const handleThirdPrompt = async (userMessage) => {
    if (!selectedElement || selectedElement.type !== 'defiSection') {
      return {
        role: 'assistant',
        content: 'Please select a DeFi Dashboard section to edit its display.'
      };
    }

    try {
      // Parse the user's message to determine what changes to make
      const message = userMessage.content.toLowerCase();
      let editCommand = {
        action: 'edit',
        targetId: selectedElement.id,
        properties: {
          styles: { ...selectedElement.styles }
        }
      };

      // Handle different customization requests
      if (message.includes('dark') || message.includes('black')) {
        editCommand.properties.styles = {
          ...editCommand.properties.styles,
          backgroundColor: '#1a1a1a',
          color: '#ffffff'
        };
      } else if (message.includes('light') || message.includes('white')) {
        editCommand.properties.styles = {
          ...editCommand.properties.styles,
          backgroundColor: '#ffffff',
          color: '#1a1a1a'
        };
      } else if (message.includes('blue') || message.includes('ocean')) {
        editCommand.properties.styles = {
          ...editCommand.properties.styles,
          backgroundColor: '#1a2a3a',
          color: '#ffffff'
        };
      } else if (message.includes('purple') || message.includes('violet')) {
        editCommand.properties.styles = {
          ...editCommand.properties.styles,
          backgroundColor: '#2a1a3a',
          color: '#ffffff'
        };
      }

      // Handle padding adjustments
      if (message.includes('more space') || message.includes('larger padding')) {
        editCommand.properties.styles.padding = '60px';
      } else if (message.includes('less space') || message.includes('smaller padding')) {
        editCommand.properties.styles.padding = '20px';
      }

      // Handle border radius
      if (message.includes('rounded') || message.includes('soft corners')) {
        editCommand.properties.styles.borderRadius = '16px';
      } else if (message.includes('sharp') || message.includes('square')) {
        editCommand.properties.styles.borderRadius = '0';
      }

      // Handle margin adjustments
      if (message.includes('more margin') || message.includes('more space around')) {
        editCommand.properties.styles.margin = '40px 0';
      } else if (message.includes('less margin') || message.includes('less space around')) {
        editCommand.properties.styles.margin = '10px 0';
      }

      // Ensure we have all required style properties
      editCommand.properties.styles = {
        ...editCommand.properties.styles,
        backgroundColor: editCommand.properties.styles.backgroundColor || '#1D1C2B',
        color: editCommand.properties.styles.color || '#ffffff',
        padding: editCommand.properties.styles.padding || '2rem',
        borderRadius: editCommand.properties.styles.borderRadius || '16px',
        margin: editCommand.properties.styles.margin || '0'
      };

      await handleAICommand(editCommand);

      return {
        role: 'assistant',
        content: `I've updated the DeFi Dashboard section with your requested changes. The section now has a ${editCommand.properties.styles.backgroundColor === '#1a1a1a' ? 'dark' : 
                 editCommand.properties.styles.backgroundColor === '#ffffff' ? 'light' :
                 editCommand.properties.styles.backgroundColor === '#1a2a3a' ? 'blue' :
                 editCommand.properties.styles.backgroundColor === '#2a1a3a' ? 'purple' : 'custom'} theme, ${editCommand.properties.styles.padding === '60px' ? 'more' : 
                 editCommand.properties.styles.padding === '20px' ? 'less' : 'standard'} padding, and ${editCommand.properties.styles.borderRadius === '16px' ? 'rounded' : 
                 editCommand.properties.styles.borderRadius === '0' ? 'sharp' : 'standard'} corners.`
      };
    } catch (error) {
      console.error('Error updating DeFi section:', error);
      return {
        role: 'assistant',
        content: 'There was an error updating the DeFi Dashboard section. Please try again with a different request.'
      };
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
    window.addEventListener("resize", updateCanvasWidth);
    return () => window.removeEventListener("resize", updateCanvasWidth);
  }, [setAvailableCanvasWidth]);

  useEffect(() => {
    console.log("State changed:", { openPanel, showAIInputBar, messages });
  }, [openPanel, showAIInputBar, messages]);

  console.log("openPanel:", openPanel, "showAIInputBar:", showAIInputBar, "messages:", messages);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layout">
        <LeftBar
          openPanel={openPanel}
          onShowSidebar={() => handlePanelToggle("sidebar")}
          onShowStructurePanel={() => handlePanelToggle("structure")}
          onShowMediaPanel={() => handlePanelToggle("media")}
          onShowSettingsPanel={() => handlePanelToggle("settings")}
          onShowAIPanel={() => handleAIFloatingButtonClick()}
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
            <div className="main-content" ref={mainContentRef} onClick={handleMainContentClick}>
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
            {showAIInputBar && !openPanel ? (
              <div className="ai-absolute-input-bar-container">
                <form className="ai-absolute-input-bar" onSubmit={async (e) => {
                  console.log("AI input bar form submitted");
                  e.preventDefault();
                  const input = e.target.querySelector('input');
                  if (input.value.trim()) {
                    await handleFirstPrompt({ role: 'user', content: input.value });
                    input.value = '';
                  }
                }}>
                  <div className="ai-input-bar-content">
                    <div className="ai-input-bar-row">
                      <span className="material-symbols-outlined ai-input-icon-left">auto_awesome</span>
                      <input
                        type="text"
                        placeholder="Ask anything"
                        className="ai-absolute-input"
                      />
                      <button type="submit" className="ai-input-send-btn">
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : openPanel === "ai" && (
              <div className="right-panel" id="ai-panel">
                <AIAgentPanel 
                  initialMessages={messages}
                  lastNavbarId={lastNavbarId}
                  lastDefiId={lastDefiId}
                  onClosePanel={handleCloseAIPanel}
                  onFirstPrompt={handleFirstPrompt}
                  onSecondPrompt={handleSecondPrompt}
                  onSelectedElementEdit={handleSelectedElementEdit}
                  onThirdPrompt={handleThirdPrompt}
                  setMessages={setMessages}
                />
              </div>
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
