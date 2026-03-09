import { useContext, useMemo } from 'react';
import { EditableContext } from '../../context/EditableContext';

/**
 * Hook that returns the correct styles object and update function
 * based on the current styleEditingMode (normal / hover / focus).
 *
 * Editors can use this instead of directly calling updateStyles
 * to automatically support hover/focus state editing.
 */
const useStyleEditor = () => {
  const {
    selectedElement,
    updateStyles,
    updateStateStyles,
    styleEditingMode,
  } = useContext(EditableContext);

  const currentStyles = useMemo(() => {
    if (!selectedElement) return {};
    if (styleEditingMode === 'hover') return selectedElement.hoverStyles || {};
    if (styleEditingMode === 'focus') return selectedElement.focusStyles || {};
    return selectedElement.styles || {};
  }, [selectedElement, styleEditingMode]);

  const applyStyles = (id, newStyles) => {
    if (styleEditingMode === 'normal') {
      updateStyles(id, newStyles);
    } else {
      updateStateStyles(id, styleEditingMode, newStyles);
    }
  };

  return {
    selectedElement,
    currentStyles,
    applyStyles,
    styleEditingMode,
  };
};

export default useStyleEditor;
