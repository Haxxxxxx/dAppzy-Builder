import { useEffect, useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

export default function useKeyboardShortcuts() {
  const { undo, redo, copyElement, pasteElement, copiedElement, selectedElement, elements } = useContext(EditableContext);

  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Don't intercept when user is typing in an input/textarea
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

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
  }, [undo, redo, copyElement, pasteElement, copiedElement, selectedElement]);
}
