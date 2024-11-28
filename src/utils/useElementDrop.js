import { useDrop } from 'react-dnd';

const useElementDrop = ({ id, elementRef, onDropItem }) => {
  const [{ isOverCurrent, canDrop }, drop] = useDrop({
    accept: 'ELEMENT',
    drop: (item, monitor) => {
      const hoverBoundingRect = elementRef.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!hoverBoundingRect || !clientOffset) return;

      // Ensure the drop happens only if the mouse is inside this element
      const isInside =
        clientOffset.x >= hoverBoundingRect.left &&
        clientOffset.x <= hoverBoundingRect.right &&
        clientOffset.y >= hoverBoundingRect.top &&
        clientOffset.y <= hoverBoundingRect.bottom;

      if (isInside) {
        onDropItem(item, id);
      }
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return { isOverCurrent, canDrop, drop };
};

export default useElementDrop;
