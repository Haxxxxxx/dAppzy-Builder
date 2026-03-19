// src/components/VersionHistory.js
// Slide-out panel that shows version snapshots and allows restore.

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import { useToast } from '../context/ToastContext';
import {
  saveVersion,
  loadVersions,
  restoreVersion,
  labelVersion,
} from '../services/versionService';
import './VersionHistory.css';

// ── Relative time formatter ──
function timeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const VersionHistory = ({ userId, projectId, pageSettings, setPageSettings, onClose }) => {
  const { elements, setElements, pages, setPages } = useContext(EditableContext);
  const { showToast } = useToast();

  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [showSnapshotInput, setShowSnapshotInput] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(null); // version object being confirmed
  const [isRestoring, setIsRestoring] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editLabelValue, setEditLabelValue] = useState('');

  const labelInputRef = useRef(null);
  const snapshotInputRef = useRef(null);

  // Load versions on mount
  const fetchVersions = useCallback(async () => {
    if (!userId || !projectId) return;
    setIsLoading(true);
    try {
      const data = await loadVersions(userId, projectId);
      setVersions(data);
    } catch (err) {
      if (import.meta.env.DEV) console.error('[VersionHistory] Failed to load:', err);
      showToast('Failed to load version history', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, projectId, showToast]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // Focus snapshot input when shown
  useEffect(() => {
    if (showSnapshotInput && snapshotInputRef.current) {
      snapshotInputRef.current.focus();
    }
  }, [showSnapshotInput]);

  // Focus label input when editing
  useEffect(() => {
    if (editingLabelId && labelInputRef.current) {
      labelInputRef.current.focus();
    }
  }, [editingLabelId]);

  // ── Save manual snapshot ──
  const handleSaveSnapshot = async () => {
    if (!userId || !projectId) return;
    setIsSavingSnapshot(true);
    try {
      await saveVersion(
        userId,
        projectId,
        elements,
        pages,
        pageSettings,
        snapshotLabel.trim() || null
      );
      showToast('Snapshot saved', 'success');
      setSnapshotLabel('');
      setShowSnapshotInput(false);
      await fetchVersions();
    } catch (err) {
      if (import.meta.env.DEV) console.error('[VersionHistory] Save snapshot failed:', err);
      showToast('Failed to save snapshot', 'error');
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  // ── Restore a version ──
  const handleRestore = async (version) => {
    if (!userId || !projectId || !version) return;
    setIsRestoring(true);
    try {
      // Safety net: save current state as a version before restoring
      await saveVersion(
        userId,
        projectId,
        elements,
        pages,
        pageSettings,
        'Auto-save before restore'
      );

      // Load the selected version's data
      const data = await restoreVersion(version.id, userId, projectId);
      if (!data) {
        showToast('Version not found', 'error');
        setConfirmRestore(null);
        return;
      }

      // Apply the version data
      if (data.elements) {
        setElements(() => data.elements);
      }
      if (data.pages && data.pages.length > 0) {
        setPages(data.pages);
      }
      if (data.websiteSettings && Object.keys(data.websiteSettings).length > 0) {
        setPageSettings(prev => ({ ...prev, ...data.websiteSettings }));
      }

      showToast('Version restored', 'success');
      setConfirmRestore(null);
      await fetchVersions();
    } catch (err) {
      if (import.meta.env.DEV) console.error('[VersionHistory] Restore failed:', err);
      showToast('Failed to restore version', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // ── Label a version ──
  const handleSaveLabel = async (versionId) => {
    if (!userId || !projectId) return;
    try {
      await labelVersion(userId, projectId, versionId, editLabelValue.trim());
      setVersions(prev =>
        prev.map(v => (v.id === versionId ? { ...v, label: editLabelValue.trim() } : v))
      );
      setEditingLabelId(null);
      setEditLabelValue('');
    } catch (err) {
      if (import.meta.env.DEV) console.error('[VersionHistory] Label save failed:', err);
      showToast('Failed to save label', 'error');
    }
  };

  // Close panel on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (confirmRestore) {
          setConfirmRestore(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, confirmRestore]);

  return (
    <>
      {/* Overlay */}
      <div className="version-history-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="version-history-panel">
        {/* Header */}
        <div className="vh-header">
          <div className="vh-header-left">
            <span className="material-symbols-outlined">history</span>
            <span className="vh-title">Version History</span>
          </div>
          <button className="vh-close-btn" onClick={onClose} title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Save Snapshot */}
        {!showSnapshotInput ? (
          <button
            className="vh-save-snapshot-btn"
            onClick={() => setShowSnapshotInput(true)}
            disabled={isSavingSnapshot}
          >
            <span className="material-symbols-outlined">add_circle_outline</span>
            Save Snapshot
          </button>
        ) : (
          <div className="vh-snapshot-input-row">
            <input
              ref={snapshotInputRef}
              className="vh-snapshot-input"
              type="text"
              placeholder="Snapshot name (optional)"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveSnapshot();
                if (e.key === 'Escape') {
                  setShowSnapshotInput(false);
                  setSnapshotLabel('');
                }
              }}
            />
            <button
              className="vh-snapshot-confirm-btn"
              onClick={handleSaveSnapshot}
              disabled={isSavingSnapshot}
            >
              {isSavingSnapshot ? 'Saving...' : 'Save'}
            </button>
            <button
              className="vh-snapshot-cancel-btn"
              onClick={() => {
                setShowSnapshotInput(false);
                setSnapshotLabel('');
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Version list */}
        <div className="vh-list">
          {isLoading ? (
            <div className="vh-loading">
              <span className="vh-spinner" />
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="vh-empty">
              <span className="material-symbols-outlined">inventory_2</span>
              No versions yet. Save a snapshot or wait for auto-save to create one.
            </div>
          ) : (
            versions.map((version, idx) => (
              <div key={version.id} className="vh-item">
                <div className="vh-item-dot" />
                <div className="vh-item-content">
                  <div className="vh-item-time">{timeAgo(version.timestamp)}</div>
                  {editingLabelId === version.id ? (
                    <input
                      ref={labelInputRef}
                      className="vh-label-input"
                      type="text"
                      placeholder="Add a label..."
                      value={editLabelValue}
                      onChange={(e) => setEditLabelValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveLabel(version.id);
                        if (e.key === 'Escape') {
                          setEditingLabelId(null);
                          setEditLabelValue('');
                        }
                      }}
                      onBlur={() => handleSaveLabel(version.id)}
                    />
                  ) : version.label ? (
                    <div className="vh-item-label">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>label</span>
                      {version.label}
                    </div>
                  ) : null}
                  <div className="vh-item-meta">
                    {version.elements?.length || 0} element{version.elements?.length !== 1 ? 's' : ''}
                    {version.pages?.length > 0 ? ` \u00B7 ${version.pages.length} page${version.pages.length !== 1 ? 's' : ''}` : ''}
                  </div>
                </div>
                <div className="vh-item-actions">
                  <button
                    className="vh-action-btn"
                    title={version.label ? 'Edit label' : 'Add label'}
                    onClick={() => {
                      setEditingLabelId(version.id);
                      setEditLabelValue(version.label || '');
                    }}
                  >
                    <span className="material-symbols-outlined">label</span>
                  </button>
                  <button
                    className="vh-action-btn restore"
                    title="Restore this version"
                    onClick={() => setConfirmRestore(version)}
                  >
                    <span className="material-symbols-outlined">restore</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm restore dialog */}
      {confirmRestore && (
        <div className="vh-confirm-overlay" onClick={() => !isRestoring && setConfirmRestore(null)}>
          <div className="vh-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="vh-confirm-title">Restore version?</div>
            <div className="vh-confirm-text">
              Your current state will be saved as a snapshot before restoring.
              {confirmRestore.label && (
                <>
                  <br />
                  <br />
                  Restoring: <strong>{confirmRestore.label}</strong>
                </>
              )}
              {confirmRestore.timestamp && (
                <>
                  {!confirmRestore.label && <><br /><br /></>}
                  {confirmRestore.label ? ' — ' : 'Restoring: '}
                  {timeAgo(confirmRestore.timestamp)}
                </>
              )}
            </div>
            <div className="vh-confirm-actions">
              <button
                className="vh-confirm-cancel"
                onClick={() => setConfirmRestore(null)}
                disabled={isRestoring}
              >
                Cancel
              </button>
              <button
                className="vh-confirm-restore"
                onClick={() => handleRestore(confirmRestore)}
                disabled={isRestoring}
              >
                {isRestoring ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VersionHistory;
