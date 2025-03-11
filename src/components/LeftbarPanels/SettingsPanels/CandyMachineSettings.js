// src/components/Settings/CandyMachineSettings.jsx
import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/CandyMachineSettings.css';

const CandyMachineSettings = () => {
  const { updateContent, selectedElement, elements } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({});

  useEffect(() => {
    if (selectedElement) {
      const childrenElements = elements.filter(el => el.parentId === selectedElement.id);
      const settings = childrenElements.reduce((acc, child) => {
        acc[child.type] = child.content || '';
        return acc;
      }, {});

      // Parse timer if set.
      if (settings.timer) {
        const parsed = new Date(settings.timer);
        settings.timer = !isNaN(parsed.getTime()) ? parsed : null;
      }

      setLocalSettings(settings);
    }
  }, [selectedElement, elements]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
    if (selectedElement) {
      const childElement = elements.find(el => el.parentId === selectedElement.id && el.type === name);
      if (childElement) {
        updateContent(childElement.id, value);
      }
    }
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLocalSettings(prev => ({ ...prev, [key]: reader.result }));
        if (selectedElement) {
          const childElement = elements.find(el => el.parentId === selectedElement.id && el.type === key);
          if (childElement) {
            updateContent(childElement.id, reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date) => {
    setLocalSettings(prev => ({ ...prev, timer: date }));
  };

  const handleDateClose = () => {
    if (!selectedElement) return;
    const childElement = elements.find(el => el.parentId === selectedElement.id && el.type === 'timer');
    if (childElement) {
      const date = localSettings.timer;
      updateContent(childElement.id, date ? date.toISOString() : '');
    }
  };

  const renderInputs = () => {
    // Define input types including a new field for candyMachineId.
    const inputTypes = {
      candyMachineId: 'text', // Candy Machine public key.
      title: 'text',
      description: 'textarea',
      timer: 'date',
      remaining: 'number',
      price: 'text',
      quantity: 'number',
      currency: 'dropdown',
      image: 'image',
      rareItemsTitle: 'text',
      docItemsTitle: 'text',
    };

    const availableCurrencies = ['SOL', 'ETH', 'USDC', 'BTC'];

    return Object.keys(localSettings).map(key => {
      switch (inputTypes[key]) {
        case 'textarea':
          return (
            <div className="settings-group" key={key}>
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <textarea
                name={key}
                value={localSettings[key]}
                onChange={handleInputChange}
                placeholder={`Enter ${key}`}
                className="settings-input"
              />
            </div>
          );
        case 'date':
          return (
            <div className="settings-group" key={key}>
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <DatePicker
                selected={localSettings.timer}
                onChange={handleDateChange}
                onCalendarClose={handleDateClose}
                dateFormat="MMMM d, yyyy h:mm aa"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                className="settings-input"
              />
            </div>
          );
        case 'dropdown':
          return (
            <div className="settings-group" key={key}>
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <select
                name={key}
                value={localSettings[key]}
                onChange={handleInputChange}
                className="settings-input"
              >
                {availableCurrencies.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          );
        case 'image':
          return (
            <div className="settings-group" key={key}>
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <button
                type="button"
                onClick={() => document.getElementById(`${key}-file-input`).click()}
                className="settings-button"
              >
                Choose Image
              </button>
              <input
                type="file"
                id={`${key}-file-input`}
                accept="image/*"
                onChange={(e) => handleImageChange(e, key)}
                style={{ display: 'none' }}
              />
            </div>
          );
        default:
          return (
            <div className="settings-group" key={key}>
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <input
                type={inputTypes[key] || 'text'}
                name={key}
                value={localSettings[key]}
                onChange={handleInputChange}
                placeholder={`Enter ${key}`}
                className="settings-input"
              />
            </div>
          );
      }
    });
  };

  return (
    <div className="candy-machine-settings">
      <h3>Minting Section Settings</h3>
      {renderInputs()}
    </div>
  );
};

export default CandyMachineSettings;
