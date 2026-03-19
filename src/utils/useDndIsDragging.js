import { useDragLayer } from 'react-dnd';

/**
 * Shared hook that exposes whether any DnD drag operation is in progress.
 * Replaces the identical useDragLayer call duplicated across 13+ section components.
 */
export const useDndIsDragging = () => {
  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));
  return isDragging;
};
