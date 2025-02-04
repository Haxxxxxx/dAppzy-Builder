// src/components/TopbarComponents/ExportSection.js

import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // <-- import your firebase config
import { renderElementToHtml } from '../../utils/htmlRender';
import { flattenStyles } from '../../utils/htmlRenderUtils/cssUtils';

const ExportSection = ({ elements, buildHierarchy, userChosenUrl = '' }) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');

  const handleExportHtml = async () => {
    setAutoSaveStatus('Publishing...');

    try {
      // 1. Build the full HTML content (same approach as before)
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

      // 2. Get the current user from Firebase Auth
      const user = auth.currentUser;
      if (!user) {
        setAutoSaveStatus('Error: User not logged in!');
        return;
      }

      // 3. Save to Firestore (for example, under 'projects' collection)
      // You might want to generate a separate doc ID if you handle multiple projects per user.
      const projectRef = doc(db, 'projects', user.uid);

      await setDoc(projectRef, {
        html: fullHtml,
        elements: elements,
        userId: user.uid,
        lastUpdated: serverTimestamp(),
        customUrl: userChosenUrl || '',
        testUrl: `https://your-app.com/preview/${user.uid}`,
      });

      setAutoSaveStatus(
        `Project published! Preview at https://your-app.com/preview/${user.uid}`
      );

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
