import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import debounce from 'lodash/debounce';
import { LAYOUT_TYPES_WITH_CHILDREN } from '../constants/elementTypes';
import { useToast } from './ToastContext';

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
  const latestPendingSave = useRef(null);
  const userIdRef = useRef(userId);
  const projectIdRef = useRef(projectId);
  userIdRef.current = userId;
  projectIdRef.current = projectId;

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
    
    // Check for undefined values in styles
    const hasValidStyles = Object.entries(element.styles || {}).every(([_, value]) => value !== undefined);
    
    // Layout-specific validation
    if (LAYOUT_TYPES_WITH_CHILDREN.includes(element.type)) {
      return hasValidStructure && Array.isArray(element.children) && hasValidStyles;
    }
    
    return hasValidStructure && hasValidStyles;
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

  // Optimize elements for storage by removing unnecessary data
  const optimizeElementForStorage = (element) => {
    const { id, type, styles, content, children, configuration, settings, isConfigured } = element;
    
    // If this is a configured element, ensure we only save it once
    if (isConfigured) {
      // Clean and optimize the data
      const optimizedElement = removeUndefined({
        id,
        type,
        styles: styles || {},
        content: content || '',
        children: children || [],
        configuration: configuration || {},
        settings: settings || {},
        isConfigured: true,
        ...(element.structure && { structure: element.structure }),
        ...(element.part && { part: element.part }),
        ...(element.layout && { layout: element.layout }),
        ...(element.parentId && { parentId: element.parentId })
      });

      return optimizedElement;
    }

    // For non-configured elements, proceed as normal
    const optimizedElement = removeUndefined({
      id,
      type,
      styles: styles || {},
      content: content || '',
      children: children || [],
      configuration: configuration || {},
      settings: settings || {},
      ...(element.structure && { structure: element.structure }),
      ...(element.part && { part: element.part }),
      ...(element.layout && { layout: element.layout }),
      ...(element.parentId && { parentId: element.parentId })
    });

    return optimizedElement;
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

      const { elements, websiteSettings } = nextSave;

      // Validate and optimize elements, ensuring configured elements are handled properly
      const validElements = elements
        .filter(validateElement)
        .map(optimizeElementForStorage)
        .filter(element => Object.keys(element).length > 0);

      // Remove duplicate configured elements
      const uniqueElements = validElements.reduce((acc, element) => {
        if (element.isConfigured) {
          // Check if we already have this configured element
          const existingIndex = acc.findIndex(e => 
            e.isConfigured && 
            e.type === element.type && 
            e.configuration === element.configuration
          );
          if (existingIndex === -1) {
            acc.push(element);
          }
        } else {
          acc.push(element);
        }
        return acc;
      }, []);

      // Skip save if no valid elements
      if (uniqueElements.length === 0) {
        setSaveStatus('Skipped save - invalid data');
        return;
      }

      // Clean website settings
      const cleanWebsiteSettings = removeUndefined(websiteSettings || {});

      // Save to localStorage in chunks to prevent UI blocking.
      // Write new chunks FIRST, then clean up old ones to prevent data loss on crash.
      const chunkSize = 50;
      const oldChunkCount = parseInt(localStorage.getItem('editableElements_chunks') || '0');
      const newChunkCount = Math.ceil(uniqueElements.length / chunkSize);

      for (let i = 0; i < uniqueElements.length; i += chunkSize) {
        const chunk = uniqueElements.slice(i, i + chunkSize);
        await new Promise(resolve => setTimeout(resolve, 0));
        localStorage.setItem(`editableElements_chunk_${i}`, JSON.stringify(chunk));
      }
      localStorage.setItem('editableElements_chunks', newChunkCount);
      localStorage.setItem('websiteSettings', JSON.stringify(cleanWebsiteSettings));

      // Remove leftover old chunks that exceed the new count
      for (let i = newChunkCount * chunkSize; i < oldChunkCount * chunkSize; i += chunkSize) {
        localStorage.removeItem(`editableElements_chunk_${i}`);
      }

      // Save to Firestore with retry (keep localStorage chunks as fallback — they'll be
      // overwritten by the next save, so no explicit deletion needed)
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      const maxRetries = 3;
      let retries = 0;
      while (retries < maxRetries) {
        try {
          await setDoc(projectRef, {
            elements: uniqueElements,
            websiteSettings: cleanWebsiteSettings,
            lastUpdated: serverTimestamp()
          }, { merge: true });
          break; // success
        } catch (firestoreError) {
          retries++;
          if (retries >= maxRetries) {
            console.error('[AutoSave] Firestore save failed after retries:', firestoreError);
            showToast('Failed to save after multiple attempts. Your changes are cached locally.', 'error');
            setSaveStatus('Failed to save — changes cached locally');
            return;
          }
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
        }
      }

      setLastSaved(new Date());
      setSaveStatus('All changes saved');
      setPendingChanges(false);
    } catch (error) {
      console.error('[AutoSave] Save failed:', error);
      setSaveStatus('Error saving changes - will retry with clean data');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, userId, projectId]);

  // Re-trigger save processing when isSaving clears and there's a pending save
  useEffect(() => {
    if (!isSaving && latestPendingSave.current) {
      processSaveQueue();
    }
  }, [isSaving, processSaveQueue]);

  // Debounced save function — reads userId/projectId from refs to keep stable deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveContent = useCallback(
    debounce((elements, websiteSettings) => {
      if (!userIdRef.current || !projectIdRef.current) {
        setSaveStatus('Cannot save: Missing user or project ID');
        return;
      }

      // Replace pending save with latest state (no queue growth)
      latestPendingSave.current = { elements, websiteSettings };
      processSaveQueue();
    }, 3000),
    []
  );

  // Save content wrapper that uses debounced function
  const saveContent = useCallback((elements, websiteSettings) => {
    setPendingChanges(true);
    setSaveStatus('Changes pending...');
    debouncedSaveContent(elements, websiteSettings);
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

  const value = {
    saveStatus,
    lastSaved,
    isSaving,
    pendingChanges,
    saveContent,
    markPendingChanges
  };

  return (
    <AutoSaveContext.Provider value={value}>
      {children}
    </AutoSaveContext.Provider>
  );
}; 