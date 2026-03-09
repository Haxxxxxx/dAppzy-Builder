import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import { Form, Input, Switch, ColorPicker, Select, InputNumber, Space, Divider, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const DeFiModuleSettings = ({ selectedElement }) => {
  const { updateContent, updateStyles } = useContext(EditableContext);
  const [form] = Form.useForm();
  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    if (selectedElement) {
      try {
        const data = typeof selectedElement.content === 'string'
          ? JSON.parse(selectedElement.content)
          : selectedElement.content;
        setModuleData(data);

        const initialValues = {
          title: data.title,
          showStats: data.settings?.showStats ?? true,
          showButton: data.settings?.showButton ?? true,
          customColor: data.settings?.customColor ?? '#2A2A3C',
          stats: data.stats || [],
          ...(data.moduleType === 'aggregator' && {
            supportedChains: data.settings?.supportedChains || [],
            supportedTokens: data.settings?.supportedTokens || []
          }),
          ...(data.moduleType === 'simulation' && {
            simulationBalance: data.settings?.simulationBalance || 10000,
            timeRange: data.settings?.timeRange || '5Y'
          })
        };

        form.setFieldsValue(initialValues);
      } catch (e) {
        console.error('[DeFiModuleSettings] Failed to parse module data:', e);
      }
    }
  }, [selectedElement, form]);

  const handleValuesChange = (changedValues, allValues) => {
    if (!selectedElement || !moduleData) {
      return;
    }

    const updatedData = {
      ...moduleData,
      title: allValues.title || moduleData.title,
      stats: allValues.stats || moduleData.stats || [],
      settings: {
        ...moduleData.settings,
        showStats: allValues.showStats ?? moduleData.settings?.showStats ?? true,
        showButton: allValues.showButton ?? moduleData.settings?.showButton ?? true,
        customColor: allValues.customColor || moduleData.settings?.customColor || '#2A2A3C',
        ...(moduleData.moduleType === 'aggregator' && {
          supportedChains: allValues.supportedChains || moduleData.settings?.supportedChains || [],
          supportedTokens: allValues.supportedTokens || moduleData.settings?.supportedTokens || []
        }),
        ...(moduleData.moduleType === 'simulation' && {
          simulationBalance: allValues.simulationBalance || moduleData.settings?.simulationBalance || 10000,
          timeRange: allValues.timeRange || moduleData.settings?.timeRange || '5Y'
        })
      }
    };

    updateContent(selectedElement.id, JSON.stringify(updatedData));

    if (allValues.customColor) {
      updateStyles(selectedElement.id, {
        backgroundColor: allValues.customColor
      });
    }

    setModuleData(updatedData);
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
                    <Input placeholder="Stat Label" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    rules={[{ required: true, message: 'Missing value' }]}
                  >
                    <Input placeholder="Stat Value" />
                  </Form.Item>
                  <DeleteOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
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
      return null;
    }

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
              />
            </Form.Item>
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
        <Input />
      </Form.Item>

      <Form.Item
        label="Show Stats"
        name="showStats"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="Show Button"
        name="showButton"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label="Module Color"
        name="customColor"
      >
        <ColorPicker />
      </Form.Item>

      {renderStatsSettings()}
      {renderModuleSpecificSettings()}
    </Form>
  );
};

export default DeFiModuleSettings;
