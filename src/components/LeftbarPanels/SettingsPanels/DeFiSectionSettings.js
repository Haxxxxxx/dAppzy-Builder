import React, { useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Form, Input, Button, Select, Switch, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './css/DeFiSectionSettings.css';

const DeFiSectionSettings = ({ selectedElement }) => {
  const { elements, updateContent } = React.useContext(EditableContext);
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
  const [form] = Form.useForm();

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
              console.error('Error parsing module content:', e);
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
        id: `defiModule-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'defiModule',
        parentId: element.id,
        content: JSON.stringify({
          id: `defiModule-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
        const moduleContent = module.content ? JSON.parse(module.content) : {};
        return moduleContent.functionality?.type !== type;
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
  };

  return (
    <div className="settings-panel">
      <h3 className="settings-title">DeFi Dashboard Settings</h3>
      
      <Form form={form} layout="vertical">
        <Divider orientation="left">Module Management</Divider>
        
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
                        <Space>
                          <DragOutlined />
                          <span>{type === 'aggregator' ? 'Pool Aggregator' :
                                type === 'simulation' ? 'Investment Simulator' :
                                type === 'bridge' ? 'Cross-Chain Bridge' : type}</span>
                          <Switch
                            checked={moduleSettings[type]?.enabled}
                            onChange={(checked) => handleModuleToggle(type, checked)}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleModuleRemove(type)}
                          />
                        </Space>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Divider orientation="left">Add New Module</Divider>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Select module type"
            options={[
              { value: 'aggregator', label: 'Pool Aggregator' },
              { value: 'simulation', label: 'Investment Simulator' },
              { value: 'bridge', label: 'Cross-Chain Bridge' }
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              const type = form.getFieldValue('newModuleType');
              if (type) handleModuleAdd(type);
            }}
          >
            Add Module
          </Button>
        </Space>
      </Form>
    </div>
  );
};

export default DeFiSectionSettings; 