import React, { useState, useRef, useContext } from 'react';
import './SupportPopup.css';
import { EditableContext } from '../../context/EditableContext'
const SupportPopup = ({ onClose }) => {
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [status, setStatus] = useState(null);
  const { userId } = useContext(EditableContext);

  // We use a ref so we can "click" the file input when user clicks the drop zone
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // For drag-and-drop (optional)
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleImageChange({ target: fileInputRef.current });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      // Call your function endpoint
      const response = await fetch(
        'https://sendsupportemail-xkek6fohuq-uc.a.run.app',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, imageBase64, userId }),
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
        <h2>Found a bug ? Contact-us !</h2>
        <p className="description">
          Here you can explain and describe the bug/issue you're having with DAppzy.
          Feel free to be as specific as possible! For us to be able to reproduce and correct.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="label-top" htmlFor="issue">
            Describe your issue:
          </label>
          <textarea
            id="issue"
            className="issue-textarea"
            placeholder="Describe your issue..."
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <p className="attach-text description">
            If you have any images related to your issue feel free to drop them below!
          </p>

          {/* Drop zone area */}
          <div
            className="dropzone"
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imageBase64 ? (
              <img src={imageBase64} alt="Preview" className="preview-image" />
            ) : (
              <p>Click to upload or Drop them below!</p>
            )}
          </div>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <p className="contact-info description">
            If you have any more requirements or need to contact us directly, you can do so by
            using the contact informations below (choose your platform)
          </p>
          <div className="contact-methods">
            {/* Discord */}
            <a
              href="https://discord.gg/BSgQ6whg8u"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2FVector.png?alt=media&token=a541bac4-81cc-4fc6-9e4e-ce22b16db217"
                alt="Discord"
                className="contact-icon"
              />
            </a>

            {/* Website */}
            <a
              href="https://www.dappzy.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2FlogoBlack.png?alt=media&token=13227ae0-7025-4229-b433-fe8187b9c174"
                alt="Website"
                className="contact-icon"
              />
            </a>

            {/* Twitter */}
            <a
              href="https://x.com/dappzy_io"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2Fx.png?alt=media&token=55bf09ff-5ae3-419a-ae43-e85c8c6a5982"
                alt="Twitter"
                className="contact-icon"
              />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/dappzy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/third--space.appspot.com/o/ImageWebSite%2FPopup%2FLinkedIn.png?alt=media&token=3023cb89-8f07-4056-8da1-59701877ee5c"
                alt="LinkedIn"
                className="contact-icon"
              />
            </a>
          </div>


          <div className="button-row">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={!text.trim()}>
              Submit
            </button>

          </div>
        </form>

        {status && <p className="status-msg">{status}</p>}
      </div>
    </div>
  );
};

export default SupportPopup;
