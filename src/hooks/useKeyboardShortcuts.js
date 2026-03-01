import { useEffect, useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

export default function useKeyboardShortcuts() {
  const { undo, redo, copyElement, pasteElement, copiedElement, selectedElement } = useContext(EditableContext);

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
        pasteElement(selectedElement?.parentId || null, 0);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, copyElement, pasteElement, copiedElement, selectedElement]);
}
