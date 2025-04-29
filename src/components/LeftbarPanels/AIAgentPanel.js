import React, { useState, useRef, useEffect, useContext } from 'react';
import './css/AIAgentPanel.css';
import { EditableContext } from '../../context/EditableContext';

const AIAgentPanel = ({ onFirstPrompt, initialMessages, lastNavbarId }) => {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [intermediateInput, setIntermediateInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); // { file, name, dataUrl }
  const fileInputRef = useRef(null);
  const { handleAICommand } = useContext(EditableContext);
  const [lastHeroId, setLastHeroId] = useState(null);
  const [lastCtaId, setLastCtaId] = useState(null);
  const [lastDefiId, setLastDefiId] = useState(null);
  const commandsExecuted = useRef(new Set());

  // Helper: Try to parse and handle AI command, and return the element ID if successful
  const tryHandleAICommand = (responseText) => {
    try {
      const command = JSON.parse(responseText);
      if (command && command.action) {
        const commandKey = `${command.action}-${command.elementType}-${JSON.stringify(command.properties)}`;
        if (!commandsExecuted.current.has(commandKey)) {
          commandsExecuted.current.add(commandKey);
          return handleAICommand(command);
        }
      }
    } catch (e) {}
    return null;
  };

  // Handle sending from the agent chat panel (not the input bar)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setMessages(prev => {
      const userMessage = { role: 'user', content: inputValue };
      const userMessages = prev.filter(m => m.role === 'user');
      if (userMessages.length === 0) {
        // First prompt: create navbar
        const navbarCommand = {
          action: 'add',
          elementType: 'navbar',
          properties: {
            configuration: 'customTemplate',
            styles: {
              backgroundColor: '#232323',
              borderRadius: '12px',
              color: '#fff',
            }
          },
          position: { index: 0 }
        };
        const aiResponse = {
          role: 'assistant',
          content: JSON.stringify(navbarCommand)
        };
        setTimeout(() => {
          const resultId = tryHandleAICommand(aiResponse.content);
          if (resultId) {
            setMessages(msgs => [...msgs, { role: 'assistant', content: 'Navbar created with custom styles!' }]);
          }
        }, 1000);
        return [
          ...prev,
          userMessage,
          {
            role: 'assistant',
            content: `I'm adding a navbar with a dark background (#232323), white text, rounded corners, and a custom template structure. You can further customize its links, logo, and buttons!`
          },
          aiResponse
        ];
      } else if (userMessages.length === 1) {
        // Second prompt: edit navbar content and colors
        const editCommand = {
          action: 'edit',
          targetId: lastNavbarId,
          properties: {
            styles: { borderRadius: '0px', backgroundColor: '#fff' },
            children: [
              null,
              { type: 'span', content: 'Acme Inc.', styles: { color: '#222' } },
              { type: 'span', content: 'Home', styles: { color: '#222' } },
              { type: 'span', content: 'About', styles: { color: '#222' } },
              { type: 'span', content: 'Services', styles: { color: '#222' } },
              { type: 'span', content: 'Contact', styles: { color: '#222' } },
              { type: 'button', content: 'Sign Up'},
              { type: 'button', content: 'Login' }
            ]
          }
        };
        const aiEditResponse = {
          role: 'assistant',
          content: JSON.stringify(editCommand)
        };
        setTimeout(() => {
          const resultId = tryHandleAICommand(aiEditResponse.content);
          if (resultId) {
            setMessages(msgs => [...msgs, { role: 'assistant', content: 'Navbar styles and content updated!' }]);
          }
        }, 1000);
        return [
          ...prev,
          userMessage,
          {
            role: 'assistant',
            content: `I've updated the navbar: set the brand title, logical link and button names, made all text a clean dark color, removed rounded borders, and set a white background.`
          },
          aiEditResponse
        ];
      } else if (userMessages.length === 2) {
        // Third prompt: create hero, cta, and defi section with correct structure
        const heroCommand = {
          action: 'add',
          elementType: 'hero',
          properties: {
            configuration: 'heroOne'
          },
          position: { index: 1 }
        };
        const ctaCommand = {
          action: 'add',
          elementType: 'cta',
          properties: {
            configuration: 'ctaOne'
          },
          position: { index: 2 }
        };
        const defiCommand = {
          action: 'add',
          elementType: 'defiSection',
          properties: {
            configuration: 'defiSection'
          },
          position: { index: 3 }
        };
        
        // Execute commands in useEffect
        const aiHero = { role: 'assistant', content: JSON.stringify(heroCommand) };
        const aiCta = { role: 'assistant', content: JSON.stringify(ctaCommand) };
        const aiDefi = { role: 'assistant', content: JSON.stringify(defiCommand) };
        
        return [
          ...prev,
          userMessage,
          { role: 'assistant', content: 'Adding a hero section, a call-to-action, and a DeFi dashboard, all with default content and structure...' },
          aiHero,
          aiCta,
          aiDefi
        ];
      } else if (userMessages.length === 3) {
        // Fourth prompt: edit all created sections for a coherent landing page
        const editHero = {
          action: 'edit',
          targetId: lastHeroId,
          properties: {
            styles: { backgroundColor: '#f8fafc', color: '#1a202c', padding: '64px 0', textAlign: 'center' },
            children: [
              { type: 'image', content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=600&q=80', styles: { borderRadius: '16px', width: '120px', height: '120px' } },
              { type: 'heading', content: 'Acme: The Next-Gen Productivity Suite', styles: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' } },
              { type: 'paragraph', content: 'All your work, in one place. Collaborate, create, and launch faster than ever.', styles: { fontSize: '1.25rem', color: '#475569' } },
              { type: 'button', content: 'Get Started Free', styles: { backgroundColor: '#334155', color: '#fff', borderRadius: '8px', padding: '16px 32px', fontWeight: 'bold', fontSize: '1.1rem' } }
            ]
          }
        };
        const editCta = {
          action: 'edit',
          targetId: lastCtaId,
          properties: {
            styles: { backgroundColor: '#f1f5f9', color: '#1a202c', borderRadius: '12px', padding: '40px', textAlign: 'center' },
            children: [
              { type: 'title', content: 'Ready to supercharge your workflow?', styles: { fontSize: '2rem', color: '#1a202c' } },
              { type: 'paragraph', content: 'Sign up now and get 30 days free. No credit card required.', styles: { fontSize: '1.1rem', color: '#475569' } },
              { type: 'button', content: 'Start Free Trial', styles: { backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', padding: '14px 28px', fontWeight: 'bold', fontSize: '1rem' } }
            ]
          }
        };
        const editDefi = {
          action: 'edit',
          targetId: lastDefiId,
          properties: {
            styles: { backgroundColor: '#fff', color: '#222', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center' },
            children: [
              { type: 'title', content: 'DeFi Dashboard', styles: { fontSize: '2rem', color: '#1a202c' } },
              { type: 'description', content: 'Monitor your assets, track performance, and manage your DeFi portfolio with ease.', styles: { fontSize: '1.1rem', color: '#475569' } }
            ]
          }
        };
        
        // Execute edit commands in useEffect
        const aiEditHero = { role: 'assistant', content: JSON.stringify(editHero) };
        const aiEditCta = { role: 'assistant', content: JSON.stringify(editCta) };
        const aiEditDefi = { role: 'assistant', content: JSON.stringify(editDefi) };
        
        return [
          ...prev,
          userMessage,
          { role: 'assistant', content: 'Updating all sections for a coherent Acme landing page...' },
          aiEditHero,
          aiEditCta,
          aiEditDefi
        ];
      } else if (userMessages.length === 4) {
        // Fifth prompt: create another hero section with matching content
        const newHeroCommand = {
          action: 'add',
          elementType: 'hero',
          properties: {
            configuration: 'heroOne',
            styles: { backgroundColor: '#f8fafc', color: '#1a202c', padding: '64px 0', textAlign: 'center' },
            children: [
              { type: 'image', content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=600&q=80', styles: { borderRadius: '16px', width: '120px', height: '120px' } },
              { type: 'heading', content: 'Acme Analytics: Data-Driven Decisions', styles: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' } },
              { type: 'paragraph', content: 'Transform your business with powerful analytics and real-time insights.', styles: { fontSize: '1.25rem', color: '#475569' } },
              { type: 'button', content: 'Explore Analytics', styles: { backgroundColor: '#334155', color: '#fff', borderRadius: '8px', padding: '16px 32px', fontWeight: 'bold', fontSize: '1.1rem' } }
            ]
          },
          position: { index: 4 }
        };
        
        const aiNewHero = { role: 'assistant', content: JSON.stringify(newHeroCommand) };
        
        return [
          ...prev,
          userMessage,
          { role: 'assistant', content: 'Adding a new hero section for our analytics features...' },
          aiNewHero
        ];
      } else if (userMessages.length === 5) {
        // Sixth prompt: create another CTA section with matching content
        const newCtaCommand = {
          action: 'add',
          elementType: 'cta',
          properties: {
            configuration: 'ctaOne',
            styles: { backgroundColor: '#f1f5f9', color: '#1a202c', borderRadius: '12px', padding: '40px', textAlign: 'center' },
            children: [
              { type: 'title', content: 'Ready to unlock your data potential?', styles: { fontSize: '2rem', color: '#1a202c' } },
              { type: 'paragraph', content: 'Start your analytics journey today with our comprehensive platform.', styles: { fontSize: '1.1rem', color: '#475569' } },
              { type: 'button', content: 'Start Analytics Trial', styles: { backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', padding: '14px 28px', fontWeight: 'bold', fontSize: '1rem' } }
            ]
          },
          position: { index: 5 }
        };
        
        const aiNewCta = { role: 'assistant', content: JSON.stringify(newCtaCommand) };
        
        return [
          ...prev,
          userMessage,
          { role: 'assistant', content: 'Adding a new CTA section for analytics features...' },
          aiNewCta
        ];
      } else {
        // For subsequent prompts, just add the user message and handle AI as before
        setTimeout(() => {
          const aiResponse = {
            role: 'assistant',
            content: 'This is a text answer from the AI. (No command to execute.)'
          };
          setMessages(msgs => [...msgs, aiResponse]);
        }, 1000);
        return [...prev, userMessage];
      }
    });
    setInputValue('');
  };

  // Process commands in useEffect
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      try {
        const command = JSON.parse(lastMessage.content);
        if (command && command.action) {
          const resultId = tryHandleAICommand(lastMessage.content);
          if (resultId) {
            // Track IDs for add commands
            if (command.action === 'add') {
              if (command.elementType === 'hero') setLastHeroId(resultId);
              if (command.elementType === 'cta') setLastCtaId(resultId);
              if (command.elementType === 'defiSection') setLastDefiId(resultId);
            }
          }
        }
      } catch (e) {}
    }
  }, [messages]);

  // Handle sending from the input bar (first prompt)
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
      // Only call onFirstPrompt, do not generate or execute the AI command here
      if (onFirstPrompt) onFirstPrompt(userMessage);
      setMessages([userMessage]);
      return;
    }
    // (Only for main panel mode, not absolute input bar)
    setMessages(prev => {
      const userMessages = prev.filter(m => m.role === 'user');
      if (userMessages.length === 0) {
        const navbarCommand = {
          action: 'add',
          elementType: 'navbar',
          properties: {
            configuration: 'customTemplate',
            styles: {
              backgroundColor: '#232323',
              borderRadius: '12px',
              color: '#fff',
            }
          },
          position: { index: 0 }
        };
        const aiResponse = {
          role: 'assistant',
          content: JSON.stringify(navbarCommand)
        };
        setTimeout(() => {
          const explanation = tryHandleAICommand(aiResponse.content);
          if (explanation) {
            setMessages(msgs => [...msgs, { role: 'assistant', content: explanation }]);
          }
        }, 1000);
        return [
          userMessage,
          {
            role: 'assistant',
            content: `I'm adding a navbar with a dark background (#232323), white text, rounded corners, and a custom template structure. You can further customize its links, logo, and buttons!`
          },
          aiResponse
        ];
      } else {
        setTimeout(() => {
          const aiResponse = {
            role: 'assistant',
            content: 'This is a text answer from the AI. (No command to execute.)'
          };
          setMessages(msgs => [...msgs, aiResponse]);
        }, 1000);
        return [userMessage];
      }
    });
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

  // --- Render ---
  if (onFirstPrompt) {
    // Only show the input bar (not the full panel)
    return (
      <div className="ai-absolute-input-bar-wrapper">
        <form className="ai-absolute-input-bar" onSubmit={handleIntermediateSubmit}>
          <div className="ai-input-bar-content">
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

  // Full panel mode
  return (
    <div className="ai-agent-panel ai-panel-modern">
      <div className="ai-panel-header">
        <span className="ai-panel-pill">Structure creation</span>
        <div className="ai-panel-header-actions">
          <span className="material-symbols-outlined ai-panel-header-icon">add</span>
          <span className="material-symbols-outlined ai-panel-header-icon">history</span>
          <span className="material-symbols-outlined ai-panel-header-icon">close</span>
        </div>
      </div>
      <div className="ai-agent-messages ai-panel-messages-modern">
        {messages.map((message, index) => {
          // Hide raw JSON AI commands from the chat
          let isAICommand = false;
          if (message.role === 'assistant') {
            try {
              const parsed = JSON.parse(message.content);
              if (parsed && parsed.action) isAICommand = true;
            } catch (e) {}
          }
          if (isAICommand) return null;
          return (
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
          );
        })}
      </div>
      <div className="ai-panel-footer">
        <div className="ai-panel-footer-actions">
          <button className="ai-footer-action-btn">
            <span className="material-symbols-outlined">attach_file</span> Add file
          </button>
          <button className="ai-footer-action-btn">
            <span className="material-symbols-outlined">select_all</span> Select Element
          </button>
        </div>
        <form className="ai-panel-footer-inputbar" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything"
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