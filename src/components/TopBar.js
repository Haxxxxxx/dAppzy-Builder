import React, { useContext, useState } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/Topbar.css';

const Topbar = ({ onExport, onResize }) => {
  const { elements } = useContext(EditableContext);
  const [customSize, setCustomSize] = useState('');
  const [dezoomPercent, setDezoomPercent] = useState(100); // Default to 100% for no scaling
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved'); // Default save status

  const projectName = "My Project"; // Replace with dynamic value if needed
  const projectURL = "https://www.myproject.com"; // Replace with dynamic value if needed

  const handleExportClick = () => {
    if (onExport) {
      console.log('Exporting elements:', elements);
      onExport(elements);
    } else {
      console.error('Export function is not defined');
    }
  };

  const handleResize = (size) => {
    if (onResize) {
      onResize(size);
      setCustomSize(size);

      // Calculate dezoom percentage if the content width exceeds viewport width
      const viewportWidth = window.innerWidth;
      if (size > viewportWidth) {
        const newScale = viewportWidth / size;
        const percentage = Math.round(newScale * 100);
        setDezoomPercent(percentage);
      } else {
        setDezoomPercent(100); // No scaling needed
      }
    }
  };

  // Handle resizing when the user presses Enter in the custom size input field
  const handleCustomResize = (e) => {
    if (e.key === 'Enter') {
      const parsedSize = parseInt(customSize, 10);
      if (!isNaN(parsedSize)) {
        handleResize(parsedSize);
      }
    }
  };

  // Simulate auto-save behavior whenever the elements change
  const handleEdit = () => {
    setAutoSaveStatus('Saving...');
    setTimeout(() => {
      setAutoSaveStatus('All changes saved');
    }, 1000); // Simulating save delay of 1 second
  };

  return (
    <div className="topbar">
      <div className="project-info">
        <button className="return-button">
          ⬅️ {/* Placeholder return button (replace with logo image if needed) */}
        </button>
        <div className="project-details">
          <span className="project-name">{projectName}</span>
          <span className="project-url">{projectURL}</span>
        </div>
      </div>

      <div className="actions">
        <button className="undo-button">
          ↺ {/* Undo Arrow */}
        </button>
        <button className="redo-button">
          ↻ {/* Redo Arrow */}
        </button>
        <button className="preview-button">
          👁️ {/* Preview Icon */}
        </button>
      </div>

      <div className="resize-controls">
        <button className="resize-button" onClick={() => handleResize(1440)}>Big PC</button>
        <button className="resize-button" onClick={() => handleResize(1200)}>PC</button>
        <button className="resize-button" onClick={() => handleResize(768)}>Tablet</button>
        <button className="resize-button" onClick={() => handleResize(375)}>Phone</button>
        <input
          type="text"
          className="input"
          placeholder="Custom size (px)"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyDown={handleCustomResize} // Resize on Enter key
        />
      </div>

      <div className="export-section">
        <span className="autosave-status">{autoSaveStatus}</span>
        <button className="button" onClick={handleExportClick}>Export Content</button>
      </div>
    </div>
  );
};

export default Topbar;
