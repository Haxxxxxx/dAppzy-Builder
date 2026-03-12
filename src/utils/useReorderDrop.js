import { useState, useCallback, useRef, useEffect } from "react";
import { isDescendantOf } from "./dndUtils";

/**
 * Enhanced reorder-drop hook with precise insertion-point detection.
 *
 * Instead of dividing the container height equally (broken for varying-height
 * children), we now walk the actual DOM children, measure their midpoints,
 * and find the closest gap the cursor is near.  The hook exposes a
 * `dropIndicatorIndex` that consuming components use to render a visual
 * insertion line.
 */
const useReorderDrop = (findElementById, elements, setElements) => {
  const [activeDrop, setActiveDrop] = useState({ containerId: null, index: null });
  const [draggedId, setDraggedId] = useState(null);
  const [isInternalDrag, setIsInternalDrag] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSource, setDragSource] = useState(null);
  const [isLayoutReplacement, setIsLayoutReplacement] = useState(false);
  const [targetLayoutId, setTargetLayoutId] = useState(null);
  // Precise visual indicator: which gap (0 = before first child, n = after nth child)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState(null);
  const [dropIndicatorContainerId, setDropIndicatorContainerId] = useState(null);

  const resetDrag = useCallback(() => {
    setActiveDrop({ containerId: null, index: null });
    setDraggedId(null);
    setIsInternalDrag(false);
    setIsDragging(false);
    setDragSource(null);
    setIsLayoutReplacement(false);
    setTargetLayoutId(null);
    setDropIndicatorIndex(null);
    setDropIndicatorContainerId(null);
  }, []);

  // ── Drag start ──────────────────────────────────────────────────────
  const onDragStart = useCallback((e, id, sourceContainerId, isReplacement = false, layoutId = null) => {
    e.stopPropagation();
    setDraggedId(id);
    setIsInternalDrag(true);
    setIsDragging(true);
    setDragSource(sourceContainerId);
    setIsLayoutReplacement(isReplacement);
    setTargetLayoutId(layoutId);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";

    // Create a subtle drag image
    if (e.target) {
      const rect = e.target.getBoundingClientRect();
      e.dataTransfer.setDragImage(e.target, rect.width / 2, 20);
    }

    if (isReplacement && layoutId) {
      e.dataTransfer.setData("application/layout-replacement", JSON.stringify({
        targetLayoutId: layoutId
      }));
    }
  }, []);

  // ── Precise index from cursor Y ────────────────────────────────────
  // Walk the container's direct DOM children and find which gap the
  // cursor is closest to.
  const getInsertionIndex = useCallback((containerEl, clientY, draggedElementId) => {
    if (!containerEl) return 0;

    const children = Array.from(containerEl.children).filter(child => {
      // Skip non-element nodes and the insertion indicator itself
      if (child.dataset?.dropIndicator) return false;
      if (child.classList?.contains('drop-insertion-line')) return false;
      // Skip the element being dragged (it will be removed from source)
      if (child.id === draggedElementId) return false;
      return true;
    });

    if (children.length === 0) return 0;

    // Walk children top-to-bottom; find the first child whose vertical
    // midpoint is below the cursor → insert before that child.
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (clientY < midY) return i;
    }

    // Cursor is below all children → insert at end
    return children.length;
  }, []);

  // ── Drag over ──────────────────────────────────────────────────────
  const onDragOver = useCallback((e, containerId, _index, isLayoutTarget = false, containerRef = null) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    if (isLayoutTarget && isLayoutReplacement) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }

    // Calculate precise insertion index from DOM
    const containerEl = containerRef?.current || document.getElementById(containerId);
    const index = containerEl
      ? getInsertionIndex(containerEl, e.clientY, draggedId)
      : (_index ?? 0);

    setActiveDrop({ containerId, index });
    setDropIndicatorIndex(index);
    setDropIndicatorContainerId(containerId);
  }, [isDragging, isLayoutReplacement, getInsertionIndex, draggedId]);

  // ── Drop ───────────────────────────────────────────────────────────
  const onDrop = useCallback((e, containerId) => {
    e.preventDefault();
    e.stopPropagation();

    // Check for layout replacement
    const layoutReplacementData = e.dataTransfer.getData("application/layout-replacement");
    if (layoutReplacementData) {
      try {
        JSON.parse(layoutReplacementData);
        resetDrag();
        return; // Handled by LayoutReplacementBoundary
      } catch {
        // Ignore malformed data
      }
    }

    const id = draggedId || e.dataTransfer.getData("text/plain");
    if (!id) { resetDrag(); return; }

    const dropIndex = activeDrop.index;
    if (dropIndex === null) { resetDrag(); return; }

    const sourceContainer = elements.find(el => Array.isArray(el.children) && el.children.includes(id));
    if (!sourceContainer) { resetDrag(); return; }

    const targetContainer = elements.find(el => el.id === containerId);
    if (!targetContainer) { resetDrag(); return; }

    if (activeDrop.containerId === containerId) {
      const oldIndex = sourceContainer.children.indexOf(id);

      // Build new children arrays immutably
      const isSameContainer = sourceContainer.id === targetContainer.id;

      if (!isSameContainer) {
        // Circular reference check: prevent dragging a container into its own descendant
        if (isDescendantOf(id, targetContainer.id, elements)) {
          console.warn('[DnD] Blocked: cannot drop element into its own descendant');
          resetDrag();
          return;
        }
      }

      // Build the new state for both same-container and cross-container cases,
      // then apply a single setElements call at the end.
      let newSourceChildren = null; // only set for cross-container
      let newTargetChildren;
      let updatedParentId = null;   // only set for cross-container

      if (isSameContainer) {
        // Same container: remove from old position then insert at new position
        const without = [...targetContainer.children];
        without.splice(oldIndex, 1);
        const adjustedIndex = dropIndex > oldIndex ? dropIndex - 1 : dropIndex;
        without.splice(adjustedIndex, 0, id);
        newTargetChildren = without;
      } else {
        // Different container: remove from source, insert into target, update parentId
        newSourceChildren = sourceContainer.children.filter(c => c !== id);
        newTargetChildren = [...(targetContainer.children || [])];
        const insertAt = Math.min(dropIndex, newTargetChildren.length);
        newTargetChildren.splice(insertAt, 0, id);
        updatedParentId = targetContainer.id;
      }

      // Single setElements call handles both same-container and cross-container cases
      setElements(prev => prev.map(el => {
        if (el.id === targetContainer.id) {
          return { ...el, children: newTargetChildren };
        }
        if (!isSameContainer) {
          if (el.id === sourceContainer.id) {
            return { ...el, children: newSourceChildren };
          }
          if (el.id === id) {
            return { ...el, parentId: updatedParentId };
          }
        }
        return el;
      }));
    }

    resetDrag();
  }, [draggedId, activeDrop, elements, setElements, resetDrag]);

  // ── Drag end / leave ───────────────────────────────────────────────
  const onDragEnd = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    resetDrag();
  }, [resetDrag]);

  const onDragLeave = useCallback((e) => {
    // Only reset if we actually left the container (not entering a child)
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;
    setDropIndicatorIndex(null);
    setDropIndicatorContainerId(null);
  }, []);

  // Safety: reset drag state if native dragend fires anywhere (prevents stuck opacity)
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      if (isDragging) resetDrag();
    };
    document.addEventListener('dragend', handleGlobalDragEnd);
    return () => document.removeEventListener('dragend', handleGlobalDragEnd);
  }, [isDragging, resetDrag]);

  return {
    activeDrop,
    isDragging,
    dragSource,
    draggedId,
    isLayoutReplacement,
    targetLayoutId,
    dropIndicatorIndex,
    dropIndicatorContainerId,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDragLeave,
    resetDrag,
  };
};

export default useReorderDrop;
