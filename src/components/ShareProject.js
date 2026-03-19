import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { deployToIPFS } from '../utils/export/ipfsUtils';
import './ShareProject.css';

const ShareProject = ({ elements, websiteSettings, userId, projectId, pages, shareUrl: initialShareUrl, onShareUrlGenerated, onClose, dashboardData }) => {
  const [shareUrl, setShareUrl] = useState(initialShareUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  // Sync from parent if it changes (e.g. loaded from Firestore after mount)
  useEffect(() => {
    if (initialShareUrl) {
      setShareUrl(initialShareUrl);
    }
  }, [initialShareUrl]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      // For multi-page projects, deploy the homepage elements
      const isMultiPage = pages && pages.length > 1;
      const homePage = isMultiPage
        ? pages.find(p => p.slug === '/' || p.slug === '') || pages[0]
        : null;
      const deployElements = isMultiPage ? (homePage.elements || []) : elements;

      const { ipfsUrl } = await deployToIPFS(userId, projectId, deployElements, websiteSettings, dashboardData);

      // Persist the share URL to Firestore
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      await setDoc(projectRef, {
        shareUrl: ipfsUrl,
        shareUrlGeneratedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      }, { merge: true });

      setShareUrl(ipfsUrl);
      if (onShareUrlGenerated) {
        onShareUrlGenerated(ipfsUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  // Close modal on overlay click (not on inner modal click)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="share-modal-overlay" onClick={handleOverlayClick}>
      <div className="share-modal">
        <div className="share-modal-header">
          <h3 className="share-modal-title">Share for Feedback</h3>
          <button className="share-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="share-modal-body">
          <p className="share-modal-description">
            Generate a read-only preview link to share your site with others for feedback.
            The link is a snapshot of your current design hosted on IPFS.
          </p>

          {error && (
            <p className="share-error">{error}</p>
          )}

          {shareUrl ? (
            <div className="share-link-container">
              <div className="share-link-row">
                <span className="material-symbols-outlined share-success-icon">check_circle</span>
                <a
                  className="share-link-url"
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={shareUrl}
                >
                  {shareUrl}
                </a>
                <button className="share-copy-btn" onClick={handleCopy}>
                  <span className="material-symbols-outlined">
                    {copied ? 'done' : 'content_copy'}
                  </span>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="share-actions-row">
                <button
                  className="share-regenerate-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="share-spinner" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">refresh</span>
                      Regenerate
                    </>
                  )}
                </button>
                <button
                  className="share-open-btn"
                  onClick={() => window.open(shareUrl, '_blank')}
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                  Open Preview
                </button>
              </div>

              <p className="share-note">
                Anyone with this link can view your site. The link is read-only.
                Click "Regenerate" to update the preview with your latest changes.
              </p>
            </div>
          ) : (
            <button
              className="share-generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="share-spinner" />
                  Generating share link...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>link</span>
                  Generate Share Link
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareProject;
