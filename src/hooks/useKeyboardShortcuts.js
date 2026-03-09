import { useEffect, useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

export default function useKeyboardShortcuts() {
  const { undo, redo, copyElement, pasteElement, copiedElement, selectedElement, elements, handleRemoveElement } = useContext(EditableContext);

  useEffect(() => {
    const handler = (e) => {
      // Don't intercept when user is typing in an input/textarea/select
      const tag = e.target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.target.isContentEditable) return;

      // Delete/Backspace — no modifier needed
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        handleRemoveElement(selectedElement.id);
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'c' && selectedElement) {
        e.preventDefault();
        copyElement(selectedElement.id);
      } else if (e.key === 'v' && copiedElement) {
        e.preventDefault();
        const parentId = selectedElement?.parentId || null;
        // Paste after the selected element's position among its siblings
        const siblings = elements.filter(el => el.parentId === parentId);
        const selectedIdx = siblings.findIndex(el => el.id === selectedElement?.id);
        const insertIndex = selectedIdx >= 0 ? selectedIdx + 1 : 0;
        pasteElement(parentId, insertIndex);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, copyElement, pasteElement, copiedElement, selectedElement, handleRemoveElement, elements]);
}
