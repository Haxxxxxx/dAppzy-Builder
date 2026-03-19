// src/components/Actions.js or Visibility.js
import React, { useContext, useCallback } from 'react';
import { EditableContext } from '../../context/EditableContext';
import { generateProjectHtml } from '../../utils/export/htmlGenerator';

const Visibility = ({ onPreviewToggle, isPreviewMode, websiteSettings, onOpenVersionHistory, dashboardData }) => {
  const { undo, redo, canUndo, canRedo, elements } = useContext(EditableContext);
  const handlePreviewToggle = () => {
    onPreviewToggle();
  };

  const handlePreviewInNewTab = useCallback(() => {
    const html = generateProjectHtml(elements, websiteSettings, dashboardData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke after a short delay so the tab has time to load
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [elements, websiteSettings, dashboardData]);

  return (
    <div className="actions">
      <button
        className="undo-button"
        onClick={undo}
        disabled={!canUndo}
      >
        <span className="material-symbols-outlined">undo</span>
      </button>
      <button
        className="redo-button"
        onClick={redo}
        disabled={!canRedo}
      >
        <span className="material-symbols-outlined">redo</span>
      </button>
      <button className="preview-button" onClick={handlePreviewToggle} title={isPreviewMode ? 'Exit preview' : 'Preview'}>
        {isPreviewMode ? (
          <span className="material-symbols-outlined">visibility_off</span>
        ) : (
          <span className="material-symbols-outlined">visibility</span>
        )}
      </button>
      <button
        className="preview-button"
        onClick={handlePreviewInNewTab}
        title="Preview in new tab"
      >
        <span className="material-symbols-outlined">open_in_new</span>
      </button>
      <button
        className="preview-button"
        onClick={onOpenVersionHistory}
        title="Version history"
      >
        <span className="material-symbols-outlined">history</span>
      </button>
    </div>
  );
};

export default Visibility;
