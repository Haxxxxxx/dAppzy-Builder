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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue
    };

    // Update both local and parent state
    const newMessages = [...localMessages, userMessage];
    setLocalMessages(newMessages);
    if (setMessagesProp) {
      setMessagesProp(newMessages);
    }
    setInputValue('');

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
        <span className="ai-panel-pill">Structure creation</span>
        <div className="ai-panel-header-actions">
          <span className="material-symbols-outlined ai-panel-header-icon" onClick={() => setSelectedElement(null)}>select_all</span>
          <span className="material-symbols-outlined ai-panel-header-icon" onClick={onClosePanel}>close</span>
        </div>
      </div>
      <div className="ai-panel-wip-banner">
        <span className="material-symbols-outlined">construction</span>
        <span>Work in Progress</span>
      </div>
      <div 
        className="ai-agent-messages ai-panel-messages-modern"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: 'calc(100% - 120px)', // Adjust based on header and input height
        }}
      >
        {localMessages.map((message, index) => {
          return (
            <div 
              key={index} 
              className={`message ${message.role}`}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.image && (
                <div className="ai-image-message">
                  <img 
                    src={message.image} 
                    alt={message.imageName || 'Uploaded content'} 
                    style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', marginBottom: '8px' }} 
                  />
                  <div className="ai-image-message-name">{message.imageName}</div>
                </div>
              )}
              <div 
                className="message-content"
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Selected element chip(s) just above the input bar */}
      {selectedElement && (
        <div className="ai-element-chip-row">
          {/* Image chip, if present */}
          {(selectedElement.image || (selectedElement.styles && selectedElement.styles.backgroundImage)) && (
            <div className="ai-element-chip">
              <span className="material-symbols-outlined ai-element-chip-icon">image</span>
              <span className="ai-element-chip-label">
                {selectedElement.image ? 'Image.png' : 'Image'}
              </span>
              <span className="material-symbols-outlined ai-element-chip-remove" onClick={() => setSelectedElement(null)}>close</span>
            </div>
          )}
          {/* Name/component chip */}
          <div className="ai-element-chip">
            <span className="material-symbols-outlined ai-element-chip-icon">widgets</span>
            <span className="ai-element-chip-label">
              {selectedElement.content || selectedElement.type || 'Component name'}
            </span>
            <span className="material-symbols-outlined ai-element-chip-remove" onClick={() => setSelectedElement(null)}>close</span>
          </div>
          {/* Info button */}
          <div className="ai-element-info-button" onClick={() => setShowFeatures(!showFeatures)}>
            <span className="material-symbols-outlined">info</span>
          </div>
        </div>
      )}
      {showFeatures && selectedElement && (
        <div className="element-features-list">
          <h4>Available Features for {selectedElement.type}</h4>
          <ul>
            {implementedFeatures.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="ai-panel-footer">
        <div className="ai-panel-footer-actions">
          <button className="ai-footer-action-btn">
            <span className="material-symbols-outlined">attach_file</span> Add file
          </button>
          <button className="ai-footer-action-btn" onClick={handleElementSelect}>
            <span className="material-symbols-outlined">select_all</span> Select Element
          </button>
        </div>
        <form className="ai-panel-footer-inputbar" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              selectedElement && selectedElement.type === 'defiSection'
                ? 'Edit DeFi Dashboard section...'
                : selectedElement
                  ? `Edit ${selectedElement.type}...`
                  : 'Ask anything'
            }
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