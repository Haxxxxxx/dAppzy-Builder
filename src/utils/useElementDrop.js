import { useDrop } from 'react-dnd';
import React from 'react';
import { ALL_DROPPABLE_TYPES } from '../core/elementRegistry';
import { isDescendantOf } from './dndUtils';

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

      // Get the drop target's position
      const dropTargetRect = elementRef.current?.getBoundingClientRect();
      if (!dropTargetRect) return;

      // Calculate the drop position relative to the target
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const relativeY = clientOffset.y - dropTargetRect.top;
      const relativeX = clientOffset.x - dropTargetRect.left;

      // Determine if the drop is within the target's bounds
      const isWithinBounds = 
        relativeX >= 0 && 
        relativeX <= dropTargetRect.width && 
        relativeY >= 0 && 
        relativeY <= dropTargetRect.height;

      // Calculate precise drop index by walking actual DOM children
      let dropIndex = 0;
      const containerEl = elementRef.current;
      if (containerEl) {
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
          targetRect: dropTargetRect,
          isWithinBounds,
          dropIndex
        });
      }
    },
    hover: (item, monitor) => {
      // If a nested drop target is handling the hover, do nothing
      if (monitor.didDrop()) return;

      // Get the drop target's position
      const dropTargetRect = elementRef.current?.getBoundingClientRect();
      if (!dropTargetRect) return;

      // Calculate the hover position relative to the target
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const relativeY = clientOffset.y - dropTargetRect.top;
      const relativeX = clientOffset.x - dropTargetRect.left;

      // Determine if the hover is within the target's bounds
      const isWithinBounds = 
        relativeX >= 0 && 
        relativeX <= dropTargetRect.width && 
        relativeY >= 0 && 
        relativeY <= dropTargetRect.height;

      return isWithinBounds;
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [id, onDropItem, elementRef, elements]);

  return { isOverCurrent, canDrop, drop };
};

export default useElementDrop;
