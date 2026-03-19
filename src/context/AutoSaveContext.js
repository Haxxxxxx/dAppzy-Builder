import React, { createContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
function debounce(fn, delay) {
  let timer;
  let pendingArgs;
  let pendingThis;
  const debounced = function (...args) {
    pendingArgs = args;
    pendingThis = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(pendingThis, pendingArgs);
      pendingArgs = undefined;
      pendingThis = undefined;
    }, delay);
  };
  debounced.flush = () => {
    clearTimeout(timer);
    if (pendingArgs !== undefined) {
      fn.apply(pendingThis, pendingArgs);
      pendingArgs = undefined;
      pendingThis = undefined;
    }
  };
  debounced.cancel = () => {
    clearTimeout(timer);
    pendingArgs = undefined;
    pendingThis = undefined;
  };
  return debounced;
}
import { LAYOUT_TYPES } from '../constants/elementTypes';
import { useToast } from './ToastContext';
import { saveVersion } from '../services/versionService';

export const AutoSaveContext = createContext();

export const AutoSaveProvider = ({ children, userId: propUserId, projectId: propProjectId }) => {
  const { showToast } = useToast();
  // Get URL parameters as fallback
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      urlUserId: params.get('userId'),
      urlProjectId: params.get('projectId')
    };
  };

  // Use props or URL parameters
  const { urlUserId, urlProjectId } = getUrlParams();
  const userId = propUserId || urlUserId;
  const projectId = propProjectId || urlProjectId;

  const [saveStatus, setSaveStatus] = useState('All changes saved');
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);
  const latestPendingSave = useRef(null);
  const lastFailedSave = useRef(null);
  const userIdRef = useRef(userId);
  const projectIdRef = useRef(projectId);
  userIdRef.current = userId;
  projectIdRef.current = projectId;

  // Version history: throttle automatic snapshots to at most once every 5 minutes
  const VERSION_SAVE_INTERVAL_MS = 5 * 60 * 1000;
  const lastVersionSaveTimeRef = useRef(0);

  // Validate IDs are present
  useEffect(() => {
    if (!userId || !projectId) {
      setSaveStatus('Cannot save: Missing user or project ID');
    }
  }, [userId, projectId, propUserId, propProjectId]);

  // Validate element structure before saving
  const validateElement = (element) => {
    if (!element) return false;

    // Basic structure validation
    const hasValidStructure = element.id &&
                            element.type &&
                            typeof element.styles === 'object';

    // Layout-specific validation
    if (LAYOUT_TYPES.includes(element.type)) {
      return hasValidStructure && Array.isArray(element.children);
    }

    return hasValidStructure;
  };

  // Remove undefined values from an object recursively
  const removeUndefined = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => removeUndefined(item)).filter(item => item !== undefined);
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, removeUndefined(value)])
      );
    }
    return obj;
  };

  // Optimize elements for storage by removing unnecessary data.
  // Instead of whitelisting specific fields (which drops any newly-added
  // properties like hoverStyles, focusStyles, breakpointStyles, moduleType,
  // label, src, href, alt, etc.), we start from the full element and only
  // strip known transient/runtime-only keys.
  const optimizeElementForStorage = (element) => {
    // Keys that are purely runtime state and should never be persisted
    const TRANSIENT_KEYS = new Set([
      '_dragPreview',
      '_dropTarget',
      '_isHovered',
      '_isSelected',
      '_renderKey',
    ]);

    const optimized = {};
    for (const [key, value] of Object.entries(element)) {
      if (TRANSIENT_KEYS.has(key)) continue;
      if (value === undefined) continue;
      optimized[key] = value;
    }

    // Ensure essential fields always have sensible defaults,
    // and strip any undefined values from styles instead of rejecting the element
    optimized.styles = Object.fromEntries(
      Object.entries(optimized.styles || {}).filter(([_, v]) => v !== undefined)
    );
    optimized.content = optimized.content ?? '';
    optimized.children = optimized.children || [];
    optimized.configuration = optimized.configuration ?? null;
    optimized.settings = optimized.settings || {};
    optimized.parentId = optimized.parentId ?? null;

    return removeUndefined(optimized);
  };

  // Process the latest pending save (replaces unbounded queue)
  const processSaveQueue = useCallback(async () => {
    if (!latestPendingSave.current || isSaving) return;

    // Grab and clear the pending save atomically
    const nextSave = latestPendingSave.current;
    latestPendingSave.current = null;

    try {
      setIsSaving(true);
      setSaveStatus('Saving changes...');

      const { elements, websiteSettings, pages } = nextSave;

      // Validate and optimize elements, ensuring configured elements are handled properly
      const validElements = elements
        .filter(validateElement)
        .map(optimizeElementForStorage)
        .filter(element => Object.keys(element).length > 0);

      // Skip save if no valid elements and no pages
      if (validElements.length === 0 && (!pages || pages.length === 0)) {
        setSaveStatus('Skipped save - invalid data');
        return;
      }

      // Clean website settings
      const cleanWebsiteSettings = removeUndefined(websiteSettings || {});

      // Optimize pages array for storage — each page's elements get the same treatment
      const cleanPages = (pages && pages.length > 0) ? pages.map(page => ({
        id: page.id,
        name: page.name,
        slug: page.slug,
        elements: (page.elements || [])
          .filter(validateElement)
          .map(optimizeElementForStorage)
          .filter(el => Object.keys(el).length > 0),
      })) : undefined;

      // Save to Firestore with retry
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      const maxRetries = 3;
      let retries = 0;
      while (retries < maxRetries) {
        try {
          const saveData = {
            elements: validElements,
            websiteSettings: cleanWebsiteSettings,
            lastUpdated: serverTimestamp()
          };
          // Only persist pages if multi-page is being used (more than 1 page)
          if (cleanPages) {
            saveData.pages = cleanPages;
          }
          await setDoc(projectRef, saveData, { merge: true });
          break; // success
        } catch (firestoreError) {
          retries++;
          if (retries >= maxRetries) {
            if (import.meta.env.DEV) console.error('[AutoSave] Firestore save failed after retries:', firestoreError);
            showToast('Failed to save after multiple attempts. Please check your connection.', 'error');
            setSaveStatus('Save failed — click retry');
            setHasSaveError(true);
            lastFailedSave.current = nextSave;
            return;
          }
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
        }
      }

      setLastSaved(new Date());
      setSaveStatus('All changes saved');
      setPendingChanges(false);
      setHasSaveError(false);
      lastFailedSave.current = null;

      // Automatically save a version snapshot if enough time has elapsed
      const now = Date.now();
      if (now - lastVersionSaveTimeRef.current >= VERSION_SAVE_INTERVAL_MS) {
        lastVersionSaveTimeRef.current = now;
        saveVersion(userId, projectId, validElements, cleanPages || [], cleanWebsiteSettings)
          .catch(err => {
            if (import.meta.env.DEV) console.warn('[AutoSave] Version snapshot failed:', err);
          });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('[AutoSave] Save failed:', error);
      setSaveStatus('Error saving changes - will retry with clean data');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, userId, projectId]);

  // Keep a ref to processSaveQueue so the debounced function always calls the
  // latest version without needing to be re-created when its deps change.
  const processSaveQueueRef = useRef(processSaveQueue);
  processSaveQueueRef.current = processSaveQueue;

  // Re-trigger save processing when isSaving clears and there's a pending save
  useEffect(() => {
    if (!isSaving && latestPendingSave.current) {
      processSaveQueue();
    }
  }, [isSaving, processSaveQueue]);

  // Debounced save function — reads userId/projectId from refs to keep stable deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveContent = useCallback(
    debounce((elements, websiteSettings, pages) => {
      if (!userIdRef.current || !projectIdRef.current) {
        setSaveStatus('Cannot save: Missing user or project ID');
        return;
      }

      // Replace pending save with latest state (no queue growth)
      latestPendingSave.current = { elements, websiteSettings, pages };
      processSaveQueueRef.current();
    }, 3000),
    []
  );

  // Save content wrapper that uses debounced function
  const saveContent = useCallback((elements, websiteSettings, pages) => {
    setPendingChanges(true);
    setSaveStatus('Changes pending...');
    debouncedSaveContent(elements, websiteSettings, pages);
  }, [debouncedSaveContent]);

  // Mark that there are pending changes
  const markPendingChanges = useCallback(() => {
    setPendingChanges(true);
    setSaveStatus('Changes pending...');
  }, []);

  // Flush pending saves on tab close/navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      debouncedSaveContent.flush();
      if (pendingChanges || latestPendingSave.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      debouncedSaveContent.flush();
    };
  }, [debouncedSaveContent, pendingChanges]);

  // Force an immediate save by flushing the debounced function
  const forceSave = useCallback((elements, websiteSettings, pages) => {
    if (!userIdRef.current || !projectIdRef.current) {
      setSaveStatus('Cannot save: Missing user or project ID');
      return;
    }
    setPendingChanges(true);
    setSaveStatus('Saving changes...');
    debouncedSaveContent(elements, websiteSettings, pages);
    debouncedSaveContent.flush();
  }, [debouncedSaveContent]);

  // Retry the last failed save
  const retrySave = useCallback(() => {
    if (!lastFailedSave.current) return;
    setHasSaveError(false);
    setSaveStatus('Retrying save...');
    latestPendingSave.current = lastFailedSave.current;
    lastFailedSave.current = null;
    processSaveQueue();
  }, [processSaveQueue]);

  // Memoize context value to prevent re-rendering ALL consumers (ContentList,
  // ExportSection, WebsiteInfo, useKeyboardShortcuts) on every render of this provider.
  // Without this, every setSaveStatus call creates a new object, triggering
  // ContentList re-render which re-renders the ENTIRE element tree.
  const value = useMemo(() => ({
    saveStatus,
    lastSaved,
    isSaving,
    pendingChanges,
    hasSaveError,
    saveContent,
    forceSave,
    retrySave,
    markPendingChanges
  }), [saveStatus, lastSaved, isSaving, pendingChanges, hasSaveError, saveContent, forceSave, retrySave, markPendingChanges]);

  return (
    <AutoSaveContext.Provider value={value}>
      {children}
    </AutoSaveContext.Provider>
  );
}; 