import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import './css/SettingsForm.css';

const DeFiModuleSettings = () => {
  const { selectedElement, updateContent, updateStyles } = useContext(EditableContext);
  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    if (selectedElement) {
      try {
        const data = typeof selectedElement.content === 'string'
          ? JSON.parse(selectedElement.content)
          : selectedElement.content;
        setModuleData(data);
      } catch (e) {
        if (import.meta.env.DEV) console.error('[DeFiModuleSettings] Failed to parse module data:', e);
      }
    }
  }, [selectedElement]);

  const updateModuleData = (updatedData) => {
    updateContent(selectedElement.id, JSON.stringify(updatedData));
    if (updatedData.settings?.customColor) {
      updateStyles(selectedElement.id, { backgroundColor: updatedData.settings.customColor });
    }
    setModuleData(updatedData);
  };

  const handleField = (field, value) => {
    updateModuleData({ ...moduleData, [field]: value });
  };

  const handleSettingField = (field, value) => {
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

    switch (moduleData.moduleType) {
      case 'aggregator':
        return (
          <>
            <hr className="settings-divider" />
            <div className="settings-field">
              <label>Pool Aggregator Settings</label>
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
              </select>
            </div>
            <div className="settings-field">
              <label>Supported Tokens</label>
              <select
                className="settings-select"
                multiple
                value={moduleData.settings?.supportedTokens || []}
                onChange={e => handleMultiSelect('supportedTokens', e)}
                size={5}
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="DAI">DAI</option>
                <option value="ETH">ETH</option>
                <option value="WBTC">WBTC</option>
              </select>
            </div>
          </>
        );
      case 'simulation':
        return (
          <>
            <hr className="settings-divider" />
            <div className="settings-field">
              <label>Simulation Settings</label>
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
    <form className="defi-settings-form">
      <div className="settings-field">
        <label>Module Title</label>
        <input
          className="settings-input"
          value={moduleData.title || ''}
          onChange={e => handleField('title', e.target.value)}
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
