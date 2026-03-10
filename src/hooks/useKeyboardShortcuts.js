import { useEffect, useContext } from 'react';
import { EditableContext } from '../context/EditableContext';
import { AutoSaveContext } from '../context/AutoSaveContext';
import { useToast } from '../context/ToastContext';
import { projectStorage } from '../utils/storageManager';

export default function useKeyboardShortcuts({ onToggleHelp } = {}) {
  const { undo, redo, copyElement, pasteElement, copiedElement, selectedElement, setSelectedElement, elements, handleRemoveElement, updateStyles, selectedElementIds, clearSelection } = useContext(EditableContext);
  const { forceSave } = useContext(AutoSaveContext);
  const { showToast } = useToast();

  useEffect(() => {
    const handler = (e) => {
      // Don't intercept when user is typing in an input/textarea/select
      const tag = e.target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.target.isContentEditable) return;

      // ? — toggle keyboard shortcuts help
      if (e.key === '?' && onToggleHelp) {
        e.preventDefault();
        onToggleHelp();
        return;
      }

      // Escape — deselect current element
      if (e.key === 'Escape' && selectedElement) {
        e.preventDefault();
        setSelectedElement(null);
        return;
      }

      // Arrow keys — nudge positioned elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElement) {
        const el = elements.find(el => el.id === selectedElement.id);
        const pos = el?.styles?.position;
        if (pos === 'relative' || pos === 'absolute' || pos === 'fixed') {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const top = parseInt(el.styles.top || '0', 10);
          const left = parseInt(el.styles.left || '0', 10);
          if (e.key === 'ArrowUp') updateStyles(selectedElement.id, { top: (top - step) + 'px' });
          if (e.key === 'ArrowDown') updateStyles(selectedElement.id, { top: (top + step) + 'px' });
          if (e.key === 'ArrowLeft') updateStyles(selectedElement.id, { left: (left - step) + 'px' });
          if (e.key === 'ArrowRight') updateStyles(selectedElement.id, { left: (left + step) + 'px' });
          return;
        }
      }

      // Delete/Backspace — handle multi-select or single select
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        const el = elements.find(el => el.id === selectedElement.id);
        if (el?.settings?.locked || el?.configuration?.locked) return;
        e.preventDefault();
        if (selectedElementIds.length > 1) {
          // Delete all selected elements
          selectedElementIds.forEach(id => handleRemoveElement(id));
          clearSelection();
        } else {
          handleRemoveElement(selectedElement.id);
        }
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 's') {
        // Ctrl+S — force save
        e.preventDefault();
        const websiteSettings = projectStorage.getWebsiteSettings();
        forceSave(elements, websiteSettings);
        showToast('Changes saved', 'success');
      } else if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'c' && selectedElement) {
        e.preventDefault();
        copyElement(selectedElement.id);
      } else if (e.key === 'd' && selectedElement) {
        // Ctrl+D — duplicate selected element
        e.preventDefault();
        copyElement(selectedElement.id);
        const parentId = selectedElement.parentId || null;
        const siblings = elements.filter(el => el.parentId === parentId);
        const idx = siblings.findIndex(el => el.id === selectedElement.id);
        pasteElement(parentId, idx >= 0 ? idx + 1 : 0);
      } else if (e.key === 'v' && copiedElement) {
        e.preventDefault();
        const parentId = selectedElement?.parentId || null;
        let insertIndex;
        if (selectedElement) {
          const siblings = elements.filter(el => el.parentId === parentId);
          const selectedIdx = siblings.findIndex(el => el.id === selectedElement.id);
          insertIndex = selectedIdx >= 0 ? selectedIdx + 1 : siblings.length;
        } else {
          // No selection — paste at end of root elements
          const rootElements = elements.filter(el => !el.parentId);
          insertIndex = rootElements.length;
        }
        pasteElement(parentId, insertIndex);
      } else if (e.key === 'a') {
        // Ctrl+A — select root element (first element with no parentId)
        e.preventDefault();
        const rootElement = elements.find(el => !el.parentId);
        if (rootElement) {
          setSelectedElement({ id: rootElement.id, type: rootElement.type });
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, copyElement, pasteElement, copiedElement, selectedElement, setSelectedElement, handleRemoveElement, elements, updateStyles, forceSave, showToast, selectedElementIds, clearSelection, onToggleHelp]);
}
