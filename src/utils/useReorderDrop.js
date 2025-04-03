import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // or use any ID generator you have

const useReorderDrop = (findElementById, elements, setElements, addNewElement) => {
  // activeDrop holds the container id + index for drop placeholder
  const [activeDrop, setActiveDrop] = useState({ containerId: null, index: null });
  // Track the id of the element being dragged
  const [draggedId, setDraggedId] = useState(null);

  const onDragStart = (e, id) => {
    e.stopPropagation();
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);

    // Optionally create a custom ghost/drag image
    const dragImage = document.createElement("div");
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.left = "-1000px";
    dragImage.style.padding = "4px 8px";
    dragImage.style.background = "#fff";
    dragImage.style.border = "1px solid #ccc";
    dragImage.style.fontSize = "inherit";
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
    if (!container) return;

    // For cleaner UX, optionally skip placeholders if user is dragging within same spot
    // ... your existing checks for skipping placeholder ...
    if (activeDrop.containerId !== containerId || activeDrop.index !== index) {
      setActiveDrop({ containerId, index });
    }
  };

  const onDrop = (e, containerId) => {
    e.preventDefault();
    e.stopPropagation();
    const id = draggedId || e.dataTransfer.getData("text/plain");
    if (!id) return;

    const newContainer = findElementById(containerId, elements);
    if (!newContainer) return;

    let dropIndex = activeDrop.index;
    if (dropIndex === null) return;

    // 1) Find which container the dragged element originally belongs to:
    const oldContainer = elements.find(el => el.children?.includes(id));

    // 2) If there's no "oldContainer," it may mean the item is brand-new from a side panel
    //    or the ID was never in a parent. You might treat that as a "new element" case or do nothing.
    if (!oldContainer) {
      // handle brand-new items from left bar, or skip
      // or treat them the same as the "different container" path
      // ...
      return;
    }

    // 3) If the user dropped into the SAME container, just reorder the existing element.
    if (oldContainer.id === containerId) {
      // Reorder logic
      const newChildren = [...newContainer.children];
      const originalIndex = newChildren.indexOf(id);

      // Remove the dragged element from its old position
      newChildren.splice(originalIndex, 1);
      // Adjust dropIndex if removing the old item shifts the list
      const correctedIndex = originalIndex < dropIndex ? dropIndex - 1 : dropIndex;

      // Insert at the new position
      newChildren.splice(correctedIndex, 0, id);

      setElements(prev =>
        prev.map(el =>
          el.id === containerId ? { ...el, children: newChildren } : el
        )
      );
    } else {
      // 4) If the user dropped it into a DIFFERENT container, we create a *new copy*.
      //    a) Find the original element
      const draggedElement = findElementById(id, elements);
      if (!draggedElement) return;

      //    b) Create a new ID (e.g. with `uuidv4` or your own `generateUniqueId`)
      const newId = uuidv4();

      //    c) Clone the old element's data but with a fresh id
      const clonedElement = {
        ...draggedElement,
        id: newId,
        // If you want to keep the same children, do so. If you want a shallow copy, reset them:
        children: [],
        // If you want slightly different labeling or settings, update them here
      };

      //    d) Add the *new element* to the global state
      setElements(prev => [...prev, clonedElement]);

      //    e) Insert that new element's ID in the new container’s children at dropIndex
      const newChildren = [...newContainer.children];
      newChildren.splice(dropIndex, 0, newId);

      setElements(prev =>
        prev.map(el =>
          el.id === containerId
            ? { ...el, children: newChildren }
            : el
        )
      );

      // (Optional) If you want to leave the original element in oldContainer, do nothing more.
      // If you want to *remove* the original from oldContainer, then do:
      // setElements(prev =>
      //   prev.map(el =>
      //     el.id === oldContainer.id
      //       ? { ...el, children: el.children.filter(c => c !== id) }
      //       : el
      //   )
      // );
    }

    // Clear drop state
    setActiveDrop({ containerId: null, index: null });
    setDraggedId(null);
  };

  const onDragEnd = () => {
    setActiveDrop({ containerId: null, index: null });
    setDraggedId(null);
  };

  return { activeDrop, draggedId, onDragStart, onDragOver, onDrop, onDragEnd };
};

export default useReorderDrop;
