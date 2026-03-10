import React, { useState, useEffect, useContext, useRef } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useWalletContext } from '../../../context/WalletContext';
import './css/DeFiSectionSettings.css';
import './css/SettingsForm.css';

const DeFiSectionSettings = () => {
  const { selectedElement, elements, updateContent } = useContext(EditableContext);
  const { walletAddress, isConnected: contextConnected, isLoading, walletId } = useWalletContext();

  // Wallet connection state
  const [isSigned, setIsSigned] = useState(false);
  const [requireSignature, setRequireSignature] = useState(true);
  const [simulateConnected, setSimulateConnected] = useState(false);
  const [simulateSigned, setSimulateSigned] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Track last loaded element id to avoid resetting state on every render
  const lastElementId = useRef(null);

  // Helper to deeply merge settings
  const mergeSettings = (oldSettings, newSettings) => ({
    ...oldSettings,
    ...newSettings
  });

  // Only set local state from the element when the element actually changes
  useEffect(() => {
    if (selectedElement && selectedElement.id !== lastElementId.current) {
      try {
        const element = elements.find(el => el.id === selectedElement.id);
        if (element) {
          let content = element.content;
          if (typeof content === 'string') {
            try {
              content = JSON.parse(content);
            } catch (e) {
              content = {};
            }
          }
          const settings = content.settings || {};
          setRequireSignature(settings.requireSignature ?? true);
          setSimulateConnected(settings.simulateConnected ?? false);
          setSimulateSigned(settings.simulateSigned ?? false);
          setIsSigned(settings.isSigned ?? false);
          lastElementId.current = selectedElement.id;
        }
      } catch (error) {
        setConnectionError('Failed to load wallet settings');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement, elements]);

  // Save wallet settings with deep merge into content.settings
  const saveWalletSettings = (newSettings = {}) => {
    if (!selectedElement) return;
    try {
      const element = elements.find(el => el.id === selectedElement.id);
      if (element) {
        let content = element.content;
        if (typeof content === 'string') {
          try {
            content = JSON.parse(content);
          } catch (e) {
            content = {};
          }
        }
        const updatedSettings = mergeSettings(content.settings || {}, {
          requireSignature,
          simulateConnected,
          simulateSigned,
          isSigned,
          ...newSettings
        });
        const updatedContent = {
          ...content,
          settings: updatedSettings
        };
        updateContent(selectedElement.id, JSON.stringify(updatedContent));
        setConnectionError(null);
      }
    } catch (error) {
      setConnectionError('Failed to save wallet settings');
    }
  };

  // Handlers for each control, update both local state and element settings
  const handleRequireSignatureChange = (checked) => {
    setRequireSignature(checked);
    saveWalletSettings({ requireSignature: checked });
  };

  const handleSimulateConnection = (checked) => {
    setSimulateConnected(checked);
    if (!checked) {
      setSimulateSigned(false);
      saveWalletSettings({ simulateConnected: checked, simulateSigned: false });
    } else {
      saveWalletSettings({ simulateConnected: checked });
    }
  };

  const handleSimulateSignature = (checked) => {
    if (!simulateConnected) {
      setConnectionError('Must be connected to simulate signature');
      return;
    }
    setSimulateSigned(checked);
    saveWalletSettings({ simulateSigned: checked });
  };

  // Use simulation in builder, otherwise use context
  const isConnected = simulateConnected || contextConnected;
  const effectiveIsSigned = requireSignature ? (simulateSigned || isSigned) : true;

  const [moduleSettings, setModuleSettings] = useState({
    aggregator: {
      enabled: true,
      showStats: true,
      showButton: true,
      customColor: '#2A2A3C',
      stats: []
    },
    simulation: {
      enabled: true,
      showStats: true,
      showButton: true,
      customColor: '#2A2A3C',
      stats: []
    },
    bridge: {
      enabled: true,
      showStats: true,
      showButton: true,
      customColor: '#2A2A3C',
      stats: []
    }
  });

  const [moduleOrder, setModuleOrder] = useState(['aggregator', 'simulation', 'bridge']);
  const [newModuleType, setNewModuleType] = useState('');

  useEffect(() => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement.id);
      if (element) {
        const modules = element.children
          ?.map(childId => elements.find(el => el.id === childId))
          ?.filter(module => module?.type === 'defiModule') || [];

        const newSettings = { ...moduleSettings };
        const newOrder = [];

        modules.forEach(module => {
          if (module.content) {
            try {
              const moduleData = typeof module.content === 'string' ? JSON.parse(module.content) : module.content;
              const moduleType = moduleData.functionality?.type || module.functionality?.type;
              if (moduleType) {
                newOrder.push(moduleType);
                newSettings[moduleType] = {
                  enabled: moduleData.enabled ?? true,
                  showStats: moduleData.settings?.showStats ?? true,
                  showButton: moduleData.settings?.showButton ?? true,
                  customColor: moduleData.settings?.customColor ?? '#2A2A3C',
                  stats: moduleData.stats || []
                };
              }
            } catch (e) {
              if (import.meta.env.DEV) console.error('[DeFiSectionSettings] Failed to parse module content:', e);
            }
          }
        });

        setModuleSettings(newSettings);
        setModuleOrder(newOrder);
      }
    }
  }, [selectedElement, elements]);

  const handleModuleToggle = (moduleType, value) => {
    const element = elements.find(el => el.id === selectedElement.id);
    if (element) {
      const modules = element.children
        ?.map(childId => elements.find(el => el.id === childId))
        ?.filter(module => module?.type === 'defiModule') || [];

      const moduleIndex = modules.findIndex(m => {
        try {
          const moduleContent = m.content ? JSON.parse(m.content) : {};
          return moduleContent.functionality?.type === moduleType;
        } catch (e) {
          return false;
        }
      });

      if (moduleIndex !== -1) {
        const module = modules[moduleIndex];
        let moduleContent;
        if (module.content) {
          try {
            moduleContent = typeof module.content === 'string' ? JSON.parse(module.content) : module.content;
          } catch (e) {
            moduleContent = {
              id: module.id,
              moduleType: moduleType,
              title: moduleType === 'aggregator' ? 'Pool Aggregator' :
                     moduleType === 'simulation' ? 'Investment Simulator' :
                     moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
              stats: [],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: moduleType,
                actions: []
              },
              enabled: value
            };
          }
        }
        moduleContent.enabled = value;
        modules[moduleIndex].content = JSON.stringify(moduleContent);
        updateContent(selectedElement.id, JSON.stringify(modules));
        setModuleSettings(prev => ({
          ...prev,
          [moduleType]: {
            ...prev[moduleType],
            enabled: value
          }
        }));
      }
    }
  };

  const handleModuleAdd = (type) => {
    const element = elements.find(el => el.id === selectedElement.id);
    if (element) {
      const newModule = {
        id: `defiModule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'defiModule',
        parentId: element.id,
        content: JSON.stringify({
          id: `defiModule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          moduleType: type,
          title: type === 'aggregator' ? 'Pool Aggregator' :
                 type === 'simulation' ? 'Investment Simulator' :
                 type === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
          enabled: true,
          stats: [],
          settings: {
            showStats: true,
            showButton: true,
            customColor: '#2A2A3C'
          },
          functionality: {
            type: type,
            actions: []
          }
        }),
        styles: {},
        configuration: {
          moduleType: type,
          enabled: true
        }
      };

      const modules = element.children
        ?.map(childId => elements.find(el => el.id === childId))
        ?.filter(module => module?.type === 'defiModule') || [];

      modules.push(newModule);
      updateContent(selectedElement.id, JSON.stringify(modules));
      setModuleOrder(prev => [...prev, type]);
    }
  };

  const handleModuleRemove = (type) => {
    const element = elements.find(el => el.id === selectedElement.id);
    if (element) {
      const modules = element.children
        ?.map(childId => elements.find(el => el.id === childId))
        ?.filter(module => module?.type === 'defiModule') || [];

      const updatedModules = modules.filter(module => {
        try {
          const moduleContent = module.content ? JSON.parse(module.content) : {};
          return moduleContent.functionality?.type !== type;
        } catch (e) {
          return true;
        }
      });

      updateContent(selectedElement.id, JSON.stringify(updatedModules));
      setModuleOrder(prev => prev.filter(t => t !== type));
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(moduleOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setModuleOrder(items);

    // Persist the new order to element content
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement.id);
      if (element) {
        const modules = element.children
          ?.map(childId => elements.find(el => el.id === childId))
          ?.filter(module => module?.type === 'defiModule') || [];

        // Build a lookup from moduleType → module
        const moduleByType = {};
        modules.forEach(module => {
          try {
            const data = typeof module.content === 'string' ? JSON.parse(module.content) : module.content;
            const moduleType = data?.functionality?.type || data?.moduleType;
            if (moduleType) moduleByType[moduleType] = module;
          } catch (e) {
            // skip unparseable modules
          }
        });

        // Reorder according to items
        const reorderedModules = items
          .map(type => moduleByType[type])
          .filter(Boolean);

        updateContent(selectedElement.id, JSON.stringify(reorderedModules));
      }
    }
  };

  return (
    <div className="settings-panel">
      <h3 className="settings-title">DeFi Dashboard Settings</h3>

      {connectionError && (
        <div className="settings-alert settings-alert-error" style={{ marginBottom: '1rem' }}>
          <strong>Connection Error:</strong> {connectionError}
        </div>
      )}

      <hr className="settings-divider" />
      <div className="settings-field"><label>Wallet Connection</label></div>

      <div className="settings-field">
        <div className="settings-row">
          <span>Require Signature to Unlock</span>
          <input
            type="checkbox"
            className="settings-switch"
            checked={requireSignature}
            onChange={e => handleRequireSignatureChange(e.target.checked)}
          />
        </div>
      </div>

      <div className="settings-field">
        <div className="settings-row">
          <span>Simulate Connected</span>
          <input
            type="checkbox"
            className="settings-switch"
            checked={simulateConnected}
            disabled={isLoading}
            onChange={e => handleSimulateConnection(e.target.checked)}
          />
        </div>
      </div>

      {simulateConnected && (
        <div className="settings-field">
          <div className="settings-row">
            <span>Simulate Signed</span>
            <input
              type="checkbox"
              className="settings-switch"
              checked={simulateSigned}
              disabled={isLoading}
              onChange={e => handleSimulateSignature(e.target.checked)}
            />
          </div>
        </div>
      )}

      <div className="settings-field">
        <span>Current Status: </span>
        <span style={{ color: isConnected ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {isConnected && (
          <span style={{ marginLeft: '1rem' }}>
            {effectiveIsSigned ? '(Signed)' : '(Not Signed)'}
          </span>
        )}
      </div>

      <hr className="settings-divider" />
      <div className="settings-field"><label>Module Management</label></div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="modules">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {moduleOrder.map((type, index) => (
                <Draggable key={type} draggableId={type} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="module-item"
                    >
                      <div className="settings-row">
                        <span style={{ cursor: 'grab', marginRight: '4px' }}>⠿</span>
                        <span>{type === 'aggregator' ? 'Pool Aggregator' :
                              type === 'simulation' ? 'Investment Simulator' :
                              type === 'bridge' ? 'Cross-Chain Bridge' : type}</span>
                        <input
                          type="checkbox"
                          className="settings-switch"
                          checked={moduleSettings[type]?.enabled}
                          onChange={e => handleModuleToggle(type, e.target.checked)}
                        />
                        <button
                          className="settings-btn-icon"
                          onClick={() => handleModuleRemove(type)}
                          title="Remove module"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <hr className="settings-divider" />
      <div className="settings-field"><label>Add New Module</label></div>
      <div className="settings-row">
        <select
          className="settings-select"
          value={newModuleType}
          onChange={e => setNewModuleType(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">Select module type</option>
          <option value="aggregator">Pool Aggregator</option>
          <option value="simulation">Investment Simulator</option>
          <option value="bridge">Cross-Chain Bridge</option>
        </select>
        <button
          className="settings-btn"
          onClick={() => {
            if (newModuleType) {
              handleModuleAdd(newModuleType);
              setNewModuleType('');
            }
          }}
        >
          + Add Module
        </button>
      </div>
    </div>
  );
};

export default DeFiSectionSettings;
