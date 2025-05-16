import { useDrop } from 'react-dnd';
import React from 'react';

const useElementDrop = ({ id, elementRef, onDropItem }) => {
  // Define all possible element types that can be dropped
  const acceptedTypes = [
    // Layout elements
    'navbar', 'hero', 'cta', 'section', 'footer', 'defiSection', 'mintingSection',
    // Basic elements
    'div', 'span', 'p', 'heading', 'button', 'image', 'link',
    // Form elements
    'form', 'input', 'textarea', 'select', 'label',
    // List elements
    'ul', 'ol', 'li',
    // Media elements
    'video', 'youtubevideo', 'bgvideo',
    // Web3 elements
    'defiModule', 'mintingSection', 'candymachine',
    // Typography elements
    'blockquote', 'code', 'pre', 'caption',
    // Other elements
    'container', 'gridlayout', 'hflexlayout', 'vflexlayout'
  ];

  const [{ isOverCurrent, canDrop }, drop] = useDrop(() => ({
    accept: acceptedTypes,
    drop: (item, monitor) => {
      // If a nested drop target already handled the drop, do nothing
      if (monitor.didDrop()) return;

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

      // Calculate the drop index based on position
      const dropIndex = Math.floor(relativeY / (dropTargetRect.height / (dropTargetRect.children?.length || 1)));

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

      // Update cursor style based on whether we can drop
      if (isWithinBounds) {
        document.body.style.cursor = 'copy';
      } else {
        document.body.style.cursor = 'not-allowed';
      }

      return isWithinBounds;
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [id, onDropItem, elementRef]);

  // Clean up cursor style when component unmounts
  React.useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  return { isOverCurrent, canDrop, drop };
};

export default useElementDrop;
