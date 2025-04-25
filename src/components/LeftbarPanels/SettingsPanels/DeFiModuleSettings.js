import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Form, Input, Switch, ColorPicker, Select, InputNumber, Space, Divider, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const DeFiModuleSettings = ({ selectedElement }) => {
  const { updateContent } = useContext(EditableContext);
  const [form] = Form.useForm();
  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    if (selectedElement) {
      console.log('Selected element changed:', selectedElement);
      try {
        const data = typeof selectedElement.content === 'string' 
          ? JSON.parse(selectedElement.content) 
          : selectedElement.content;
        console.log('Parsed module data:', data);
        setModuleData(data);
        
        // Set initial form values
        const initialValues = {
          title: data.title,
          showStats: data.settings?.showStats ?? true,
          showButton: data.settings?.showButton ?? true,
          customColor: data.settings?.customColor ?? '#2A2A3C',
          stats: data.stats || [],
          // Module type specific settings
          ...(data.moduleType === 'aggregator' && {
            supportedChains: data.settings?.supportedChains || [],
            supportedTokens: data.settings?.supportedTokens || []
          }),
          ...(data.moduleType === 'simulation' && {
            simulationBalance: data.settings?.simulationBalance || 10000,
            timeRange: data.settings?.timeRange || '5Y'
          })
        };
        
        console.log('Setting initial form values:', initialValues);
        form.setFieldsValue(initialValues);
      } catch (e) {
        console.error('Error parsing module data:', e);
      }
    }
  }, [selectedElement, form]);

  const handleValuesChange = (changedValues, allValues) => {
    console.log('Form values changed:', {
      changedValues,
      allValues
    });

    if (!selectedElement || !moduleData) {
      console.warn('No selected element or module data available');
      return;
    }

    const updatedData = {
      ...moduleData,
      title: allValues.title,
      stats: allValues.stats || [],
      settings: {
        ...moduleData.settings,
        showStats: allValues.showStats,
        showButton: allValues.showButton,
        customColor: allValues.customColor,
        // Module type specific settings
        ...(moduleData.moduleType === 'aggregator' && {
          supportedChains: allValues.supportedChains,
          supportedTokens: allValues.supportedTokens
        }),
        ...(moduleData.moduleType === 'simulation' && {
          simulationBalance: allValues.simulationBalance,
          timeRange: allValues.timeRange
        })
      }
    };

    console.log('Updating module data:', updatedData);

    updateContent(selectedElement.id, {
      ...selectedElement,
      content: JSON.stringify(updatedData),
      styles: {
        ...selectedElement.styles,
        backgroundColor: allValues.customColor
      }
    });
  };

  const renderStatsSettings = () => {
    return (
      <>
        <Divider orientation="left">Stats Display</Divider>
        <Form.List name="stats">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'label']}
                    rules={[{ required: true, message: 'Missing label' }]}
                  >
                    <Input 
                      placeholder="Stat Label" 
                      onChange={(e) => console.log(`Stat label changed for index ${name}:`, e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    rules={[{ required: true, message: 'Missing value' }]}
                  >
                    <Input 
                      placeholder="Stat Value" 
                      onChange={(e) => console.log(`Stat value changed for index ${name}:`, e.target.value)}
                    />
                  </Form.Item>
                  <DeleteOutlined 
                    onClick={() => {
                      console.log(`Removing stat at index ${name}`);
                      remove(name);
                    }} 
                  />
                </Space>
              ))}
              <Form.Item>
                <Button 
                  type="dashed" 
                  onClick={() => {
                    console.log('Adding new stat');
                    add();
                  }} 
                  block 
                  icon={<PlusOutlined />}
                >
                  Add Stat
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </>
    );
  };

  const renderModuleSpecificSettings = () => {
    if (!moduleData) {
      console.log('No module data available for specific settings');
      return null;
    }

    console.log('Rendering specific settings for module type:', moduleData.moduleType);

    switch (moduleData.moduleType) {
      case 'aggregator':
        return (
          <>
            <Divider orientation="left">Pool Aggregator Settings</Divider>
            <Form.Item
              label="Supported Chains"
              name="supportedChains"
            >
              <Select
                mode="multiple"
                placeholder="Select supported chains"
                options={[
                  { value: 'Ethereum', label: 'Ethereum' },
                  { value: 'Polygon', label: 'Polygon' },
                  { value: 'BSC', label: 'BSC' },
                  { value: 'Avalanche', label: 'Avalanche' },
                  { value: 'Arbitrum', label: 'Arbitrum' }
                ]}
                onChange={(value) => console.log('Supported chains changed:', value)}
              />
            </Form.Item>
            <Form.Item
              label="Supported Tokens"
              name="supportedTokens"
            >
              <Select
                mode="multiple"
                placeholder="Select supported tokens"
                options={[
                  { value: 'USDC', label: 'USDC' },
                  { value: 'USDT', label: 'USDT' },
                  { value: 'DAI', label: 'DAI' },
                  { value: 'ETH', label: 'ETH' },
                  { value: 'WBTC', label: 'WBTC' }
                ]}
                onChange={(value) => console.log('Supported tokens changed:', value)}
              />
            </Form.Item>
          </>
        );
      case 'simulation':
        return (
          <>
            <Divider orientation="left">Simulation Settings</Divider>
            <Form.Item
              label="Simulation Balance"
              name="simulationBalance"
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                onChange={(value) => console.log('Simulation balance changed:', value)}
              />
            </Form.Item>
            <Form.Item
              label="Time Range"
              name="timeRange"
            >
              <Select
                options={[
                  { value: '1D', label: '1 Day' },
                  { value: '1W', label: '1 Week' },
                  { value: '1M', label: '1 Month' },
                  { value: '1Y', label: '1 Year' },
                  { value: '5Y', label: '5 Years' }
                ]}
                onChange={(value) => console.log('Time range changed:', value)}
              />
            </Form.Item>
          </>
        );
      default:
        console.log('No specific settings for module type:', moduleData.moduleType);
        return null;
    }
  };

  if (!selectedElement || !moduleData) {
    console.log('No selected element or module data available');
    return <div>Select a DeFi module to edit its settings</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label="Module Title"
        name="title"
        rules={[{ required: true, message: 'Please input the module title!' }]}
      >
        <Input onChange={(e) => console.log('Title changed:', e.target.value)} />
      </Form.Item>

      <Form.Item
        label="Show Stats"
        name="showStats"
        valuePropName="checked"
      >
        <Switch onChange={(checked) => console.log('Show stats toggled:', checked)} />
      </Form.Item>

      <Form.Item
        label="Show Button"
        name="showButton"
        valuePropName="checked"
      >
        <Switch onChange={(checked) => console.log('Show button toggled:', checked)} />
      </Form.Item>

      <Form.Item
        label="Module Color"
        name="customColor"
      >
        <ColorPicker onChange={(color) => console.log('Color changed:', color)} />
      </Form.Item>

      {renderStatsSettings()}
      {renderModuleSpecificSettings()}
    </Form>
  );
};

export default DeFiModuleSettings; 