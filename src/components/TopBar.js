// src/components/Topbar.js
import React, { useContext, useState } from 'react';
import { EditableContext } from '../context/EditableContext';
import './css/Topbar.css';
import JSZip from 'jszip'; // Import JSZip
import { renderElementToHtml, generateCss } from '../utils/htmlRender'; // Import rendering utilities

const Topbar = ({
  onExport,
  onResize,
  scale,
  onPreviewToggle,
  isPreviewMode,
  pageSettings,
}) => {
  const { elements, buildHierarchy } = useContext(EditableContext);
  const [customSize, setCustomSize] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');

  // Use the page settings or default values
  const projectName = pageSettings.siteTitle || 'My Website';
  const description = pageSettings.description || 'My Website';
  const faviconUrl = pageSettings.faviconUrl || '';

  const handleExportHtmlClick = () => {
    // Reset collected styles
    const collectedStyles = [];
  
    // Build hierarchy
    const nestedElements = buildHierarchy(elements);
  
    // Render the body HTML
    const bodyHtml = nestedElements.map(element => renderElementToHtml(element, collectedStyles)).join('');
  
    // Generate full HTML content
    const fullHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${projectName}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${faviconUrl ? `<link rel="icon" href="${faviconUrl}" />` : ''}
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    ${bodyHtml}
  </body>
  </html>
  `;
  
    // Generate CSS content
    const cssContent = generateCss(collectedStyles);
  
    // Create a zip file with JSZip
    const zip = new JSZip();
  
    // Add the HTML file to the zip
    zip.file('index.html', fullHtml.trim());
  
    // Add the CSS file to the zip
    zip.file('styles.css', cssContent);
  
    // Generate the zip file and trigger download
    zip.generateAsync({ type: 'blob' }).then((content) => {
      downloadBlob('website.zip', content);
    });
  };
  

  // Function to download blob content as a file
  const downloadBlob = (filename, blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to download file (not used for zip)
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

  // Export to JSON file
  const handleExportClick = () => {
    const nestedElements = buildHierarchy(elements);
    downloadFile(
      'website_structure.json',
      JSON.stringify(nestedElements, null, 2),
      'application/json'
    );
  };
  return (
    <div className="topbar">
      <div className="project-info">
        <button className="return-button">⬅️</button>
        {faviconUrl && (
          <img src={faviconUrl} alt="Favicon" className="favicon" />
        )}
        <div className="project-details">
          <span className="project-name">{projectName}</span>
          <span className="project-description">{description}</span>
        </div>
      </div>

      <div className="actions">
        <button className="undo-button">↺</button>
        <button className="redo-button">↻</button>
        <button className="preview-button" onClick={onPreviewToggle}>
          {isPreviewMode ? (
            <span className="material-symbols-outlined">visibility_off</span>
          ) : (
            <span className="material-symbols-outlined">visibility</span>
          )}
        </button>
      </div>

      <div className="resize-controls">
        <button className="resize-button" onClick={() => handleResize(1440)}>
          Big PC
        </button>
        <button className="resize-button" onClick={() => handleResize(1200)}>
          PC
        </button>
        <button className="resize-button" onClick={() => handleResize(768)}>
          Tablet
        </button>
        <button className="resize-button" onClick={() => handleResize(375)}>
          Phone
        </button>
        <input
          type="text"
          className="input"
          placeholder="Custom size (px)"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyDown={handleCustomResize} // Resize on Enter key
        />
        <span className="scale-percentage">
          Scale: {Math.round(scale * 100)}%
        </span>
      </div>

      <div className="export-section">
        <span className="autosave-status">{autoSaveStatus}</span>
        <button className="button" onClick={handleExportClick}>
          Export JSON
        </button>
        <button className="button" onClick={handleExportHtmlClick}>
          Export as HTML
        </button>
      </div>
    </div>
  );
};

export default Topbar;

