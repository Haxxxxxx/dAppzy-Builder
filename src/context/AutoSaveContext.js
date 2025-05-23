import React, { createContext, useState, useEffect, useCallback } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import debounce from 'lodash/debounce';

export const AutoSaveContext = createContext();

export const AutoSaveProvider = ({ children, userId: propUserId, projectId: propProjectId }) => {
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
  const [saveQueue, setSaveQueue] = useState([]);

  // Validate IDs are present
  useEffect(() => {
    if (!userId || !projectId) {
      console.warn('Missing required IDs:', { 
        userId: userId || 'missing', 
        projectId: projectId || 'missing',
        urlParams: getUrlParams(),
        propUserId,
        propProjectId
      });
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
    if (['navbar', 'hero', 'footer', 'ContentSection', 'cta', 'defiSection'].includes(element.type)) {
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
    const { id, type, styles, content, children, configuration, settings } = element;
    // Clean and optimize the data
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

  // Process save queue
  const processSaveQueue = useCallback(async () => {
    if (saveQueue.length === 0 || isSaving) return;

    const nextSave = saveQueue[0];
    if (!nextSave) return;

    try {
      setIsSaving(true);
      setSaveStatus('Saving changes...');

      const { elements, websiteSettings } = nextSave;

      // Validate and optimize elements
      const validElements = elements
        .filter(validateElement)
        .map(optimizeElementForStorage)
        .filter(element => Object.keys(element).length > 0);

      // Skip save if no valid elements
      if (validElements.length === 0) {
        console.warn('No valid elements to save');
        setSaveQueue(prev => prev.slice(1));
        setSaveStatus('Skipped save - invalid data');
        return;
      }

      // Clean website settings
      const cleanWebsiteSettings = removeUndefined(websiteSettings || {});

      // First, clear any existing chunks
      const existingChunks = parseInt(localStorage.getItem('editableElements_chunks') || '0');
      for (let i = 0; i < existingChunks * 50; i += 50) {
        localStorage.removeItem(`editableElements_chunk_${i}`);
      }

      // Save to localStorage in chunks to prevent UI blocking
      const chunkSize = 50;
      for (let i = 0; i < validElements.length; i += chunkSize) {
        const chunk = validElements.slice(i, i + chunkSize);
        await new Promise(resolve => setTimeout(resolve, 0));
        localStorage.setItem(`editableElements_chunk_${i}`, JSON.stringify(chunk));
      }
      localStorage.setItem('editableElements_chunks', Math.ceil(validElements.length / chunkSize));
      localStorage.setItem('websiteSettings', JSON.stringify(cleanWebsiteSettings));

      // Save to Firestore
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      await setDoc(projectRef, {
        elements: validElements,
        websiteSettings: cleanWebsiteSettings,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      setLastSaved(new Date());
      setSaveStatus('All changes saved');
      setPendingChanges(false);
      setSaveQueue(prev => prev.slice(1)); // Remove processed save
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('Error saving changes - will retry with clean data');
      
      // Remove the failed save attempt from the queue to prevent infinite retries
      setSaveQueue(prev => prev.slice(1));
      
      // Log detailed error information for debugging
      console.warn('Save failed with the following data:', {
        elementsCount: nextSave?.elements?.length,
        websiteSettingsKeys: nextSave?.websiteSettings ? Object.keys(nextSave.websiteSettings) : [],
        error: error.message
      });
    } finally {
      setIsSaving(false);
    }
  }, [saveQueue, isSaving, userId, projectId]);

  // Process queue whenever it changes
  useEffect(() => {
    if (saveQueue.length > 0) {
      processSaveQueue();
    }
  }, [saveQueue, processSaveQueue]);

  // Debounced save function
  const debouncedSaveContent = useCallback(
    debounce((elements, websiteSettings) => {
      if (!userId || !projectId) {
        console.warn('Save aborted: missing userId or projectId', { 
          userId, 
          projectId,
          urlParams: getUrlParams(),
          propUserId,
          propProjectId
        });
        setSaveStatus('Cannot save: Missing user or project ID');
        return;
      }

      // Add to save queue instead of saving immediately
      setSaveQueue(prev => [...prev, { elements, websiteSettings }]);
    }, 3000),
    [userId, projectId, propUserId, propProjectId]
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSaveContent.cancel();
    };
  }, [debouncedSaveContent]);

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