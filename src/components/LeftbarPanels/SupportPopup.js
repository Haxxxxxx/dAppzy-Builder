import React, { useState } from 'react';
import './SupportPopup.css';
const SupportPopup = ({ onClose }) => {
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [status, setStatus] = useState(null);

  // Handle file selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result); // This will be something like data:image/png;base64,iVBORw0...
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      // Call your function endpoint
      const response = await fetch(
        'https://us-central1-YOUR-PROJECT.cloudfunctions.net/sendSupportEmail', // update with your actual URL
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, imageBase64 }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setStatus('Email sent successfully!');
        setText('');
        setImageBase64(null);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="support-popup-overlay">
      <div className="support-popup-content">
        <h2>Contact Support</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Your message:</label>
            <textarea
              rows="4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Attach image (optional):</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imageBase64 && <img src={imageBase64} alt="Preview" style={{ maxWidth: '100px' }} />}
          </div>
          <button type="submit">Send</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
};

export default SupportPopup;
