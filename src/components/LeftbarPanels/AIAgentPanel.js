import React, { useState, useRef, useEffect } from 'react';
import './css/AIAgentPanel.css';

const AIAgentPanel = ({ onFirstPrompt, initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [intermediateInput, setIntermediateInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); // { file, name, dataUrl }
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const fileInputRef = useRef(null);

  // If initialMessages changes (panel opened), update state
  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  // Handle sending from the agent chat panel (not the input bar)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant', 
        content: 'This is a placeholder response. AI integration will be implemented here.' 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Handle sending from the input bar (first prompt)
  const handleIntermediateSubmit = (e) => {
    e.preventDefault();
    if (!intermediateInput.trim() && !uploadedImage) return;
    // Compose user message
    const userMessage = {
      role: 'user',
      content: intermediateInput,
      image: uploadedImage ? uploadedImage.dataUrl : undefined,
      imageName: uploadedImage ? uploadedImage.name : undefined
    };
    setMessages([userMessage]);
    setIntermediateInput('');
    setUploadedImage(null);
    setShowAgentMenu(true);
    if (onFirstPrompt) onFirstPrompt(userMessage);
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: 'This is a placeholder response. AI integration will be implemented here.'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Handle file upload for the input bar
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

  // Remove uploaded image
  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  // --- Render ---
  // 1. If in input bar mode (onFirstPrompt provided), show only the input bar
  if (onFirstPrompt) {
    return (
      <div className="ai-absolute-input-bar-wrapper">
        <form className="ai-absolute-input-bar" onSubmit={handleIntermediateSubmit}>
          <div className="ai-input-bar-content">
            {/* Image chip if image uploaded */}
            {uploadedImage && (
              <div className="ai-image-chip">
                <span className="material-symbols-outlined">image</span>
                <span className="ai-image-chip-name">{uploadedImage.name}</span>
                <span className="ai-image-chip-remove material-symbols-outlined" onClick={handleRemoveImage}>close</span>
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
          </div>
        </form>
      </div>
    );
  }

  // 2. If agent menu is shown, show the chat panel (right panel style)
  return (
    <div className="ai-agent-panel">
      <div className="ai-agent-header">
        <h3>AI Assistant</h3>
      </div>
      <div className="ai-agent-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
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
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>
      <form className="ai-agent-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask the AI assistant..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default AIAgentPanel; 