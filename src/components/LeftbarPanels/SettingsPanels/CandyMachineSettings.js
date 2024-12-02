import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CandyMachineSettings.css';

const parseTimerToDate = (timerString) => {
  if (!timerString) return null;
  const match = timerString.match(/(\d+)d\s(\d+)h\s(\d+)m\s(\d+)s/);
  if (!match) return null;

  const [_, days, hours, minutes, seconds] = match.map(Number);
  const now = new Date();
  return new Date(
    now.getTime() +
      days * 24 * 60 * 60 * 1000 +
      hours * 60 * 60 * 1000 +
      minutes * 60 * 1000 +
      seconds * 1000
  );
};

const formatDateToTimer = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = Math.max(0, date - now);

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const CandyMachineSettings = () => {
  const { updateContent, selectedElement, elements, findElementById } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({});
  const [imagePreviews, setImagePreviews] = useState({}); // Track image previews

  useEffect(() => {
    if (selectedElement) {
      const childrenElements = elements.filter((el) => el.parentId === selectedElement.id);
      const settings = childrenElements.reduce((acc, child) => {
        acc[child.type] = child.content || '';
        return acc;
      }, {});
      const timerDate = parseTimerToDate(settings.timer);
      setLocalSettings((prev) => ({
        ...prev,
        ...settings,
        timer: timerDate || null,
      }));
    }
  }, [selectedElement, elements]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));

    if (selectedElement) {
      const childElement = elements.find(
        (el) => el.parentId === selectedElement.id && el.type === name
      );
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
        setImagePreviews((prev) => ({ ...prev, [key]: reader.result }));
        setLocalSettings((prev) => ({ ...prev, [key]: reader.result }));

        if (selectedElement) {
          const childElement = elements.find(
            (el) => el.parentId === selectedElement.id && el.type === key
          );
          if (childElement) {
            updateContent(childElement.id, reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date) => {
    setLocalSettings((prev) => ({ ...prev, timer: date }));

    if (selectedElement) {
      const childElement = elements.find(
        (el) => el.parentId === selectedElement.id && el.type === 'timer'
      );
      if (childElement) {
        const formattedTimer = formatDateToTimer(date);
        updateContent(childElement.id, formattedTimer);
      }
    }
  };

  const renderInputs = () => {
    const inputTypes = {
      title: 'text',
      description: 'textarea',
      timer: 'date',
      remaining: 'number',
      price: 'text',
      quantity: 'number',
      currency: 'dropdown',
      logo: 'image',
      rareItems: 'image-array',
      documentItems: 'image-array',
    };

    const availableCurrencies = ['SOL', 'ETH', 'USDC', 'BTC'];

    return Object.keys(localSettings).map((key) => {
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
                selected={localSettings[key]}
                onChange={handleDateChange}
                dateFormat="MMMM d, yyyy h:mm aa"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                placeholderText="Select a date and time"
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
                {availableCurrencies.map((currency) => (
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, key)}
                className="settings-input"
              />
              {imagePreviews[key] && <img src={imagePreviews[key]} alt={`${key} preview`} className="image-preview" />}
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
    <div>
      <h3>Minting Section Settings</h3>
      {renderInputs()}
    </div>
  );
};

export default CandyMachineSettings;
