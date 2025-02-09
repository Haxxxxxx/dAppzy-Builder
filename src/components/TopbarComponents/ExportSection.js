// src/components/TopbarComponents/ExportSection.js
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

      // 2. Check if we have a user
      //    If we use the wallet-based user ID, userId might be the doc ID.
      //    Otherwise, we can fallback to auth.currentUser?.uid
      let finalUserId = userId;
      const currentUser = auth.currentUser;

      if (!finalUserId && currentUser) {
        finalUserId = currentUser.uid;
      }

      if (!finalUserId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return;
      }

      // 3. Store the project under the doc ID = finalUserId
      const projectRef = doc(db, 'projects', finalUserId);

      await setDoc(projectRef, {
        html: fullHtml,
        elements: elements,
        userId: finalUserId,
        lastUpdated: serverTimestamp(),
        customUrl: userChosenUrl || '',
        testUrl: `https://your-app.com/preview/${finalUserId}`,
      });

      const testUrl = `https://your-app.com/preview/${finalUserId}`;
      setAutoSaveStatus(`Project published!`);

      // Optionally copy the URL to the clipboard
      await navigator.clipboard.writeText(testUrl);

      // Or open in a new window (optional)
      // window.open(testUrl, '_blank');

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
