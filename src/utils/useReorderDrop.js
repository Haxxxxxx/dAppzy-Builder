import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useReorderDrop = (findElementById, elements, setElements) => {
    const [activeDrop, setActiveDrop] = useState({ containerId: null, index: null });
    const [draggedId, setDraggedId] = useState(null);
    const [isInternalDrag, setIsInternalDrag] = useState(false); // new state
  
    const onDragStart = (e, id) => {
      e.stopPropagation();
      setDraggedId(id);
      setIsInternalDrag(true); // Mark as internal drag explicitly
      e.dataTransfer.setData("text/plain", id);
    };
  
    const onDragOver = (e, containerId, index) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveDrop({ containerId, index });
    };
  
    const onDrop = (e, containerId) => {
      e.preventDefault();
      e.stopPropagation();
  
      const id = draggedId || e.dataTransfer.getData("text/plain");
      if (!id) return;
  
      const dropIndex = activeDrop.index;
      if (dropIndex === null) {
        setActiveDrop({ containerId: null, index: null });
        return;
      }
  
      const oldContainer = elements.find(el => el.children?.includes(id));
      if (!oldContainer) {
        resetDrag();
        return;
      }
  
      if (oldContainer.id === containerId) {
        const newChildren = [...oldContainer.children];
        const originalIndex = newChildren.indexOf(id);
        newChildren.splice(originalIndex, 1);
        const correctedIndex = originalIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newChildren.splice(correctedIndex, 0, id);
  
        setElements(prev =>
          prev.map(el =>
            el.id === containerId ? { ...el, children: newChildren } : el
          )
        );
      } else {
        const newChildren = [...elements.find(el => el.id === containerId).children];
        newChildren.splice(dropIndex, 0, id);
  
        setElements(prev =>
          prev.map(el => {
            if (el.id === oldContainer.id) return { ...el, children: el.children.filter(childId => childId !== id) };
            if (el.id === containerId) return { ...el, children: newChildren };
            return el;
          })
        );
      }
  
      resetDrag();
    };
  
    const onDragEnd = () => resetDrag();
  
    const resetDrag = () => {
      setActiveDrop({ containerId: null, index: null });
      setDraggedId(null);
      setIsInternalDrag(false);
    };
  
    return { activeDrop, draggedId, isInternalDrag, onDragStart, onDragOver, onDrop, onDragEnd };
  };
  
  export default useReorderDrop;
  
