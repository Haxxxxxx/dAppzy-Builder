import { useRef, useCallback } from 'react';

export function useDebouncedStyle(updateStyles, delay = 50) {
  const timeoutRef = useRef(null);
  const debouncedUpdate = useCallback((id, styles) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => updateStyles(id, styles), delay);
  }, [updateStyles, delay]);
  return debouncedUpdate;
}
