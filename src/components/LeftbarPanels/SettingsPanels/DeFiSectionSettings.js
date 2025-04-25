import React, { useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Form } from 'antd';
import './css/DeFiSectionSettings.css';

const DeFiSectionSettings = ({ selectedElement }) => {
  const { elements, updateContent } = React.useContext(EditableContext);
  const [moduleSettings, setModuleSettings] = useState({
    aggregator: { 
      enabled: true, 
      showStats: true, 
      showButton: true, 
      customColor: '#2A2A3C',
      stats: {
        totalPools: 'Loading...',
        totalValueLocked: '$0',
        bestAPY: 'Not Connected'
      }
    },
    simulation: { 
      enabled: true, 
      showStats: true, 
      showButton: true, 
      customColor: '#2A2A3C',
      stats: {
        investmentRange: '$10,000',
        supportedAssets: '20+',
        historicalData: '5 Years'
      }
    },
    bridge: { 
      enabled: true, 
      showStats: true, 
      showButton: true, 
      customColor: '#2A2A3C',
      stats: {
        supportedChains: 'Select Chain',
        transferTime: 'Select Chain',
        securityScore: '0.1%'
      }
    }
  });

  useEffect(() => {
    if (selectedElement) {
      console.log('Selected element:', selectedElement);
      const element = elements.find(el => el.id === selectedElement.id);
      if (element) {
        console.log('Found element:', element);
        // Get modules from children instead of content
        const modules = element.children
          ?.map(childId => elements.find(el => el.id === childId))
          ?.filter(module => module?.type === 'defiModule') || [];
        console.log('Modules:', modules);
        
        const newSettings = { ...moduleSettings };
        modules.forEach(module => {
          if (module.content) {
            try {
              const moduleData = typeof module.content === 'string' ? JSON.parse(module.content) : module.content;
              console.log('Module data:', moduleData);
              const moduleType = moduleData.functionality?.type || module.functionality?.type;
              if (moduleType) {
                // Convert stats to object format for settings panel
                const statsObject = Array.isArray(moduleData.stats) 
                  ? moduleData.stats.reduce((acc, stat) => {
                      acc[stat.label] = stat.value;
                      return acc;
                    }, {})
                  : moduleData.stats || {};

                newSettings[moduleType] = {
                  enabled: moduleData.enabled ?? true,
                  showStats: moduleData.settings?.showStats ?? true,
                  showButton: moduleData.settings?.showButton ?? true,
                  customColor: moduleData.settings?.customColor ?? '#2A2A3C',
                  stats: statsObject
                };
              }
            } catch (e) {
              console.error('Error parsing module content:', e);
              const moduleType = module.functionality?.type;
              if (moduleType) {
                newSettings[moduleType] = {
                  enabled: true,
                  showStats: true,
                  showButton: true,
                  customColor: '#2A2A3C',
                  stats: moduleSettings[moduleType]?.stats || {}
                };
              }
            }
          } else {
            console.log(`Module ${module.id} has no content, using default settings`);
            const moduleType = module.functionality?.type;
            if (moduleType) {
              newSettings[moduleType] = {
                enabled: true,
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C',
                stats: moduleSettings[moduleType]?.stats || {}
              };
            }
          }
        });
        console.log('New settings:', newSettings);
        setModuleSettings(newSettings);
      }
    }
  }, [selectedElement, elements]);

  const handleModuleToggle = (moduleType, value) => {
    console.log('Toggling module:', moduleType, value);
    const element = elements.find(el => el.id === selectedElement.id);
    if (element) {
      let modules = element.content ? JSON.parse(element.content) : [];
      
      // If modules array is empty, initialize it with default modules
      if (modules.length === 0) {
        modules = [
          {
            id: 'aggregator-module',
            type: 'defiModule',
            parentId: element.id,
            content: JSON.stringify({
              id: 'aggregator-module',
              moduleType: 'aggregator',
              title: 'Pool Aggregator',
              enabled: true,
              stats: {
                totalPools: 'Loading...',
                totalValueLocked: '$0',
                bestAPY: 'Not Connected'
              },
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: 'aggregator',
                actions: []
              }
            }),
            styles: {},
            configuration: {
              moduleType: 'aggregator',
              enabled: true
            }
          },
          {
            id: 'simulation-module',
            type: 'defiModule',
            parentId: element.id,
            content: JSON.stringify({
              id: 'simulation-module',
              moduleType: 'simulation',
              title: 'Investment Simulator',
              enabled: true,
              stats: {
                investmentRange: '$10,000',
                supportedAssets: '20+',
                historicalData: '5 Years'
              },
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: 'simulation',
                actions: []
              }
            }),
            styles: {},
            configuration: {
              moduleType: 'simulation',
              enabled: true
            }
          },
          {
            id: 'bridge-module',
            type: 'defiModule',
            parentId: element.id,
            content: JSON.stringify({
              id: 'bridge-module',
              moduleType: 'bridge',
              title: 'Cross-Chain Bridge',
              enabled: true,
              stats: {
                supportedChains: 'Select Chain',
                transferTime: 'Select Chain',
                securityScore: '0.1%'
              },
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: 'bridge',
                actions: []
              }
            }),
            styles: {},
            configuration: {
              moduleType: 'bridge',
              enabled: true
            }
          }
        ];
      }

      const moduleIndex = modules.findIndex(m => {
        const moduleContent = m.content ? JSON.parse(m.content) : {};
        return moduleContent.functionality?.type === moduleType;
      });

      if (moduleIndex !== -1) {
        const module = modules[moduleIndex];
        let moduleContent;
        if (module.content) {
          try {
            moduleContent = typeof module.content === 'string' ? JSON.parse(module.content) : module.content;
          } catch (e) {
            console.error('Error parsing module content:', e);
            moduleContent = {
              id: module.id,
              moduleType: moduleType,
              title: moduleType === 'aggregator' ? 'Pool Aggregator' :
                     moduleType === 'simulation' ? 'Investment Simulator' :
                     moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
              stats: moduleSettings[moduleType]?.stats || {
                totalPools: 'Loading...',
                totalValueLocked: '$0',
                bestAPY: 'Not Connected'
              },
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
        } else {
          moduleContent = {
            id: module.id,
            moduleType: moduleType,
            title: moduleType === 'aggregator' ? 'Pool Aggregator' :
                   moduleType === 'simulation' ? 'Investment Simulator' :
                   moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
            stats: moduleSettings[moduleType]?.stats || {
              totalPools: 'Loading...',
              totalValueLocked: '$0',
              bestAPY: 'Not Connected'
            },
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
        moduleContent.enabled = value;
        modules[moduleIndex].content = JSON.stringify(moduleContent);
        updateContent(selectedElement.id, JSON.stringify(modules));
        setModuleSettings(prev => ({
          ...prev,
          [moduleType]: {
            ...(prev[moduleType] || {}),
            enabled: value
          }
        }));
      }
    }
  };

  const handleStatChange = (moduleType, statKey, value) => {
    console.log('Updating stat:', moduleType, statKey, value);
    const element = elements.find(el => el.id === selectedElement.id);
    if (element) {
      let modules = element.content ? JSON.parse(element.content) : [];
      
      // If modules array is empty, initialize it with default modules
      if (modules.length === 0) {
        modules = [
          {
            id: 'aggregator-module',
            type: 'defiModule',
            parentId: element.id,
            content: JSON.stringify({
              id: 'aggregator-module',
              moduleType: 'aggregator',
              title: 'Pool Aggregator',
              enabled: true,
              stats: [
                { label: 'Total Pools', value: 'Loading...' },
                { label: 'Total Value Locked', value: '$0' },
                { label: 'Best APY', value: 'Not Connected' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: 'aggregator',
                actions: []
              }
            }),
            styles: {},
            configuration: {
              moduleType: 'aggregator',
              enabled: true
            }
          },
          {
            id: 'simulation-module',
            type: 'defiModule',
            parentId: element.id,
            content: JSON.stringify({
              id: 'simulation-module',
              moduleType: 'simulation',
              title: 'Investment Simulator',
              enabled: true,
              stats: [
                { label: 'Investment Range', value: '$10,000' },
                { label: 'Supported Assets', value: '20+' },
                { label: 'Historical Data', value: '5 Years' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: 'simulation',
                actions: []
              }
            }),
            styles: {},
            configuration: {
              moduleType: 'simulation',
              enabled: true
            }
          },
          {
            id: 'bridge-module',
            type: 'defiModule',
            parentId: element.id,
            content: JSON.stringify({
              id: 'bridge-module',
              moduleType: 'bridge',
              title: 'Cross-Chain Bridge',
              enabled: true,
              stats: [
                { label: 'Supported Chains', value: 'Select Chain' },
                { label: 'Transfer Time', value: 'Select Chain' },
                { label: 'Security Score', value: '0.1%' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: 'bridge',
                actions: []
              }
            }),
            styles: {},
            configuration: {
              moduleType: 'bridge',
              enabled: true
            }
          }
        ];
      }

      const moduleIndex = modules.findIndex(m => {
        const moduleContent = m.content ? JSON.parse(m.content) : {};
        return moduleContent.functionality?.type === moduleType;
      });

      if (moduleIndex !== -1) {
        const module = modules[moduleIndex];
        let moduleContent;
        if (module.content) {
          try {
            moduleContent = typeof module.content === 'string' ? JSON.parse(module.content) : module.content;
          } catch (e) {
            console.error('Error parsing module content:', e);
            moduleContent = {
              id: module.id,
              moduleType: moduleType,
              title: moduleType === 'aggregator' ? 'Pool Aggregator' :
                     moduleType === 'simulation' ? 'Investment Simulator' :
                     moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
              stats: [
                { label: 'Total Pools', value: 'Loading...' },
                { label: 'Total Value Locked', value: '$0' },
                { label: 'Best APY', value: 'Not Connected' }
              ],
              settings: {
                showStats: true,
                showButton: true,
                customColor: '#2A2A3C'
              },
              functionality: {
                type: moduleType,
                actions: []
              },
              enabled: true
            };
          }
        } else {
          moduleContent = {
            id: module.id,
            moduleType: moduleType,
            title: moduleType === 'aggregator' ? 'Pool Aggregator' :
                   moduleType === 'simulation' ? 'Investment Simulator' :
                   moduleType === 'bridge' ? 'Cross-Chain Bridge' : 'Module Title',
            stats: [
              { label: 'Total Pools', value: 'Loading...' },
              { label: 'Total Value Locked', value: '$0' },
              { label: 'Best APY', value: 'Not Connected' }
            ],
            settings: {
              showStats: true,
              showButton: true,
              customColor: '#2A2A3C'
            },
            functionality: {
              type: moduleType,
              actions: []
            },
            enabled: true
          };
        }

        // Ensure stats is an array
        if (!Array.isArray(moduleContent.stats)) {
          moduleContent.stats = Object.entries(moduleContent.stats || {}).map(([label, value]) => ({
            label,
            value
          }));
        }

        // Update the specific stat value
        const statIndex = moduleContent.stats.findIndex(stat => stat.label === statKey);
        if (statIndex !== -1) {
          moduleContent.stats[statIndex].value = value;
        } else {
          // If stat doesn't exist, add it
          moduleContent.stats.push({ label: statKey, value });
        }

        // Update the module's content
        modules[moduleIndex].content = JSON.stringify(moduleContent);

        // Update the module's configuration
        modules[moduleIndex].configuration = {
          ...modules[moduleIndex].configuration,
          enabled: moduleContent.enabled
        };

        // Update the element's content
        const updatedElement = {
          ...element,
          content: JSON.stringify(modules)
        };

        // Update the context
        updateContent(selectedElement.id, JSON.stringify(modules));

        // Update local state
        setModuleSettings(prev => {
          const updatedStats = { ...(prev[moduleType]?.stats || {}) };
          updatedStats[statKey] = value;
          
          return {
            ...prev,
            [moduleType]: {
              ...(prev[moduleType] || {}),
              stats: updatedStats
            }
          };
        });

        console.log('Updated module content:', moduleContent);
        console.log('Updated modules:', modules);
      }
    }
  };

  return (
    <div className="settings-panel">
      <h3 className="settings-title">DeFi Section Settings</h3>
      
      {/* Aggregateur Pool Settings */}
      <div className={`settings-group ${!moduleSettings?.aggregator?.enabled ? 'disabled' : ''}`}>
        <div className="settings-row">
          <span className="settings-subtitle">Aggregateur Pool</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={moduleSettings?.aggregator?.enabled ?? false}
              onChange={(e) => handleModuleToggle('aggregator', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {moduleSettings?.aggregator?.enabled && (
          <div className="settings-subgroup">
            <div className="settings-row">
              <span>Total Pools</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.aggregator?.stats?.['Total Pools'] ?? ''}
                onChange={(e) => handleStatChange('aggregator', 'Total Pools', e.target.value)}
                disabled={!moduleSettings?.aggregator?.enabled}
              />
            </div>
            <div className="settings-row">
              <span>Total Value Locked</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.aggregator?.stats?.['Total Value Locked'] ?? ''}
                onChange={(e) => handleStatChange('aggregator', 'Total Value Locked', e.target.value)}
                disabled={!moduleSettings?.aggregator?.enabled}
              />
            </div>
            <div className="settings-row">
              <span>Best APY Available</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.aggregator?.stats?.['Best APY'] ?? ''}
                onChange={(e) => handleStatChange('aggregator', 'Best APY', e.target.value)}
                disabled={!moduleSettings?.aggregator?.enabled}
              />
            </div>
          </div>
        )}
      </div>

      {/* Simulation Invest Settings */}
      <div className={`settings-group ${!moduleSettings?.simulation?.enabled ? 'disabled' : ''}`}>
        <div className="settings-row">
          <span className="settings-subtitle">Simulation Invest</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={moduleSettings?.simulation?.enabled ?? false}
              onChange={(e) => handleModuleToggle('simulation', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {moduleSettings?.simulation?.enabled && (
          <div className="settings-subgroup">
            <div className="settings-row">
              <span>Investment Range</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.simulation?.stats?.['Investment Range'] ?? ''}
                onChange={(e) => handleStatChange('simulation', 'Investment Range', e.target.value)}
                disabled={!moduleSettings?.simulation?.enabled}
              />
            </div>
            <div className="settings-row">
              <span>Supported Assets</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.simulation?.stats?.['Supported Assets'] ?? ''}
                onChange={(e) => handleStatChange('simulation', 'Supported Assets', e.target.value)}
                disabled={!moduleSettings?.simulation?.enabled}
              />
            </div>
            <div className="settings-row">
              <span>Historical Data Range</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.simulation?.stats?.['Historical Data'] ?? ''}
                onChange={(e) => handleStatChange('simulation', 'Historical Data', e.target.value)}
                disabled={!moduleSettings?.simulation?.enabled}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bridge Settings */}
      <div className={`settings-group ${!moduleSettings?.bridge?.enabled ? 'disabled' : ''}`}>
        <div className="settings-row">
          <span className="settings-subtitle">Bridge</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={moduleSettings?.bridge?.enabled ?? false}
              onChange={(e) => handleModuleToggle('bridge', e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        {moduleSettings?.bridge?.enabled && (
          <div className="settings-subgroup">
            <div className="settings-row">
              <span>Supported Chains</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.bridge?.stats?.['Supported Chains'] ?? ''}
                onChange={(e) => handleStatChange('bridge', 'Supported Chains', e.target.value)}
                disabled={!moduleSettings?.bridge?.enabled}
              />
            </div>
            <div className="settings-row">
              <span>Average Transfer Time</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.bridge?.stats?.['Transfer Time'] ?? ''}
                onChange={(e) => handleStatChange('bridge', 'Transfer Time', e.target.value)}
                disabled={!moduleSettings?.bridge?.enabled}
              />
            </div>
            <div className="settings-row">
              <span>Security Score</span>
              <input
                type="text"
                className="settings-input"
                value={moduleSettings?.bridge?.stats?.['Security Score'] ?? ''}
                onChange={(e) => handleStatChange('bridge', 'Security Score', e.target.value)}
                disabled={!moduleSettings?.bridge?.enabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeFiSectionSettings; 