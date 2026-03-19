import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { getMintingModuleLabel, getMintingModuleDefaults } from '../../../constants/mintingModuleTypes';
import './css/SettingsForm.css';

const MintingModuleSettings = () => {
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
        const moduleType = selectedElement.moduleType || data.moduleType || 'minting';
        const defaults = getMintingModuleDefaults(moduleType);
        setModuleData({
          ...data,
          title: data.title || defaults.label,
          description: data.description || defaults.description,
          stats: data.stats || defaults.defaultStats,
          items: data.items || defaults.defaultItems || [],
          settings: { ...defaults.defaultSettings, ...(data.settings || {}) },
          enabled: data.enabled ?? true,
          moduleType,
        });
      } catch (e) {
        if (import.meta.env.DEV) console.error('[MintingModuleSettings] Failed to parse module data:', e);
        const moduleType = selectedElement.moduleType || 'minting';
        const defaults = getMintingModuleDefaults(moduleType);
        setModuleData({
          title: defaults.label,
          description: defaults.description,
          stats: defaults.defaultStats,
          items: defaults.defaultItems || [],
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
      case 'minting':
        return (
          <>
            <hr className="settings-divider" />
            <div className="settings-field">
              <label>Minting Settings</label>
            </div>
            <div className="settings-field">
              <label>Max Quantity per Mint</label>
              <input
                type="number"
                className="settings-input"
                min={1}
                max={100}
                value={moduleData.settings?.maxQuantity || 10}
                onChange={e => handleSettingField('maxQuantity', Number(e.target.value))}
              />
            </div>
            <div className="settings-field">
              <label>Button Label</label>
              <input
                className="settings-input"
                value={moduleData.settings?.buttonLabel || 'Mint'}
                onChange={e => handleSettingField('buttonLabel', e.target.value)}
              />
            </div>
          </>
        );
      case 'gallery':
        return (
          <>
            <hr className="settings-divider" />
            <div className="settings-field">
              <label>Gallery Settings</label>
            </div>
            <div className="settings-field">
              <label>Columns (min width)</label>
              <input
                className="settings-input"
                value={moduleData.settings?.columnMinWidth || '200px'}
                onChange={e => handleSettingField('columnMinWidth', e.target.value)}
              />
            </div>
          </>
        );
      case 'documents':
        return (
          <>
            <hr className="settings-divider" />
            <div className="settings-field">
              <label>Documents Settings</label>
            </div>
            <div className="settings-field">
              <label>Columns (min width)</label>
              <input
                className="settings-input"
                value={moduleData.settings?.columnMinWidth || '150px'}
                onChange={e => handleSettingField('columnMinWidth', e.target.value)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!selectedElement || !moduleData) {
    return <div>Select a minting module to edit its settings</div>;
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
        <textarea
          className="settings-input"
          rows={3}
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

export default MintingModuleSettings;
