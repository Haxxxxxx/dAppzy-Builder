import React, { useState } from 'react';
import { generateProjectFromPrompt } from '../services/aiBuilderService';
import { buildFlatElements } from '../configs/templates';
import './css/AIBuilder.css';

const CF_BASE_URL = import.meta.env.VITE_CF_BASE_URL;

const AIBuilder = ({ onProjectGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!CF_BASE_URL) {
      setError('Cloud Functions URL not configured.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sections = await generateProjectFromPrompt(prompt.trim(), CF_BASE_URL);
      const elements = buildFlatElements(sections);
      onProjectGenerated({
        elements,
        websiteSettings: {
          siteTitle: 'AI Generated Project',
          faviconUrl: '',
          description: prompt.trim().substring(0, 200),
          author: '',
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to generate project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-builder-overlay" onClick={onClose}>
      <div className="ai-builder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-builder-header">
          <div className="ai-builder-title">
            <span className="material-symbols-outlined ai-icon">auto_awesome</span>
            <h2>AI Builder</h2>
          </div>
          <button className="ai-builder-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="ai-builder-loading">
            <span className="material-symbols-outlined ai-loading-icon">auto_awesome</span>
            <p>AI is building your project...</p>
            <p className="ai-loading-sub">This may take a few seconds</p>
          </div>
        ) : (
          <>
            <div className="ai-builder-body">
              <textarea
                className="ai-builder-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your project... e.g., 'A DeFi dashboard with dark theme, swap interface, and staking section'"
                maxLength={2000}
                rows={5}
                autoFocus
              />
              <div className="ai-builder-char-count">
                {prompt.length}/2000
              </div>
              {error && (
                <div className="ai-builder-error">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="ai-builder-footer">
              <button className="ai-builder-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                className="ai-builder-generate"
                onClick={handleGenerate}
                disabled={!prompt.trim()}
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Generate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIBuilder;
