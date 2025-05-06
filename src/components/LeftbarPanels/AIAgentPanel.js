import React, { useState, useRef, useEffect, useContext } from 'react';
import './css/AIAgentPanel.css';
import { EditableContext } from '../../context/EditableContext';

const AIAgentPanel = ({ 
  initialMessages, 
  lastNavbarId, 
  lastDefiId, 
  onClosePanel, 
  onFirstPrompt, 
  onSecondPrompt,
  onThirdPrompt,
  onSelectedElementEdit,
  setMessages: setMessagesProp
}) => {
  const [localMessages, setLocalMessages] = useState(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [intermediateInput, setIntermediateInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { selectedElement, setSelectedElement } = useContext(EditableContext);
  const [lastHeroId, setLastHeroId] = useState(null);
  const [lastCtaId, setLastCtaId] = useState(null);
  const commandsExecuted = useRef(new Set());
  const isFirstRender = useRef(true);

  const implementedFeatures = [
    'Change background color',
    'Update text content',
    'Modify font styles',
    'Adjust padding and margins',
    'Change border styles',
    'Update element positioning',
    'Modify grid layout',
    'Update flex properties',
    'Change element visibility',
    'Update element dimensions'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (initialMessages && isFirstRender.current) {
      setLocalMessages(initialMessages);
      isFirstRender.current = false;
    }
    scrollToBottom();
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const handleSendMessage = async (messageContent) => {
    if (!messageContent?.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageContent
    };

    // Update both local and parent state
    const newMessages = [...localMessages, userMessage];
    setLocalMessages(newMessages);
    if (setMessagesProp) {
      setMessagesProp(newMessages);
    }

    try {
      let aiResponse;
      let promptType = '';

      // Determine which prompt handler to use
      if (selectedElement && selectedElement.type === 'defiSection' && onThirdPrompt) {
        promptType = 'third';
        console.log('Calling onThirdPrompt...');
        aiResponse = await onThirdPrompt(userMessage);
      } else if (selectedElement) {
        promptType = 'elementEdit';
        console.log('Calling onSelectedElementEdit...');
        aiResponse = await onSelectedElementEdit(userMessage);
      } else if (localMessages.length === 0) {
        promptType = 'first';
        console.log('Calling onFirstPrompt...');
        aiResponse = await onFirstPrompt(userMessage);
      } else {
        promptType = 'second';
        console.log('Calling onSecondPrompt...');
        aiResponse = await onSecondPrompt(userMessage);
      }

      console.log('AI Response received:', aiResponse);

      // Handle different response scenarios based on prompt type
      if (!aiResponse) {
        switch (promptType) {
          case 'first':
            aiResponse = {
              role: 'assistant',
              content: "I've created a basic DeFi dashboard layout with a navbar, main section, and footer. You can now customize it further by selecting elements and making changes."
            };
            break;
          case 'second':
            aiResponse = {
              role: 'assistant',
              content: "I've processed your request. You can continue customizing the dashboard by selecting elements and making changes."
            };
            break;
          case 'third':
            aiResponse = {
              role: 'assistant',
              content: "I've updated the DeFi section according to your request. You can continue customizing other elements."
            };
            break;
          case 'elementEdit':
            aiResponse = {
              role: 'assistant',
              content: `I've updated the ${selectedElement.type} element according to your request. You can continue customizing other elements.`
            };
            break;
          default:
            aiResponse = {
              role: 'assistant',
              content: "I'm processing your request. Please wait a moment..."
            };
        }
      }

      // Ensure aiResponse is in the correct format
      const formattedResponse = typeof aiResponse === 'string' 
        ? { role: 'assistant', content: aiResponse }
        : aiResponse;
      
      console.log('Formatted response:', formattedResponse);
      
      // Update both local and parent state with the response
      const updatedMessages = [...newMessages, formattedResponse];
      setLocalMessages(updatedMessages);
      if (setMessagesProp) {
        setMessagesProp(updatedMessages);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      };
      const errorMessages = [...newMessages, errorMessage];
      setLocalMessages(errorMessages);
      if (setMessagesProp) {
        setMessagesProp(errorMessages);
      }
    }
  };

  const handleIntermediateSubmit = (e) => {
    e.preventDefault();
    if (!intermediateInput.trim() && !uploadedImage) return;
    
    const userMessage = {
      role: 'user',
      content: intermediateInput,
      image: uploadedImage ? uploadedImage.dataUrl : undefined,
      imageName: uploadedImage ? uploadedImage.name : undefined
    };
    
    setIntermediateInput('');
    setUploadedImage(null);
    
    if (onFirstPrompt) {
      onFirstPrompt(userMessage);
      setLocalMessages([userMessage]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage({
          file,
          name: file.name,
          dataUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  // Handle element selection
  const handleElementSelect = () => {
    if (selectedElement) {
      // Close AI panel and open settings panel
      onClosePanel?.();
      // The settings panel will be opened by the parent component
    }
  };

  // Handle AI panel reopening with selected element
  const handleAIPanelReopen = () => {
    if (selectedElement) {
      setInputValue(`Selected element: ${selectedElement.type}`);
    }
  };

  // Only show input bar if we're in the initial state and not in the AI panel
  if (!initialMessages && !localMessages.length && !onSecondPrompt) {
    console.log("AIAgentPanel: rendering fallback input bar");
    return (
      <div className="ai-absolute-input-bar-wrapper">
        <form className="ai-absolute-input-bar" onSubmit={handleIntermediateSubmit}>
          <div className="ai-input-bar-content">
            {uploadedImage && (
              <div className="ai-image-chip">
                <span className="material-symbols-outlined">image</span>
                <span className="ai-image-chip-name">{uploadedImage.name}</span>
                <span className="ai-image-chip-remove material-symbols-outlined" onClick={() => setUploadedImage(null)}>close</span>
              </div>
            )}
            <div className="ai-input-bar-row">
              <span className="material-symbols-outlined ai-input-icon-left">auto_awesome</span>
              <input
                type="text"
                value={intermediateInput}
                onChange={(e) => setIntermediateInput(e.target.value)}
                placeholder="Ask anything"
                className="ai-absolute-input"
              />
              <div className="ai-input-actions">
                <span 
                  className="material-symbols-outlined ai-input-action" 
                  title="Show Features"
                  onClick={() => setShowFeatures(!showFeatures)}
                >
                  info
                </span>
                <span className="material-symbols-outlined ai-input-action" title="Expand">open_in_full</span>
                <span className="material-symbols-outlined ai-input-action" title="Upload" onClick={() => fileInputRef.current?.click()}>image</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <span className="material-symbols-outlined ai-input-action" title="Voice">mic</span>
                <button type="submit" className="ai-input-send-btn" title="Send">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
            {showFeatures && (
              <div className="features-list">
                <h4>Implemented Features</h4>
                <ul>
                  {implementedFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Full panel mode
  return (
    <div className="ai-agent-panel ai-panel-modern">
      <div className="ai-panel-header">
        <span className="ai-panel-pill">AI Assistant</span>
        <div className="ai-panel-header-actions">
          <span className="material-symbols-outlined ai-panel-header-icon" onClick={() => setSelectedElement(null)}>select_all</span>
          <span className="material-symbols-outlined ai-panel-header-icon" onClick={onClosePanel}>close</span>
        </div>
      </div>
      <div className="ai-agent-messages ai-panel-messages-modern">
        {localMessages.map((message, index) => (
          <div key={index} className={`ai-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="ai-panel-footer">
        <form className="ai-panel-footer-inputbar" onSubmit={(e) => {
          e.preventDefault();
          const input = e.target.querySelector('input');
          if (input.value.trim()) {
            handleSendMessage(input.value);
            input.value = '';
          }
        }}>
          <input
            type="text"
            placeholder="Ask anything"
            className="ai-panel-input"
          />
          <button type="submit" className="ai-panel-footer-sendbtn">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAgentPanel; 