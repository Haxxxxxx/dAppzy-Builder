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
import SideBar from './components/SideBar';
import AIAgentPanel from "./components/Rightbar/AIAgentPanel";
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
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Conversation 1', messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState(1);

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

  const handleAIFloatingButtonClick = () => {
    if (!aiChatStarted) {
      // If no chat has started yet, show the input bar and prepare for first prompt
      setShowAIInputBar(true);
      setOpenPanel("");
    } else {
      // If chat has already started, just open the AI panel
      setOpenPanel("ai");
      setShowAIInputBar(false);
    }
  };

  const handleFirstPrompt = async (userMessage) => {
    setOpenPanel("ai");

    try {
      setShowAIInputBar(false);
      setAIChatStarted(true);

      // First, show the AI response
      const aiAnswer = {
        role: 'assistant',
        content: 'Creating a complete DeFi dashboard with a web3-styled navbar, comprehensive dashboard section, and footer...'
      };

      // Create new messages array and update the chat immediately
      const newMessages = [userMessage, aiAnswer];
      setConversations(prev => {
        const updatedConversations = prev.map(c =>
          c.id === activeConversationId
            ? { ...c, messages: newMessages }
            : c
        );
        return updatedConversations;
      });
      setMessages(newMessages);

      // Then proceed with element creation
      // Create Navbar
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

      // Wait for the elements to be updated in the context
      await new Promise(resolve => setTimeout(resolve, 100));

      // Store the navbar span ID
      const navbar = elements.find(el => el.id === navbarId);
      if (navbar && navbar.children) {
        const navbarChildren = elements.filter(el => navbar.children.includes(el.id));
        const spanElement = navbarChildren.find(el => el.type === 'span');
        if (spanElement) {
          setLastNavbarSpanId(spanElement.id);
        }
      }

      // Create DeFi dashboard section
      const defiCommand = {
        action: 'add',
        elementType: 'defiSection',
        properties: {
          configuration: 'defiSection',
          styles: {
            backgroundColor: '#2a2a2a',
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
            color: '#1a1a1a',
            borderTop: '1px solid #e5e5e5',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
          },
          children: [
            {
              type: 'image',
              content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
              styles: {
                width: '32px',
                height: '32px',
                objectFit: 'cover',
                borderRadius: '8px',
              }
            },
            {
              type: 'span',
              content: '© 2024 DeFi Project',
              styles: {
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '400',
                display: 'inline-block',
                margin: '0',
                padding: '0',
              }
            },
            {
              type: 'link',
              content: 'Whitepaper',
              styles: {
                color: '#1a1a1a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block',
                margin: '0',
                padding: '0',
                ':hover': {
                  color: '#5C4EFA',
                },
              }
            },
            {
              type: 'link',
              content: 'Audit',
              styles: {
                color: '#1a1a1a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block',
                margin: '0',
                padding: '0',
                ':hover': {
                  color: '#5C4EFA',
                },
              }
            },
            {
              type: 'link',
              content: 'Governance',
              styles: {
                color: '#1a1a1a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block',
                margin: '0',
                padding: '0',
                ':hover': {
                  color: '#5C4EFA',
                },
              }
            },
            {
              type: 'link',
              content: 'Docs',
              styles: {
                color: '#1a1a1a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block',
                margin: '0',
                padding: '0',
                ':hover': {
                  color: '#5C4EFA',
                },
              }
            },
            {
              type: 'link',
              content: 'Connect Wallet',
              styles: {
                color: '#1a1a1a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block',
                margin: '0',
                padding: '0',
                ':hover': {
                  color: '#5C4EFA',
                },
              }
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
        const footerChildren = elements.filter(el => footer.children.includes(el.id));
        const spanElement = footerChildren.find(el => el.type === 'span');
        if (spanElement) {
          setLastFooterSpanId(spanElement.id);
        }
      }

      setLastNavbarId(navbarId);
      setLastDefiId(defiId);
      setLastFooterId(footerId);

    } catch (err) {
      console.error('[handleFirstPrompt] error:', err);
    }
  };

  const handleSecondPrompt = async (userMessage) => {
    // Remove or comment out these console logs
    // console.log('Updating navbar span with ID:', lastNavbarSpanId);
    // console.log('Updating footer span with ID:', lastFooterSpanId);

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
        },
        children: [
          {
            type: 'image',
            content: 'https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/Placeholders%2FBuilder%2FplaceholderImage.png?alt=media&token=974633ab-eda1-4a0e-a911-1eb3f48f1ca7',
            styles: {
              width: '32px',
              height: '32px',
              objectFit: 'cover',
              borderRadius: '8px',
            }
          },
          {
            type: 'span',
            content: '© 2024 DeFi Project',
            styles: {
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '400',
            }
          },
          {
            type: 'link',
            content: 'Whitepaper',
            styles: {
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              ':hover': {
                color: '#5C4EFA',
              },
            }
          },
          {
            type: 'link',
            content: 'Audit',
            styles: {
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              ':hover': {
                color: '#5C4EFA',
              },
            }
          },
          {
            type: 'link',
            content: 'Governance',
            styles: {
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              ':hover': {
                color: '#5C4EFA',
              },
            }
          },
          {
            type: 'link',
            content: 'Docs',
            styles: {
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              ':hover': {
                color: '#5C4EFA',
              },
            }
          },
          {
            type: 'link',
            content: 'Connect Wallet',
            styles: {
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              ':hover': {
                color: '#5C4EFA',
              },
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

    // Create new messages array
    const newMessages = [...messages, userMessage, aiAnswer];

    // Update conversations first
    setConversations(prev => {
      const updatedConversations = prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: newMessages }
          : c
      );
      return updatedConversations;
    });

    // Then update parent's messages state
    setMessages(newMessages);

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

  // Effects
  useEffect(() => {
    if (conversations.length === 0) {
      setConversations([{
        id: 1,
        name: 'Conversation 1',
        messages: []
      }]);
      setActiveConversationId(1);
    }
  }, []);

  useEffect(() => {
    if (openPanel === "ai") {
      const currentConv = conversations.find(c => c.id === activeConversationId);
      if (currentConv && currentConv.messages) {
        setMessages([...currentConv.messages]);
      }
    }
  }, [openPanel, activeConversationId]);

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
          userId={userId} 
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
                websiteSettings={pageSettings}
              />
            </div>
            {showAIInputBar && !openPanel ? (
              <div className="ai-absolute-input-bar-container">
                <form className="ai-absolute-input-bar" onSubmit={async (e) => {
                  e.preventDefault();
                  const input = e.target.querySelector('input');
                  if (input.value.trim()) {
                    await handleFirstPrompt({ role: 'user', content: input.value });
                    input.value = '';
                  }
                }}>
                  <div className="ai-input-bar-content">
                    {/*<div className="ai-input-bar-header">
                      <div className="ai-input-img-label">
                        <div className="ai-input-img-label-content">
                          <span class="material-symbols-outlined">
                            image
                          </span>
                          <p className="ai-input-img-label-text">Image.png</p>
                        </div>
                        <a href="" className="ai-input-img-label-close"><span class="material-symbols-outlined">
                          close
                        </span></a>
                      </div>

                    </div>*/}
                    <div className="ai-input-bar-row">
                      <div className="ai-input-bar-row-left">
                        <span className="material-symbols-outlined ai-input-icon-left">auto_awesome</span>
                        <input
                          type="text"
                          placeholder="Ask anything"
                          className="ai-absolute-input"
                        />
                      </div>
                      <div className="ai-input-bar-row-right">
                        <a href="" className="ai-input-icon-right"><span className="material-symbols-outlined">
                          attach_file
                        </span></a>
                        <button type="submit" className="ai-input-send-btn">
                          <span class="material-symbols-outlined">
                            arrow_forward
                          </span>
                        </button>
                      </div>


                    </div>
                  </div>
                </form>
              </div>
            ) : openPanel === "ai" && (
              <div className="right-panel" id="ai-panel">
                <AIAgentPanel
                  messages={activeConversation.messages}
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                  setMessages={handleSetMessages}
                  lastNavbarId={lastNavbarId}
                  lastDefiId={lastDefiId}
                  onClosePanel={handleCloseAIPanel}
                  onFirstPrompt={handleFirstPrompt}
                  onSecondPrompt={handleSecondPrompt}
                  onSelectedElementEdit={handleSelectedElementEdit}
                  onThirdPrompt={handleThirdPrompt}
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
