import React, { useContext, useState } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/Topbar.css';
import ReactDOMServer from 'react-dom/server';
import { renderElement } from '../utils/LeftBarUtils/RenderUtils';

const Topbar = ({ onExport, onResize }) => {
  const { elements, buildHierarchy } = useContext(EditableContext);
  const [customSize, setCustomSize] = useState('');
  const [dezoomPercent, setDezoomPercent] = useState(100); // Default to 100% for no scaling
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved'); // Default save status

  const projectName = "My Project"; // Replace with dynamic value if needed
  const projectURL = "https://www.myproject.com"; // Replace with dynamic value if needed

  // Export to JSON file
  const handleExportClick = () => {
    const nestedElements = buildHierarchy(elements);
    downloadFile('website_structure.json', JSON.stringify(nestedElements, null, 2), 'application/json');
  };

  // Export to HTML file
  const handleExportHtmlClick = () => {
    const renderHtml = (element) => {
      const component = renderElement(element, elements);
      return ReactDOMServer.renderToStaticMarkup(component);
    };

    const nestedElements = buildHierarchy(elements);
    const htmlElements = nestedElements.map((element) => renderHtml(element));

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exported Website</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="styles.css">
        </head>
        <body>
          ${htmlElements.join('')}
        </body>
      </html>
    `;

    downloadFile('exported_website.html', fullHtml, 'text/html');
  };

  // Function to download file
  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle resizing of content based on button or input
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

  // Handle resizing with custom input size
  const handleCustomResize = (e) => {
    if (e.key === 'Enter') {
      const parsedSize = parseInt(customSize, 10);
      if (!isNaN(parsedSize)) {
        handleResize(parsedSize);
      }
    }
  };

  // Simulate auto-save whenever an edit occurs
  const handleEdit = () => {
    setAutoSaveStatus('Saving...');
    setTimeout(() => {
      setAutoSaveStatus('All changes saved');
    }, 1000); // Simulating save delay of 1 second
  };

  return (
    <div className="topbar">
      <div className="project-info">
        <button className="return-button">⬅️</button>
        <div className="project-details">
          <span className="project-name">{projectName}</span>
          <span className="project-url">{projectURL}</span>
        </div>
      </div>

      <div className="actions">
        <button className="undo-button">↺</button>
        <button className="redo-button">↻</button>
        <button className="preview-button">
        <span className="material-symbols-outlined">visibility</span>
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
        <button className="button" onClick={handleExportClick}>Export JSON</button>
        <button className="button" onClick={handleExportHtmlClick}>Export as HTML</button>
      </div>
    </div>
  );
};

export default Topbar;
