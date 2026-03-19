import React, { useState, useEffect, useContext, useRef, Suspense } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { useWalletContext } from '../../../context/WalletContext';

const DeFiSectionDragList = React.lazy(() => import('./DeFiSectionDragList'));
import './css/DeFiSectionSettings.css';
import './css/SettingsForm.css';
import { MINTING_MODULE } from '../../../constants/elementTypes';
import { getMintingModuleLabel, getMintingModuleDefaults, MINTING_MODULE_TYPE_LIST } from '../../../constants/mintingModuleTypes';
import { defaultMintingStyles } from '../../../Elements/Sections/Web3Related/defaultMintingStyles';

const MintingSectionSettings = () => {
  const { selectedElement, elements, setElements, addNewElement, updateContent } = useContext(EditableContext);
  const { walletAddress, isConnected: contextConnected, isLoading, walletId } = useWalletContext();

  // Wallet connection state
  const [isSigned, setIsSigned] = useState(false);
  const [requireSignature, setRequireSignature] = useState(true);
  const [simulateConnected, setSimulateConnected] = useState(false);
  const [simulateSigned, setSimulateSigned] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const lastElementId = useRef(null);

  const mergeSettings = (oldSettings, newSettings) => ({
    ...oldSettings,
    ...newSettings,
  });

  useEffect(() => {
    if (selectedElement && selectedElement.id !== lastElementId.current) {
      try {
        const element = elements.find(el => el.id === selectedElement.id);
        if (element) {
          let content = element.content;
          if (typeof content === 'string') {
            try { content = JSON.parse(content); } catch { content = {}; }
          }
          const settings = content?.settings || {};
          setRequireSignature(settings.requireSignature ?? true);
          setSimulateConnected(settings.simulateConnected ?? false);
          setSimulateSigned(settings.simulateSigned ?? false);
          setIsSigned(settings.isSigned ?? false);
          lastElementId.current = selectedElement.id;
        }
      } catch {
        setConnectionError('Failed to load wallet settings');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement, elements]);

  const saveWalletSettings = (newSettings = {}) => {
    if (!selectedElement) return;
    try {
      const element = elements.find(el => el.id === selectedElement.id);
      if (element) {
        let content = element.content;
        if (typeof content === 'string') {
          try { content = JSON.parse(content); } catch { content = {}; }
        }
        const updatedSettings = mergeSettings(content?.settings || {}, {
          requireSignature,
          simulateConnected,
          simulateSigned,
          isSigned,
          ...newSettings,
        });
        updateContent(selectedElement.id, { ...content, settings: updatedSettings });
        setConnectionError(null);
      }
    } catch {
      setConnectionError('Failed to save wallet settings');
    }
  };

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

  const isConnected = simulateConnected || contextConnected;
  const effectiveIsSigned = requireSignature ? (simulateSigned || isSigned) : true;

  const [newModuleType, setNewModuleType] = useState('');

  // --- Module management: read from element tree ---

  const getContentContainer = () => {
    if (!selectedElement) return null;
    const containerId = `${selectedElement.id}-content`;
    return elements.find(el => el.id === containerId);
  };

  const getModuleElements = () => {
    const container = getContentContainer();
    if (!container || !container.children) return [];
    return container.children
      .map(childId => elements.find(el => el.id === childId))
      .filter(el => el && el.type === MINTING_MODULE);
  };

  const modules = getModuleElements();
  const moduleOrder = modules.map(m => m.id);
  const moduleSettings = {};
  modules.forEach(m => {
    const content = typeof m.content === 'string'
      ? (() => { try { return JSON.parse(m.content); } catch { return {}; } })()
      : (m.content || {});
    const settings = content.settings || {};
    moduleSettings[m.id] = {
      moduleType: m.moduleType || 'minting',
      enabled: content.enabled ?? true,
      showStats: settings.showStats ?? true,
      showButton: settings.showButton ?? true,
      customColor: settings.customColor ?? '#2A2A3C',
      stats: content.stats || [],
    };
  });

  const handleModuleToggle = (moduleId, value) => {
    setElements(prev => prev.map(el => {
      if (el.id === moduleId) {
        const content = typeof el.content === 'string'
          ? (() => { try { return JSON.parse(el.content); } catch { return {}; } })()
          : (el.content || {});
        return { ...el, content: { ...content, enabled: value } };
      }
      return el;
    }));
  };

  const handleModuleAdd = (type) => {
    const container = getContentContainer();
    if (!container) return;

    const defaults = getMintingModuleDefaults(type);
    const content = {
      title: defaults.label,
      description: defaults.description,
      stats: defaults.defaultStats,
      settings: { ...defaults.defaultSettings },
      enabled: true,
    };
    // Include default items for gallery/documents modules
    if (defaults.defaultItems) {
      content.items = defaults.defaultItems;
    }
    addNewElement(MINTING_MODULE, 1, null, container.id, {
      moduleType: type,
      content,
      styles: { ...defaultMintingStyles.mintingModule },
    });
  };

  const handleModuleRemove = (moduleId) => {
    const container = getContentContainer();
    if (!container) return;

    setElements(prev => prev
      .filter(el => el.id !== moduleId)
      .map(el => {
        if (el.id === container.id) {
          return { ...el, children: (el.children || []).filter(c => c !== moduleId) };
        }
        return el;
      })
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const container = getContentContainer();
    if (!container) return;

    const currentChildren = [...(container.children || [])];
    const [moved] = currentChildren.splice(result.source.index, 1);
    currentChildren.splice(result.destination.index, 0, moved);

    setElements(prev => prev.map(el =>
      el.id === container.id ? { ...el, children: currentChildren } : el
    ));
  };

  return (
    <div className="settings-panel">
      <h3 className="settings-title">Minting Section Settings</h3>

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

      <Suspense fallback={<div>Loading...</div>}>
        <DeFiSectionDragList
          moduleOrder={moduleOrder}
          moduleSettings={moduleSettings}
          onDragEnd={handleDragEnd}
          onModuleToggle={handleModuleToggle}
          onModuleRemove={handleModuleRemove}
          getModuleLabel={getMintingModuleLabel}
        />
      </Suspense>

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
          {MINTING_MODULE_TYPE_LIST.map(type => (
            <option key={type} value={type}>{getMintingModuleLabel(type)}</option>
          ))}
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

export default MintingSectionSettings;
