import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AIAgentPanel.css';

// Human-readable labels for AI command actions
const ACTION_LABELS = {
  add: { icon: 'add_circle', label: 'Adding' },
  addChild: { icon: 'subdirectory_arrow_right', label: 'Adding child' },
  edit: { icon: 'edit', label: 'Editing' },
  updateContent: { icon: 'text_fields', label: 'Updating content' },
  updateStyles: { icon: 'palette', label: 'Styling' },
  updateStateStyles: { icon: 'readiness_score', label: 'Setting states' },
  updateSettings: { icon: 'settings', label: 'Configuring' },
  updateWebsiteSettings: { icon: 'language', label: 'Updating site settings' },
  loadTemplate: { icon: 'dashboard', label: 'Loading template' },
  delete: { icon: 'delete', label: 'Removing' },
  move: { icon: 'swap_vert', label: 'Moving' },
  select: { icon: 'center_focus_strong', label: 'Selecting' },
  undo: { icon: 'undo', label: 'Undoing' },
  redo: { icon: 'redo', label: 'Redoing' },
  duplicate: { icon: 'content_copy', label: 'Duplicating' },
  batchUpdateStyles: { icon: 'format_paint', label: 'Batch styling' },
  find: { icon: 'search', label: 'Finding elements' },
};

function describeCommand(cmd) {
  if (!cmd) return '';
  const action = ACTION_LABELS[cmd.action] || { icon: 'build', label: cmd.action, verb: cmd.action };
  const type = cmd.elementType || cmd.properties?.configuration || '';
  const target = cmd.targetId ? ` #${cmd.targetId.slice(0, 12)}` : '';
  const template = cmd.template || '';
  const breakpoint = cmd.breakpoint ? ` (${cmd.breakpoint})` : '';
  const state = cmd.state ? ` ${cmd.state}` : '';

  if (cmd.action === 'loadTemplate') return `${action.icon}|${action.label} "${template}"`;
  if (cmd.action === 'updateWebsiteSettings') {
    const keys = cmd.settings ? Object.keys(cmd.settings).join(', ') : '';
    return `${action.icon}|${action.label}: ${keys}`;
  }
  if (cmd.action === 'updateStateStyles') return `${action.icon}|${action.label}${state} on${target}`;
  if (cmd.action === 'updateStyles') return `${action.icon}|${action.label}${target}${breakpoint}`;
  if (cmd.action === 'add') return `${action.icon}|${action.label} ${type}`;
  if (cmd.action === 'addChild') return `${action.icon}|${action.label} ${type} to${target}`;
  if (cmd.action === 'delete') return `${action.icon}|${action.label}${target}`;
  if (cmd.action === 'move') return `${action.icon}|${action.label}${target}`;
  if (cmd.action === 'select') return `${action.icon}|${action.label}${target}`;
  if (cmd.action === 'undo') return `${action.icon}|${action.label} last change`;
  if (cmd.action === 'redo') return `${action.icon}|${action.label} last change`;
  if (cmd.action === 'duplicate') {
    const count = cmd.count || 1;
    return `${action.icon}|${action.label}${target} x${count}`;
  }
  if (cmd.action === 'batchUpdateStyles') {
    const count = cmd.targetIds?.length || 0;
    return `${action.icon}|${action.label} ${count} elements${breakpoint}`;
  }
  if (cmd.action === 'find') {
    const what = cmd.elementType || cmd.contentContains || 'elements';
    return `${action.icon}|${action.label}: ${what}`;
  }
  return `${action.icon}|${action.label} ${type}${target}`;
}

function CommandPreview({ command, status }) {
  const desc = describeCommand(command);
  const [icon, label] = desc.split('|');
  const isDone = status === 'done';
  const isFailed = status === 'failed';

  return (
    <div className={`ai-cmd-preview ${isDone ? 'done' : ''} ${isFailed ? 'failed' : ''}`}>
      <span className="material-symbols-outlined ai-cmd-icon">
        {isFailed ? 'error' : isDone ? 'check_circle' : icon}
      </span>
      <span className="ai-cmd-label">{label}</span>
      {!isDone && !isFailed && <div className="ai-cmd-spinner" />}
    </div>
  );
}

function describeFindResult(cmd) {
  if (cmd.action !== 'find' || !cmd.result) return null;
  const results = cmd.result;
  if (!Array.isArray(results) || results.length === 0) return 'No elements found';
  const ids = results.map(r => r.id.slice(0, 12));
  const preview = ids.length <= 5 ? ids.join(', ') : `${ids.slice(0, 5).join(', ')} +${ids.length - 5} more`;
  return `Found ${results.length} element${results.length !== 1 ? 's' : ''}: ${preview}`;
}

function CommandsSummary({ commands }) {
  if (!commands || commands.length === 0) return null;

  return (
    <div className="ai-commands-summary">
      {commands.map((cmd, i) => {
        const desc = describeCommand(cmd);
        const [icon, label] = desc.split('|');
        const findResult = describeFindResult(cmd);
        return (
          <div key={i} className={`ai-cmd-summary-item ${cmd.status === 'failed' ? 'failed' : ''}`}>
            <span className="material-symbols-outlined ai-cmd-summary-icon">
              {cmd.status === 'failed' ? 'error' : 'check_circle'}
            </span>
            <span className="ai-cmd-summary-label">{label}</span>
            {findResult && (
              <span className="ai-cmd-find-result">{findResult}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const AIAgentPanel = ({
  onClosePanel,
  onNewChat,
  onPrompt,
  messages: propMessages = [],
  setMessages: setMessagesProp,
  conversations = [],
  activeConversationId,
  onSelectConversation,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null); // { phase, current, total, command }
  const messagesEndRef = useRef(null);

  const [localMessages, setLocalMessages] = useState([]);

  // Guard ref to prevent circular updates between local/prop message sync
  const isExternalUpdateRef = useRef(false);

  // Update local messages when propMessages or activeConversationId changes
  useEffect(() => {
    isExternalUpdateRef.current = true;
    const currentConv = conversations.find(c => c.id === activeConversationId);
    if (currentConv?.messages?.length > 0) {
      setLocalMessages([...currentConv.messages]);
    } else if (Array.isArray(propMessages) && propMessages.length > 0) {
      setLocalMessages([...propMessages]);
    } else {
      setLocalMessages([]);
    }
  }, [activeConversationId, conversations, propMessages]);

  // Sync local messages to parent
  useEffect(() => {
    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false;
      return;
    }
    if (localMessages.length > 0 && setMessagesProp) {
      setMessagesProp([...localMessages]);
    }
  }, [localMessages, setMessagesProp]);

  // Scroll to bottom when messages or status change (only if there are messages)
  useEffect(() => {
    if (localMessages.length > 0 || liveStatus) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [localMessages, liveStatus]);

  // Reset input when switching conversations
  useEffect(() => {
    setInputValue('');
    setIsProcessing(false);
    setLiveStatus(null);
  }, [activeConversationId]);

  const handleCommandStatus = useCallback((status) => {
    setLiveStatus(status.phase === 'done' ? null : status);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing || !onPrompt) return;

    const userMessage = { role: 'user', content: inputValue };
    setInputValue('');
    setIsProcessing(true);

    // Add user message immediately
    const withUser = [...localMessages, userMessage];
    setLocalMessages(withUser);
    if (setMessagesProp) setMessagesProp(withUser);

    // Call AI with live status callback
    let aiAnswer;
    try {
      aiAnswer = await onPrompt(userMessage, handleCommandStatus);
    } catch (err) {
      aiAnswer = { role: 'assistant', content: 'There was an error processing your request.' };
    }

    setLiveStatus(null);

    // Add AI response
    const finalMessages = [...withUser, aiAnswer];
    setLocalMessages(finalMessages);
    if (setMessagesProp) setMessagesProp(finalMessages);

    setIsProcessing(false);
  };

  const handleNewChat = () => {
    setLocalMessages([]);
    if (setMessagesProp) setMessagesProp([]);
    setInputValue('');
    setLiveStatus(null);
    onNewChat?.();
    setShowHistory(false);
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title-box">
          <p className="ai-panel-title">AI Assistant</p>
        </div>
        <div className="ai-panel-controls">
          <button onClick={handleNewChat} title="New chat">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button onClick={() => setShowHistory(v => !v)} title="History">
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
              onClick={() => { onSelectConversation?.(conv.id); setShowHistory(false); }}
            >
              {conv.name || `Conversation ${conv.id}`}
            </div>
          ))}
        </div>
      )}

      <div className="ai-panel-messages" style={{ flex: 1, overflowY: 'auto' }}>
        {localMessages.map((message, idx) => (
          message?.role && message?.content ? (
            <div key={idx} className={`ai-message ai-message-${message.role}`}>
              {message.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
              {message.role === 'assistant' && message.commands?.length > 0 && (
                <CommandsSummary commands={message.commands} />
              )}
            </div>
          ) : null
        ))}

        {/* Live command execution preview */}
        {liveStatus && (
          <div className="ai-live-status">
            {liveStatus.phase === 'thinking' && (
              <div className="ai-thinking">
                <div className="ai-thinking-dots">
                  <span /><span /><span />
                </div>
                <p className="ai-thinking-text">Thinking...</p>
              </div>
            )}
            {liveStatus.phase === 'executing' && liveStatus.command && (
              <CommandPreview
                command={liveStatus.command}
                status="active"
              />
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-panel-right-input" style={{ marginTop: 'auto' }}>
        <form onSubmit={handleSendMessage} className="ai-panel-right-input-form">
          <div className="ai-panel-right-input-prompt-box">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={isProcessing ? "Working on it..." : "Describe what you want to build or change..."}
              className="ai-panel-right-text-input"
              disabled={isProcessing}
            />
            <button type="submit" className="ai-panel-right-send-btn" disabled={isProcessing}>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAgentPanel;
