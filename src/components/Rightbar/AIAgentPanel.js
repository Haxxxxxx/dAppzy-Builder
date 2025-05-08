import React, { useState, useRef, useEffect, useContext } from 'react';
import './AIAgentPanel.css';
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
  const [compilationStatus, setCompilationStatus] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPanelReady, setIsPanelReady] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const messagesEndRef = useRef(null);
  const { selectedElement: contextSelectedElement, setSelectedElement } = useContext(EditableContext);

  // Always use the latest selected element
  const currentElement = selectedElement || contextSelectedElement;

  // Ensure messages is always an array and update when propMessages changes
  const [localMessages, setLocalMessages] = useState([]);

  // Initialize panel and show first compilation status
  useEffect(() => {
    const initializePanel = async () => {
      setIsPanelReady(false);
      await simulateCompilation('Initializing AI Panel...', [
        'Loading AI components...',
        'Preparing interface...',
        'Ready to assist...'
      ]);
      setIsPanelReady(true);

      // If there's a pending prompt, process it now
      if (pendingPrompt) {
        await processPrompt(pendingPrompt);
        setPendingPrompt(null);
      }
    };

    initializePanel();
  }, []);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, compilationStatus]);

  // Reset input when switching conversations
  useEffect(() => {
    setInputValue('');
    setIsProcessing(false);
    setCompilationStatus('');
  }, [activeConversationId]);

  const simulateCompilation = async (initialMessage, steps) => {
    setCompilationStatus(initialMessage);
    await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms

    for (const step of steps) {
      setCompilationStatus(step);
      await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 800ms to 400ms
    }
    setCompilationStatus('');
  };

  const typeMessage = async (message, setMessages) => {
    setIsTyping(true);
    const words = message.content.split(' ');
    let currentMessage = '';
    
    for (const word of words) {
      currentMessage += word + ' ';
      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...message, content: currentMessage.trim() }
      ]);
      // No delay - instant typing
    }
    
    setIsTyping(false);
  };

  // Process prompt after panel is ready
  const processPrompt = async (userMessage) => {
    if (!isPanelReady) {
      setPendingPrompt(userMessage);
      return;
    }

    setIsProcessing(true);

    // Add user message to the conversation
    const updatedMessages = [...localMessages, userMessage];
    setLocalMessages(updatedMessages);
    if (setMessagesProp) {
      setMessagesProp(updatedMessages);
    }

    // Show compilation status
    await simulateCompilation('Processing request...', [
      'Analyzing request...',
      'Generating structure...',
      'Creating elements...',
      'Applying styles...',
      'Finalizing...'
    ]);

    // Add a small delay after compilation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get AI response
    let aiAnswer;
    try {
      // Determine which prompt handler to use
      let promptHandler;
      if (onSelectedElementEdit && currentElement) {
        promptHandler = onSelectedElementEdit;
      } else if (onFirstPrompt && localMessages.length === 0) {
        promptHandler = onFirstPrompt;
      } else if (onSecondPrompt && localMessages.length === 2) {
        promptHandler = onSecondPrompt;
      } else if (onThirdPrompt && localMessages.length >= 3) {
        promptHandler = onThirdPrompt;
      }

      // Execute the appropriate prompt handler
      if (promptHandler) {
        aiAnswer = await promptHandler(userMessage);
      } else {
        aiAnswer = { role: 'assistant', content: 'I understand your request. Let me help you with that.' };
      }
    } catch (err) {
      aiAnswer = { role: 'assistant', content: 'There was an error processing your request.' };
    }

    // Add AI response with typing effect
    const finalMessages = [...updatedMessages, aiAnswer];
    setLocalMessages(finalMessages);
    if (setMessagesProp) {
      setMessagesProp(finalMessages);
    }
    await typeMessage(aiAnswer, setLocalMessages);
    
    setIsProcessing(false);
    setInputValue('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage = { role: 'user', content: inputValue };
    setInputValue('');
    await processPrompt(userMessage);
  };

  const handleNewChat = () => {
    setLocalMessages([]);
    if (setMessagesProp) {
      setMessagesProp([]);
    }
    setInputValue('');
    setCompilationStatus('');
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
        <div className='ai-panel-title-box'>
          <p className="ai-panel-title">Structure creation</p>
        </div>
        <div className="ai-panel-controls">
          <button onClick={handleNewChat} title="New chat" disabled={!isPanelReady}>
            <span className="material-symbols-outlined">add</span>
          </button>
          <button onClick={handleShowHistory} title="History" disabled={!isPanelReady}>
            <span className="material-symbols-outlined">history</span>
          </button>
          <button onClick={onClosePanel} title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
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
              {message.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          ) : null
        ))}
        {compilationStatus && ( 
          <div className="ai-compilation-status">
            <div className="compilation-spinner"></div>
            <span>{compilationStatus}</span>
          </div>
        )} 
        <div ref={messagesEndRef} />
      </div>
      <div className="ai-panel-right-input" style={{ marginTop: 'auto' }}>
        <form onSubmit={handleSendMessage} className='ai-panel-right-input-form'>
          <div className="ai-panel-right-input-row">
            <button type="button" className="ai-panel-right-input-btn" disabled={!isPanelReady}>
              <span className="material-symbols-outlined">attach_file</span>
              Add file
            </button>
            <button type="button" className="ai-panel-right-input-btn" onClick={onSelectElement} disabled={!isPanelReady}>
              <span className="material-symbols-outlined">ads_click</span>
              {currentElement
                ? `${currentElement.name || 'Element'}${currentElement.id ? ' (' + currentElement.id + ')' : ''}`
                : 'Select Element'}
            </button>
          </div>
          <div className="ai-panel-right-input-prompt-box">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={isPanelReady ? "Ask anything" : "Initializing..."}
              className="ai-panel-right-text-input"
              disabled={isProcessing || isTyping || !isPanelReady}
            />
            <button type="submit" className="ai-panel-right-send-btn" disabled={isProcessing || isTyping || !isPanelReady}>
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAgentPanel; 