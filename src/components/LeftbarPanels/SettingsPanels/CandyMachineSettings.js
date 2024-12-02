import React, { useContext, useState, useEffect } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CandyMachineSettings = () => {
  const { updateContent, selectedElement, elements, findElementById } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({
    title: '',
    description: '',
    timer: undefined,
    remaining: '',
    price: '',
    quantity: '',
    blockchain: 'Ethereum', // Default blockchain
  });

  const availableBlockchains = ['Ethereum', 'Solana', 'Polygon', 'Binance Smart Chain'];

  // Initialize settings only when `selectedElement` changes
  useEffect(() => {
    if (selectedElement) {
      const elementData = findElementById(selectedElement.id, elements);
      setLocalSettings({
        title: elementData?.title || '',
        description: elementData?.description || '',
        timer: elementData?.timer ? new Date(elementData.timer) : undefined,
        remaining: elementData?.remaining || '',
        price: elementData?.price || '',
        quantity: elementData?.quantity || '',
        blockchain: elementData?.blockchain || 'Ethereum',
      });
    }
  }, [selectedElement]); // Only depend on `selectedElement`

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update local state immediately
    setLocalSettings((prev) => ({ ...prev, [name]: value }));

    if (selectedElement) {
      // Find the child element to update
      const childElement = elements.find(
        (el) => el.parentId === selectedElement.id && el.type === name
      );

      if (childElement) {
        // Update the content in the global state
        updateContent(childElement.id, value);
      }
    }
  };

  const handleDateChange = (date) => {
    setLocalSettings((prev) => ({ ...prev, timer: date }));

    if (selectedElement) {
      const childElement = elements.find(
        (el) => el.parentId === selectedElement.id && el.type === 'timer'
      );

      if (childElement) {
        updateContent(childElement.id, date?.toISOString());
      }
    }
  };

  const handleBlockchainChange = (e) => {
    const blockchain = e.target.value;
    setLocalSettings((prev) => ({ ...prev, blockchain }));

    if (selectedElement) {
      const childElement = elements.find(
        (el) => el.parentId === selectedElement.id && el.type === 'blockchain'
      );

      if (childElement) {
        updateContent(childElement.id, blockchain);
      }
    }
  };

  return (
    <div className="settings-panel">
      <h3>Collection Details</h3>
      <label htmlFor="title">Collection Name:</label>
      <input
        type="text"
        name="title"
        value={localSettings.title}
        onChange={handleInputChange}
        placeholder="Enter collection name"
      />
      <label htmlFor="description">Description:</label>
      <textarea
        name="description"
        value={localSettings.description}
        onChange={handleInputChange}
        placeholder="Enter description"
      />
      <label htmlFor="timer">Timer:</label>
      <DatePicker
        selected={localSettings.timer}
        onChange={handleDateChange}
        dateFormat="MMMM d, yyyy h:mm aa"
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="time"
        placeholderText="Select a date and time"
      />
      <label htmlFor="remaining">Remaining:</label>
      <input
        type="text"
        name="remaining"
        value={localSettings.remaining}
        onChange={handleInputChange}
        placeholder="Enter remaining"
      />
      <label htmlFor="price">Price:</label>
      <input
        type="text"
        name="price"
        value={localSettings.price}
        onChange={handleInputChange}
        placeholder="Enter price"
      />
      <label htmlFor="quantity">Quantity:</label>
      <input
        type="text"
        name="quantity"
        value={localSettings.quantity}
        onChange={handleInputChange}
        placeholder="Enter quantity"
      />
      <label htmlFor="blockchain">Select Blockchain:</label>
      <select
        name="blockchain"
        value={localSettings.blockchain}
        onChange={handleBlockchainChange}
      >
        {availableBlockchains.map((blockchain) => (
          <option key={blockchain} value={blockchain}>
            {blockchain}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CandyMachineSettings;
