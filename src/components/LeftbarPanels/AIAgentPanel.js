import React, { useState, useRef, useEffect, useContext } from 'react';
import './css/AIAgentPanel.css';
import { EditableContext } from '../../context/EditableContext';

const AIAgentPanel = ({ 
  onClosePanel, 
  onNewChat,
  onShowHistory,
  selectedElement,
  onSelectElement,
  messages: propMessages = [],
  setMessages: setMessagesProp,
  onFirstPrompt, 
  onSecondPrompt,
  onSelectedElementEdit,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onThirdPrompt
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const { selectedElement: contextSelectedElement, setSelectedElement } = useContext(EditableContext);

  // Always use the latest selected element
  const currentElement = selectedElement || contextSelectedElement;

  // Ensure messages is always an array and update when propMessages changes
  const [localMessages, setLocalMessages] = useState([]);
  
  // Update local messages when propMessages or activeConversationId changes
  useEffect(() => {
    const currentConv = conversations.find(c => c.id === activeConversationId);
    if (currentConv && currentConv.messages && currentConv.messages.length > 0) {
      setLocalMessages([...currentConv.messages]);
    } else if (Array.isArray(propMessages) && propMessages.length > 0) {
      setLocalMessages([...propMessages]);
    } else {
      setLocalMessages([]);
    }
  }, [activeConversationId]);

  // Add effect to ensure messages are properly synced with parent
  useEffect(() => {
    if (localMessages.length > 0 && setMessagesProp) {
      setMessagesProp([...localMessages]);
    }
  }, [localMessages]);

  // Add effect to log state changes for debugging
  useEffect(() => {
    console.log("Local messages:", localMessages.map(m => ({
      role: m.role,
      contentLength: m.content ? m.content.length : 0
    })));
    console.log("Prop messages:", propMessages.map(m => ({
      role: m.role,
      contentLength: m.content ? m.content.length : 0
    })));
    console.log("Active conversation:", activeConversationId);
  }, [localMessages, propMessages, activeConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Reset input when switching conversations
  useEffect(() => {
    setInputValue('');
    setIsProcessing(false);
  }, [activeConversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    setIsProcessing(true);
    const userMessage = { role: 'user', content: inputValue };
    
    // Add user message to the conversation immediately
    const updatedMessages = [...localMessages, userMessage];
    setLocalMessages(updatedMessages);
    if (setMessagesProp) {
      setMessagesProp(updatedMessages);
    }

    let aiAnswer;
    try {
      if (onSelectedElementEdit && currentElement) {
        aiAnswer = await onSelectedElementEdit(userMessage);
      } else if (onFirstPrompt && localMessages.length === 0) {
        aiAnswer = await onFirstPrompt(userMessage);
      } else if (onSecondPrompt && localMessages.length === 2) {
        aiAnswer = await onSecondPrompt(userMessage);
      } else if (onThirdPrompt && localMessages.length >= 3) {
        aiAnswer = await onThirdPrompt(userMessage);
      } else {
        aiAnswer = { role: 'assistant', content: 'I understand your request. Let me help you with that.' };
      }
    } catch (err) {
      aiAnswer = { role: 'assistant', content: 'There was an error processing your request.' };
    }

    // Add AI response to the conversation
    const finalMessages = [...updatedMessages, aiAnswer];
    setLocalMessages(finalMessages);
    if (setMessagesProp) {
      setMessagesProp(finalMessages);
    }
    setIsProcessing(false);
    setInputValue('');
  };

  const handleNewChat = () => {
    setLocalMessages([]);
    if (setMessagesProp) {
      setMessagesProp([]);
    }
    setInputValue('');
    onNewChat && onNewChat();
    setShowHistory(false);
  };

  const handleShowHistory = () => setShowHistory((v) => !v);

  const handleSelectConv = (id) => {
    onSelectConversation && onSelectConversation(id);
    setShowHistory(false);
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span className="ai-panel-title">Structure creation</span>
        <div className="ai-panel-controls">
          <button onClick={handleNewChat} title="New chat">＋</button>
          <button onClick={handleShowHistory} title="History">🕑</button>
          <button onClick={onClosePanel} title="Close">✕</button>
        </div>
      </div>
      {showHistory && (
        <div className="ai-panel-history">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`ai-panel-history-item${conv.id === activeConversationId ? ' active' : ''}`}
              onClick={() => handleSelectConv(conv.id)}
            >
              {conv.name || `Conversation ${conv.id}`}
            </div>
          ))}
        </div>
      )}
      <div className="ai-panel-messages" style={{ flex: 1, overflowY: 'auto' }}>
        {localMessages.map((message, idx) => (
          message && message.role && message.content ? (
            <div key={idx} className={`ai-message ai-message-${message.role}`}>
            {message.content}
          </div>
          ) : null
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="ai-panel-input" style={{ marginTop: 'auto' }}>
        <form onSubmit={handleSendMessage}>
          <div className="ai-panel-input-row">
            <button type="button" className="ai-panel-input-btn">Add file</button>
            <button type="button" className="ai-panel-input-btn" onClick={onSelectElement}>
              {currentElement
                ? `${currentElement.name || 'Element'}${currentElement.id ? ' (' + currentElement.id + ')' : ''}`
                : 'Select Element'}
            </button>
          </div>
          <div className="ai-panel-input-row">
          <input
            type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            placeholder="Ask anything"
              className="ai-panel-text-input"
              disabled={isProcessing}
          />
            
            <button type="submit" className="ai-panel-send-btn" disabled={isProcessing}>
              ➤
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAgentPanel; 