import React, { createContext, useState, useEffect, useCallback } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import debounce from 'lodash/debounce';

export const AutoSaveContext = createContext();

export const AutoSaveProvider = ({ children, userId, projectId }) => {
  const [saveStatus, setSaveStatus] = useState('All changes saved');
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [saveQueue, setSaveQueue] = useState([]);

  // Validate element structure before saving
  const validateElement = (element) => {
    if (!element) return false;
    
    // Basic structure validation
    const hasValidStructure = element.id && 
                            element.type && 
                            typeof element.styles === 'object';
    
    // Layout-specific validation
    if (['navbar', 'hero', 'footer', 'ContentSection', 'cta', 'defiSection'].includes(element.type)) {
      return hasValidStructure && Array.isArray(element.children);
    }
    
    return hasValidStructure;
  };

  // Optimize elements for storage by removing unnecessary data
  const optimizeElementForStorage = (element) => {
    const { id, type, styles, content, children, configuration, settings } = element;
    // Ensure we preserve all necessary layout data
    return {
      id,
      type,
      styles: styles || {},
      content: content || '',
      children: children || [],
      configuration: configuration || {},
      settings: settings || {},
      // Preserve layout-specific properties
      ...(element.structure && { structure: element.structure }),
      ...(element.part && { part: element.part }),
      ...(element.layout && { layout: element.layout }),
      ...(element.parentId && { parentId: element.parentId })
    };
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
      const validElements = elements.filter(validateElement).map(optimizeElementForStorage);

      // First, clear any existing chunks
      const existingChunks = parseInt(localStorage.getItem('editableElements_chunks') || '0');
      for (let i = 0; i < existingChunks * 50; i += 50) {
        localStorage.removeItem(`editableElements_chunk_${i}`);
      }

      // Save to localStorage in chunks to prevent UI blocking
      const chunkSize = 50;
      for (let i = 0; i < validElements.length; i += chunkSize) {
        const chunk = validElements.slice(i, i + chunkSize);
        await new Promise(resolve => setTimeout(resolve, 0)); // Yield to main thread
        localStorage.setItem(`editableElements_chunk_${i}`, JSON.stringify(chunk));
      }
      localStorage.setItem('editableElements_chunks', Math.ceil(validElements.length / chunkSize));
      localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));

      // Save to Firestore
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      await setDoc(projectRef, {
        elements: validElements,
        websiteSettings,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      setLastSaved(new Date());
      setSaveStatus('All changes saved');
      setPendingChanges(false);
      setSaveQueue(prev => prev.slice(1)); // Remove processed save
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('Error saving changes');
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
        console.log('Save aborted: missing userId or projectId', { userId, projectId });
        return;
      }

      // Add to save queue instead of saving immediately
      setSaveQueue(prev => [...prev, { elements, websiteSettings }]);
    }, 3000), // Increased debounce time to reduce save frequency
    [userId, projectId]
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