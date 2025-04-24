import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const useReorderDrop = (findElementById, elements, setElements) => {
    const [activeDrop, setActiveDrop] = useState({ containerId: null, index: null });
    const [draggedId, setDraggedId] = useState(null);
    const [isInternalDrag, setIsInternalDrag] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Cleanup function to reset drag state
    const resetDrag = () => {
        setActiveDrop({ containerId: null, index: null });
        setDraggedId(null);
        setIsInternalDrag(false);
        setIsDragging(false);
    };

    // Add cleanup on unmount
    useEffect(() => {
        return () => {
            resetDrag();
        };
    }, []);

    const onDragStart = (e, id) => {
        e.stopPropagation();
        setDraggedId(id);
        setIsInternalDrag(true);
        setIsDragging(true);
        e.dataTransfer.setData("text/plain", id);
    };

    const onDragOver = (e, containerId, index) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) return;
        setActiveDrop({ containerId, index });
    };

    const onDrop = (e, containerId) => {
        e.preventDefault();
        e.stopPropagation();

        const id = draggedId || e.dataTransfer.getData("text/plain");
        if (!id) {
            resetDrag();
            return;
        }

        const dropIndex = activeDrop.index;
        if (dropIndex === null) {
            resetDrag();
            return;
        }

        const oldContainer = elements.find(el => el.children?.includes(id));
        if (!oldContainer) {
            resetDrag();
            return;
        }

        // Only proceed with the drop if we're actually over a valid target
        if (activeDrop.containerId === containerId) {
            const newContainer = elements.find(el => el.id === containerId);
            if (newContainer) {
                const oldIndex = oldContainer.children.indexOf(id);
                oldContainer.children.splice(oldIndex, 1);

                if (dropIndex >= newContainer.children.length) {
                    newContainer.children.push(id);
                } else {
                    newContainer.children.splice(dropIndex, 0, id);
                }

                setElements([...elements]);
            }
        }

        resetDrag();
    };

    const onDragEnd = () => {
        resetDrag();
    };

    return {
        activeDrop,
        isDragging,
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
        resetDrag
    };
};

export default useReorderDrop;
  
