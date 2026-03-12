import { useDrop } from 'react-dnd';
import React from 'react';
import { ALL_DROPPABLE_TYPES } from '../core/elementRegistry';
import { isDescendantOf, getDropPosition } from './dndUtils';

const useElementDrop = ({ id, elementRef, onDropItem, elements }) => {
  const [{ isOverCurrent, canDrop }, drop] = useDrop(() => ({
    accept: ALL_DROPPABLE_TYPES,
    drop: (item, monitor) => {
      // If a nested drop target already handled the drop, do nothing
      if (monitor.didDrop()) return;

      // Circular reference guard: block dropping a container into its own descendant
      if (item.id && id && elements) {
        if (isDescendantOf(item.id, id, elements)) {
          console.warn('[DnD] Blocked: cannot drop element into its own descendant');
          return;
        }
      }

      // Use shared bounds-checking utility
      const pos = getDropPosition(elementRef, monitor);
      if (!pos) return;

      const { relativeX, relativeY, isWithinBounds, targetRect } = pos;

      // Calculate precise drop index by walking actual DOM children
      let dropIndex = 0;
      const containerEl = elementRef.current;
      if (containerEl) {
        const clientOffset = monitor.getClientOffset();
        const children = Array.from(containerEl.children).filter(child =>
          !child.dataset?.dropIndicator && !child.classList?.contains('drop-insertion-line')
        );
        for (let i = 0; i < children.length; i++) {
          const childRect = children[i].getBoundingClientRect();
          const midY = childRect.top + childRect.height / 2;
          if (clientOffset.y < midY) { dropIndex = i; break; }
          dropIndex = i + 1;
        }
      }

      if (isWithinBounds) {
        // Call onDropItem with the item, index, and position information
        onDropItem(item, dropIndex, {
          x: relativeX,
          y: relativeY,
          targetRect,
          isWithinBounds,
          dropIndex
        });
      }
    },
    hover: (item, monitor) => {
      // If a nested drop target is handling the hover, do nothing
      if (monitor.didDrop()) return;

      // Use shared bounds-checking utility
      const pos = getDropPosition(elementRef, monitor);
      if (!pos) return false;
      return pos.isWithinBounds;
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [id, onDropItem, elementRef, elements]);

  return { isOverCurrent, canDrop, drop };
};

export default useElementDrop;
