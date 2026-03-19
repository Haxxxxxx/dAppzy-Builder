import { useDrop } from 'react-dnd';
import React, { useContext } from 'react';
import { ALL_DROPPABLE_TYPES } from '../core/elementRegistry';
import { isDescendantOf, getDropPosition, DROP_REJECTION_REASONS } from './dndUtils';
import { useToast } from '../context/ToastContext';
import { EditableContext } from '../context/EditableContext';

const useElementDrop = ({ id, elementRef, onDropItem }) => {
  const { showToast } = useToast();
  const { elements } = useContext(EditableContext);
  const [{ isOverCurrent, canDrop }, drop] = useDrop(() => ({
    accept: ALL_DROPPABLE_TYPES,
    drop: (item, monitor) => {
      // If a nested drop target already handled the drop, do nothing
      if (monitor.didDrop()) return;

      // Circular reference guard: block dropping a container into its own descendant
      if (item.id && id && elements) {
        if (isDescendantOf(item.id, id, elements)) {
          if (import.meta.env.DEV) console.warn('[DnD] Blocked: cannot drop element into its own descendant');
          showToast(DROP_REJECTION_REASONS.CIRCULAR, 'info');
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
        // Transform saved block items into a normal element config so container
        // drop handlers (which call addNewElement(item.type, ...)) work correctly.
        let resolvedItem = item;
        if (item.type === 'savedBlock' && item.blockElements) {
          const blockEls = item.blockElements;
          const rootEl = blockEls.find(el => !el.parentId || !blockEls.some(b => b.id === el.parentId));
          if (rootEl) {
            const buildBlockConfig = (el, depth = 0) => {
              if (depth > 20) return { type: el.type, styles: el.styles || {}, content: el.content || '', children: [] };
              const config = { ...el };
              delete config.id;
              delete config.parentId;
              if (el.children && el.children.length > 0) {
                config.children = el.children
                  .map(childId => blockEls.find(b => b.id === childId))
                  .filter(Boolean)
                  .map(child => buildBlockConfig(child, depth + 1));
              } else {
                config.children = [];
              }
              return config;
            };
            resolvedItem = buildBlockConfig(rootEl);
          }
        }

        // Call onDropItem with the item, index, and position information
        onDropItem(resolvedItem, dropIndex, {
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

      // Evaluate bounds (side-effect only — react-dnd ignores hover return values)
      getDropPosition(elementRef, monitor);
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [id, onDropItem, elementRef, elements, showToast]);

  return { isOverCurrent, canDrop, drop };
};

export default useElementDrop;
