import { useContext } from 'react';
import { EditableContext } from '../context/EditableContext';

/**
 * Shared hook for interactive element components.
 * Handles element lookup, JSON content parsing, selection, and content updates.
 */
export const useInteractiveElement = (id, type) => {
  const { selectedElement, setSelectedElement, updateContent, elements } = useContext(EditableContext);

  const element = elements.find((el) => el.id === id);
  const isSelected = selectedElement?.id === id;

  // Parse JSON content safely
  let data = null;
  const raw = element?.content;
  if (raw) {
    if (typeof raw === 'object') {
      data = raw;
    } else if (typeof raw === 'string') {
      try { data = JSON.parse(raw); } catch { data = raw; }
    }
  }

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedElement(element || { id, type });
  };

  const updateData = (newData) => {
    updateContent(id, typeof newData === 'object' ? JSON.stringify(newData) : newData);
  };

  return {
    element,
    data,
    styles: element?.styles || {},
    isSelected,
    handleSelect,
    updateData,
  };
};
