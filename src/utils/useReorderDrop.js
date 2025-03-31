// src/utils/useReorderDrop.js
import { useState } from 'react';

const useReorderDrop = (findElementById, elements, setElements) => {
  // activeDrop holds the container id and index where the drop placeholder should appear.
  const [activeDrop, setActiveDrop] = useState({ containerId: null, index: null });
  // Track the id of the dragged element.
  const [draggedId, setDraggedId] = useState(null);

  const onDragStart = (e, id) => {
    e.stopPropagation();
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);

    // Create a custom drag image (if needed)
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.padding = '4px 8px';
    dragImage.style.background = '#fff';
    dragImage.style.border = '1px solid #ccc';
    dragImage.style.fontSize = 'inherit';
    dragImage.innerHTML = e.currentTarget.innerHTML;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(
      dragImage,
      dragImage.offsetWidth / 2,
      dragImage.offsetHeight / 2
    );
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const onDragOver = (e, containerId, index) => {
    e.preventDefault();
    e.stopPropagation();

    const container = findElementById(containerId, elements);
    if (container && container.children) {
      // Prevent showing a drop placeholder above the first element when it is being dragged.
      if (container.children[0] === draggedId && index === 0) {
        return;
      }
      // Prevent showing a drop placeholder below the last element when it is being dragged.
      if (
        container.children[container.children.length - 1] === draggedId &&
        index === container.children.length
      ) {
        return;
      }
    }

    // Only update if we are hovering over a new container or position.
    if (activeDrop.containerId !== containerId || activeDrop.index !== index) {
      setActiveDrop({ containerId, index });
    }
  };

  const onDrop = (e, containerId) => {
    e.preventDefault();
    e.stopPropagation();
    const id = draggedId || e.dataTransfer.getData('text/plain');
    if (!id) return;
    const container = findElementById(containerId, elements);
    if (!container) return;
    let dropIndex = activeDrop.index;
    if (dropIndex === null) return;

    // Determine the original index of the dragged element in the container (if it exists).
    const originalIndex = container.children.indexOf(id);
    // Remove the dragged element from its original position.
    const newChildren = container.children.filter(childId => childId !== id);
    // If the dragged element was originally before the drop index, adjust the index.
    if (originalIndex !== -1 && originalIndex < dropIndex) {
      dropIndex = dropIndex - 1;
    }
    // Insert the dragged element at the new position.
    newChildren.splice(dropIndex, 0, id);

    setElements(prev =>
      prev.map(el =>
        el.id === containerId ? { ...el, children: newChildren } : el
      )
    );
    // Reset drop state.
    setActiveDrop({ containerId: null, index: null });
    setDraggedId(null);
  };

  const onDragEnd = () => {
    // Clear the drop state and the dragged element id when drag ends.
    setActiveDrop({ containerId: null, index: null });
    setDraggedId(null);
  };

  return { activeDrop, draggedId, onDragStart, onDragOver, onDrop, onDragEnd };
};

export default useReorderDrop;
