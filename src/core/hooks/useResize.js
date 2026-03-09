import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for element resize via drag handles.
 * Returns { size, handleMouseDown, isResizing } where handleMouseDown
 * should be called with a handle position string (e.g. 'se', 'e', 'n').
 */
const useResize = ({ initialWidth, initialHeight, onResize, minWidth = 20, minHeight = 20 }) => {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isResizing, setIsResizing] = useState(false);
  const startRef = useRef(null);

  // Sync with external size changes
  useEffect(() => {
    setSize({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight]);

  const handleMouseDown = useCallback((position, e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      position,
    };
  }, [size]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const start = startRef.current;
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      let newWidth = start.width;
      let newHeight = start.height;

      // Horizontal resize
      if (start.position.includes('e')) newWidth = Math.max(minWidth, start.width + dx);
      if (start.position.includes('w')) newWidth = Math.max(minWidth, start.width - dx);

      // Vertical resize
      if (start.position.includes('s')) newHeight = Math.max(minHeight, start.height + dy);
      if (start.position.includes('n')) newHeight = Math.max(minHeight, start.height - dy);

      setSize({ width: newWidth, height: newHeight });
      onResize?.({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      startRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, minHeight, onResize]);

  return { size, handleMouseDown, isResizing };
};

export default useResize;
