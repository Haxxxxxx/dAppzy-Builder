import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { renderElementToHtml } from '../../utils/htmlRender';
import { flattenStyles } from '../../utils/htmlRenderUtils/cssUtils';

const ExportSection = ({ elements, buildHierarchy, userId, userChosenUrl = '' }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');

  const handleExportHtml = async () => {
    setAutoSaveStatus('Publishing...');

    try {
      // 1. Build the full HTML
      const collectedStyles = [];
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

      // 2. Determine the user ID
      let finalUserId = userId;
      const currentUser = auth.currentUser;

      if (!finalUserId && currentUser) {
        finalUserId = currentUser.uid;
      }

      if (!finalUserId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return;
      }

      // 3. Construct the preview URL based on the environment
      const isLocal = window.location.hostname === 'localhost';
      const baseUrl = isLocal ? 'http://localhost:3000' : 'https://demo.3rd-space.io';

      const testUrl = userChosenUrl
        ? `${baseUrl}/${userChosenUrl}`
        : `${baseUrl}/preview/${finalUserId}`;

      // 4. Store the project under the user's document
      const projectRef = doc(db, 'projects', finalUserId);

      await setDoc(projectRef, {
        html: fullHtml,
        elements: elements,
        userId: finalUserId,
        lastUpdated: serverTimestamp(),
        customUrl: userChosenUrl || '',
        testUrl,
      });

      setAutoSaveStatus(`Project published!`);

      // Copy the preview URL to clipboard
      await navigator.clipboard.writeText(testUrl);

      // Open the preview in a new tab
      window.open(testUrl, '_blank');

    } catch (error) {
      console.error('Error publishing project:', error);
      setAutoSaveStatus('Error publishing project: ' + error.message);
    }
  };

  return (
    <div className="export-section">
      <span
        className="material-symbols-outlined export-cloud"
        style={{ color: 'white' }}
      >
        cloud_done
      </span>
      <span className="autosave-status">{autoSaveStatus}</span>

      <button className="button" onClick={handleExportHtml}>
        Publish
      </button>
    </div>
  );
};

export default ExportSection;
