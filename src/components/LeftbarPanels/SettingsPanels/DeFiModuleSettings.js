import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { getModuleLabel, getModuleDefaults } from '../../../constants/defiModuleTypes';
import { getTopTokens } from '../../../services/coinGeckoService';
import './css/SettingsForm.css';

const DEFAULT_TOKENS = ['bitcoin', 'ethereum', 'solana', 'usd-coin', 'tether'];

const DeFiModuleSettings = () => {
  const { selectedElement, updateContent, updateStyles } = useContext(EditableContext);
  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    if (selectedElement) {
      try {
        // Normalize: handle both string (legacy) and object content
        const data = typeof selectedElement.content === 'string'
          ? JSON.parse(selectedElement.content)
          : (selectedElement.content || {});
        // Merge in defaults for missing fields
        const moduleType = selectedElement.moduleType || data.moduleType || 'aggregator';
        const defaults = getModuleDefaults(moduleType);
        setModuleData({
          ...data,
          title: data.title || defaults.label,
          description: data.description || defaults.description,
          stats: data.stats || defaults.defaultStats,
          settings: { ...defaults.defaultSettings, ...(data.settings || {}) },
          enabled: data.enabled ?? true,
          moduleType,
        });
      } catch (e) {
        if (import.meta.env.DEV) console.error('[DeFiModuleSettings] Failed to parse module data:', e);
        // Fall back to defaults
        const moduleType = selectedElement.moduleType || 'aggregator';
        const defaults = getModuleDefaults(moduleType);
        setModuleData({
          title: defaults.label,
          description: defaults.description,
          stats: defaults.defaultStats,
          settings: { ...defaults.defaultSettings },
          enabled: true,
          moduleType,
        });
      }
    }
  }, [selectedElement]);

  const updateModuleData = (updatedData) => {
    // Pass object directly — never JSON.stringify
    updateContent(selectedElement.id, updatedData);
    if (updatedData.settings?.customColor) {
      updateStyles(selectedElement.id, { backgroundColor: updatedData.settings.customColor });
    }
    setModuleData(updatedData);
  };

  const handleField = (field, value) => {
    if (!moduleData) return;
    updateModuleData({ ...moduleData, [field]: value });
  };

  const handleSettingField = (field, value) => {
    if (!moduleData) return;
    updateModuleData({
      ...moduleData,
      settings: { ...moduleData.settings, [field]: value },
    });
  };

  const addStat = () => {
    updateModuleData({
      ...moduleData,
      stats: [...(moduleData.stats || []), { label: '', value: '' }],
    });
  };

  const removeStat = (index) => {
    const stats = [...(moduleData.stats || [])];
    stats.splice(index, 1);
    updateModuleData({ ...moduleData, stats });
  };

  const updateStat = (index, field, value) => {
    const stats = [...(moduleData.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    updateModuleData({ ...moduleData, stats });
  };

  const handleMultiSelect = (settingField, e) => {
    const selected = [...e.target.selectedOptions].map(o => o.value);
    handleSettingField(settingField, selected);
  };

  const moduleType = selectedElement?.moduleType || moduleData?.moduleType || 'aggregator';

  // Token selector for aggregator modules
  const [availableTokens, setAvailableTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);

  useEffect(() => {
    if (moduleType === 'aggregator') {
      setTokensLoading(true);
      getTopTokens(20)
        .then(tokens => {
          setAvailableTokens(tokens.length > 0 ? tokens : DEFAULT_TOKENS.map(id => ({ id, symbol: id.toUpperCase(), name: id })));
        })
        .catch(() => {
          setAvailableTokens(DEFAULT_TOKENS.map(id => ({ id, symbol: id.toUpperCase(), name: id })));
        })
        .finally(() => setTokensLoading(false));
    }
  }, [moduleType]);

  const handleTokenToggle = (tokenId) => {
    if (!moduleData) return;
    const current = moduleData.settings?.selectedTokens || [];
    const updated = current.includes(tokenId)
      ? current.filter(t => t !== tokenId)
      : [...current, tokenId];
    handleSettingField('selectedTokens', updated);
  };

  const renderStatsSettings = () => (
    <>
      <hr className="settings-divider" />
      <div className="settings-field">
        <label>Stats Display</label>
        {(moduleData.stats || []).map((stat, index) => (
          <div key={index} className="settings-row" style={{ marginBottom: '6px' }}>
            <input
              className="settings-input"
              placeholder="Stat Label"
              value={stat.label || ''}
              onChange={e => updateStat(index, 'label', e.target.value)}
            />
            <input
              className="settings-input"
              placeholder="Stat Value"
              value={stat.value || ''}
              onChange={e => updateStat(index, 'value', e.target.value)}
            />
            <button className="settings-btn-icon" onClick={() => removeStat(index)} title="Remove stat">×</button>
          </div>
        ))}
        <button className="settings-btn settings-btn-icon add" onClick={addStat}>+ Add Stat</button>
      </div>
    </>
  );

  const renderModuleSpecificSettings = () => {
    if (!moduleData) return null;

    switch (moduleType) {
      case 'aggregator':
        return (
          <>
            <hr className="settings-divider" />
            <div className="settings-field">
              <label>{getModuleLabel('aggregator')} Settings</label>
            </div>
            <div className="settings-field">
              <label>Supported Chains</label>
              <select
                className="settings-select"
                multiple
                value={moduleData.settings?.supportedChains || []}
                onChange={e => handleMultiSelect('supportedChains', e)}
                size={5}
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Polygon">Polygon</option>
                <option value="BSC">BSC</option>
                <option value="Avalanche">Avalanche</option>
                <option value="Arbitrum">Arbitrum</option>
                <option value="Solana">Solana</option>
              </select>
            </div>
            <div className="settings-field">
              <label>Track Tokens (Live Prices)</label>
              {tokensLoading ? (
                <div style={{ color: '#888', fontSize: '0.85rem', padding: '8px 0' }}>Loading tokens...</div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px' }}>
                  {availableTokens.map(token => {
                    const selected = (moduleData.settings?.selectedTokens || []).includes(token.id);
                    return (
                      <div
                        key={token.id}
                        onClick={() => handleTokenToggle(token.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
                          cursor: 'pointer', borderRadius: '4px',
                          backgroundColor: selected ? 'rgba(92, 78, 250, 0.2)' : 'transparent',
                          border: selected ? '1px solid rgba(92, 78, 250, 0.5)' : '1px solid transparent',
                        }}
                      >
                        {token.image && <img src={token.image} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />}
                        <span style={{ fontWeight: 500, color: '#fff', fontSize: '0.85rem' }}>{token.symbol}</span>
                        {token.price != null && (
                          <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: 'auto' }}>
                            ${typeof token.price === 'number' ? token.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : token.price}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        );
      case 'simulation':
        return (
          <>
            <hr className="settings-divider" />
            <div className="settings-field">
              <label>{getModuleLabel('simulation')} Settings</label>
            </div>
            <div className="settings-field">
              <label>Simulation Balance</label>
              <input
                type="number"
                className="settings-input"
                value={moduleData.settings?.simulationBalance || 10000}
                onChange={e => handleSettingField('simulationBalance', Number(e.target.value))}
              />
            </div>
            <div className="settings-field">
              <label>Time Range</label>
              <select
                className="settings-select"
                value={moduleData.settings?.timeRange || '5Y'}
                onChange={e => handleSettingField('timeRange', e.target.value)}
              >
                <option value="1D">1 Day</option>
                <option value="1W">1 Week</option>
                <option value="1M">1 Month</option>
                <option value="1Y">1 Year</option>
                <option value="5Y">5 Years</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!selectedElement || !moduleData) {
    return <div>Select a DeFi module to edit its settings</div>;
  }

  return (
    <form className="defi-settings-form" onSubmit={e => e.preventDefault()}>
      <div className="settings-field">
        <label>Module Title</label>
        <input
          className="settings-input"
          value={moduleData.title || ''}
          onChange={e => handleField('title', e.target.value)}
        />
      </div>

      <div className="settings-field">
        <label>Description</label>
        <input
          className="settings-input"
          value={moduleData.description || ''}
          onChange={e => handleField('description', e.target.value)}
        />
      </div>

      <div className="settings-field">
        <label>Show Stats</label>
        <input
          type="checkbox"
          className="settings-switch"
          checked={moduleData.settings?.showStats ?? true}
          onChange={e => handleSettingField('showStats', e.target.checked)}
        />
      </div>

      <div className="settings-field">
        <label>Show Button</label>
        <input
          type="checkbox"
          className="settings-switch"
          checked={moduleData.settings?.showButton ?? true}
          onChange={e => handleSettingField('showButton', e.target.checked)}
        />
      </div>

      <div className="settings-field">
        <label>Module Color</label>
        <input
          type="color"
          className="settings-color"
          value={moduleData.settings?.customColor || '#2A2A3C'}
          onChange={e => handleSettingField('customColor', e.target.value)}
        />
      </div>

      {renderStatsSettings()}
      {renderModuleSpecificSettings()}
    </form>
  );
};

export default DeFiModuleSettings;
