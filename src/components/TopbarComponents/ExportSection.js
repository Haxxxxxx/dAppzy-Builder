import React, { useState } from 'react';
import JSZip from 'jszip';
import { renderElementToHtml } from '../../utils/htmlRender'
import { flattenStyles } from '../../utils/htmlRenderUtils/cssUtils';

const ExportSection = ({ elements, buildHierarchy }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');

  const handleExportHtml = async () => {
    const zip = new JSZip();
    const collectedStyles = [];

    // Build the full HTML content
    const nestedElements = buildHierarchy(elements);
    const bodyHtml = nestedElements
      .map((element) => renderElementToHtml(element, collectedStyles))
      .join('');

    const globalStyles = collectedStyles
      .map(
        ({ className, styles }) =>
          `.${className} {\n${flattenStyles(styles)}\n}`
      )
      .join('\n');

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Website</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
    }
    ${globalStyles}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>
    `.trim();

    zip.file('index.html', fullHtml);

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob('website.zip', content);
  };

  const downloadBlob = (filename, blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-section">
      <span className="autosave-status">{autoSaveStatus}</span>
      <button className="button" onClick={handleExportHtml}>
        Export as HTML
      </button>
    </div>
  );
};

export default ExportSection;
