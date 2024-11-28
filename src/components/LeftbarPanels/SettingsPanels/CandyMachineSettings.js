import React, { useContext, useState } from 'react';
import { EditableContext } from '../../../context/EditableContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CandyMachineSettings = () => {
  const { updateContent, selectedElement } = useContext(EditableContext);
  const [localSettings, setLocalSettings] = useState({
    title: '',
    description: '',
    timer: null,
    remaining: '',
    price: '',
    quantity: '',
    logo: '',
    rareItems: [],
    documentItems: [],
    blockchain: 'Ethereum', // Default blockchain
  });

  const availableBlockchains = ['Ethereum', 'Solana', 'Polygon', 'Binance Smart Chain'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));

    if (selectedElement) {
      updateContent(`${selectedElement.id}-${name}`, value || '');
    }
  };

  const handleDateChange = (date) => {
    setLocalSettings((prev) => ({ ...prev, timer: date }));
    if (selectedElement) {
      updateContent(`${selectedElement.id}-timer`, date?.toISOString() || '');
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setLocalSettings((prev) => ({ ...prev, [type]: reader.result }));

      if (selectedElement) {
        updateContent(`${selectedElement.id}-${type}`, reader.result);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleBlockchainChange = (e) => {
    const blockchain = e.target.value;
    setLocalSettings((prev) => ({ ...prev, blockchain }));

    if (selectedElement) {
      updateContent(`${selectedElement.id}-blockchain`, blockchain);
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
      <label htmlFor="logo">Logo:</label>
      <input
        type="file"
        name="logo"
        onChange={(e) => handleImageChange(e, 'logo')}
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

      {/* Other settings like rare items and document items can go here */}
    </div>
  );
};

export default CandyMachineSettings;
