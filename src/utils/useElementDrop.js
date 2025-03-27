import { useDrop } from 'react-dnd';

const useElementDrop = ({ id, elementRef, onDropItem }) => {
  const [{ isOverCurrent, canDrop }, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    drop: (item, monitor) => {
      // If a nested drop target already handled the drop, do nothing
      if (monitor.didDrop()) return;
      // Only drop if the pointer is over this element (shallow check)
      if (monitor.isOver({ shallow: true })) {
        onDropItem(item, id);
      }
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [id, onDropItem]);

  return { isOverCurrent, canDrop, drop };
};

export default useElementDrop;
